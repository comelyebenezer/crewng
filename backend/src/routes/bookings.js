// backend/src/routes/bookings.js
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { sendBookingConfirmation } = require('../utils/email')

const router = express.Router()
const prisma = new PrismaClient()

const PRICE_RANGES = {
  WAITER: { min: 10500, max: 100000 },
  WAITRESS: { min: 10500, max: 100000 },
  HOST: { min: 15000, max: 200000 },
  HOSTESS: { min: 15000, max: 200000 },
  BOUNCER: { min: 15000, max: 200000 },
  COORDINATOR: { min: 30000, max: 10000000 },
  EVENT_PLANNER: { min: 100000, max: 20000000 },
  BIKINI_GIRL: { min: 15000, max: 200000 },
  DANCER: { min: 15000, max: 200000 },
  PARTY_STARTER: { min: 15000, max: 200000 },
}

// POST /api/bookings — Create a booking
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      workerId, dates, eventName, eventType, location,
      startTime, endTime, outfit, notes,
      bookerName, bookerPhone, bookerEmail,
      payAmount, payMethod,
    } = req.body

    if (!workerId || !dates?.length || !eventName || !location || !bookerName || !bookerPhone || !payAmount) {
      return res.status(400).json({ error: 'Missing required booking fields.' })
    }

    // Validate worker exists and is verified
    const worker = await prisma.user.findUnique({
      where: { id: workerId },
      include: { profile: { select: { isPublic: true, ninVerified: true, fullName: true } } },
    })
    if (!worker) return res.status(404).json({ error: 'Professional not found.' })
    if (!worker.profile?.isPublic || worker.profile?.ninVerified !== 'VERIFIED') {
      return res.status(400).json({ error: 'This professional is not yet verified.' })
    }

    // Validate pay amount against price range
    const range = PRICE_RANGES[worker.primaryRole]
    if (range && payAmount < range.min) {
      return res.status(400).json({ error: `Pay amount must be at least ₦${range.min.toLocaleString()} for ${worker.primaryRole.toLowerCase().replace('_', ' ')}s.` })
    }

    // Check worker not already booked on these dates (non-super: 1 event/day)
    if (!worker.isSuper) {
      const parsedDates = dates.map(d => new Date(d))
      const conflicts = await prisma.bookedDate.findMany({
        where: { userId: workerId, date: { in: parsedDates } },
      })
      if (conflicts.length > 0) {
        const conflictDates = conflicts.map(c => c.date.toISOString().split('T')[0])
        return res.status(409).json({ error: `Already booked on: ${conflictDates.join(', ')}` })
      }
    } else {
      // Super users: max 3 active bookings at a time
      const activeCount = await prisma.booking.count({
        where: { workerId, status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
      })
      if (activeCount >= 3) return res.status(409).json({ error: 'This coordinator has reached the 3-booking limit.' })
    }

    const totalAmount = payAmount * dates.length

    // Create booking + block dates in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          workerId,
          bookerId: req.user.id,
          eventName,
          eventType: eventType || null,
          location,
          startTime: startTime || '09:00',
          endTime: endTime || '18:00',
          outfit: outfit || null,
          notes: notes || null,
          bookerName,
          bookerPhone,
          bookerEmail,
          payAmount,
          totalPaid: totalAmount,
          payMethod: payMethod || 'card',
          status: 'CONFIRMED',
        },
      })

      // Block the worker's calendar
      await tx.bookedDate.createMany({
        data: dates.map(d => ({
          userId: workerId,
          bookingId: b.id,
          date: new Date(d),
          startTime: startTime || '09:00',
          endTime: endTime || '18:00',
        })),
      })

      // Hold payment in wallet (in real app, Paystack handles this)
      await tx.wallet.update({
        where: { userId: req.user.id },
        data: { heldBalance: { increment: totalAmount } },
      })

      // Send notification to worker
      await tx.notification.create({
        data: {
          userId: workerId,
          title: 'You have a new booking! 🎉',
          body: `${bookerName} has booked you for "${eventName}" on ${dates.join(', ')}. Pay: ₦${payAmount.toLocaleString()} per day.`,
          type: 'BOOKING',
          data: { bookingId: b.id },
        },
      })

      return b
    })

    // Send confirmation email
    try {
      await sendBookingConfirmation(bookerEmail, {
        eventName, location,
        dates: dates.join(', '),
        workerName: worker.profile?.fullName,
        ref: booking.id.slice(-8).toUpperCase(),
      })
    } catch (e) { /* email failure shouldn't break booking */ }

    res.status(201).json({
      message: 'Booking confirmed!',
      booking: {
        id: booking.id,
        ref: booking.id.slice(-8).toUpperCase(),
        status: booking.status,
        totalAmount,
        dates,
      },
    })
  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({ error: 'Booking failed. Please try again.' })
  }
})

// GET /api/bookings — Get my bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ bookerId: req.user.id }, { workerId: req.user.id }],
      },
      include: {
        worker: { include: { profile: { select: { fullName: true, featuredPhoto: true } } } },
        booker: { include: { profile: { select: { fullName: true } } } },
        bookedDates: true,
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load bookings.' })
  }
})

// GET /api/bookings/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        worker: { include: { profile: true } },
        booker: { include: { profile: { select: { fullName: true } } } },
        bookedDates: true,
        ratings: { include: { giver: { include: { profile: { select: { fullName: true } } } } } },
      },
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found.' })
    if (booking.bookerId !== req.user.id && booking.workerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' })
    }
    res.json({ booking })
  } catch {
    res.status(500).json({ error: 'Failed to load booking.' })
  }
})

// POST /api/bookings/:id/rate — Rate after event
router.post('/:id/rate', requireAuth, async (req, res) => {
  try {
    const { score, comment } = req.body
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Score must be between 1 and 5.' })

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    if (!booking) return res.status(404).json({ error: 'Booking not found.' })

    const isBooker = req.user.id === booking.bookerId
    const isWorker = req.user.id === booking.workerId
    if (!isBooker && !isWorker) return res.status(403).json({ error: 'Not part of this booking.' })

    const receiverId = isBooker ? booking.workerId : booking.bookerId

    await prisma.$transaction(async (tx) => {
      await tx.rating.create({
        data: { bookingId: booking.id, giverId: req.user.id, receiverId, score, comment },
      })
      if (isBooker) await tx.booking.update({ where: { id: booking.id }, data: { bookerRated: true } })
      if (isWorker) await tx.booking.update({ where: { id: booking.id }, data: { workerRated: true } })

      const updated = await tx.booking.findUnique({ where: { id: booking.id } })
      if (updated.workerRated && updated.bookerRated && !updated.paymentReleased) {
        // Release payment to worker wallet
        const totalAmount = updated.payAmount * (await tx.bookedDate.count({ where: { bookingId: booking.id } }))
        await tx.wallet.update({
          where: { userId: booking.workerId },
          data: { balance: { increment: totalAmount }, totalEarned: { increment: totalAmount } },
        })
        await tx.booking.update({ where: { id: booking.id }, data: { paymentReleased: true, status: 'COMPLETED' } })
        await tx.notification.create({
          data: {
            userId: booking.workerId,
            title: '💰 Payment Released!',
            body: `₦${totalAmount.toLocaleString()} has been added to your wallet for "${booking.eventName}".`,
            type: 'PAYMENT',
            data: { bookingId: booking.id },
          },
        })
      }
    })

    res.json({ message: 'Rating submitted. Payment will release once both parties rate.' })
  } catch (err) {
    console.error('Rating error:', err)
    res.status(500).json({ error: 'Failed to submit rating.' })
  }
})

// POST /api/bookings/:id/cancel — Cancel booking (coordinator only)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    if (!booking) return res.status(404).json({ error: 'Booking not found.' })

    const booker = await prisma.user.findUnique({ where: { id: booking.bookerId } })
    if (booking.bookerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the person who booked can cancel.' })
    }
    if (!booker.isSuper && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only coordinators and event planners can cancel bookings.' })
    }
    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking.' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookedDate.deleteMany({ where: { bookingId: booking.id } })
      await tx.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } })

      // Track cancellation
      await tx.cancellation.create({ data: { userId: req.user.id, bookingId: booking.id, reason: req.body.reason } })

      // Check cancellation count (3 in 30 days = suspension)
      const recentCancels = await tx.cancellation.count({
        where: { userId: req.user.id, cancelledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      })
      if (recentCancels >= 3) {
        await tx.notification.create({
          data: {
            userId: req.user.id,
            title: '⚠️ Cancellation Warning',
            body: 'You have cancelled 3 bookings in 30 days. Further cancellations may result in account suspension.',
            type: 'SYSTEM',
          },
        })
      }

      // Notify worker
      await tx.notification.create({
        data: {
          userId: booking.workerId,
          title: 'Booking Cancelled',
          body: `Your booking for "${booking.eventName}" has been cancelled. You are now available on those dates.`,
          type: 'BOOKING',
          data: { bookingId: booking.id },
        },
      })
    })

    res.json({ message: 'Booking cancelled.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking.' })
  }
})

// GET /api/bookings/availability/:userId — Get booked dates for a user
router.get('/availability/:userId', async (req, res) => {
  try {
    const dates = await prisma.bookedDate.findMany({
      where: { userId: req.params.userId, isPublic: true },
      select: { date: true, startTime: true, endTime: true },
    })
    res.json({ bookedDates: dates.map(d => d.date.toISOString().split('T')[0]) })
  } catch {
    res.status(500).json({ error: 'Failed to load availability.' })
  }
})

module.exports = router

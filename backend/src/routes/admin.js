// backend/src/routes/admin.js
const express = require('express')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/auth')
const { sendVerificationResult } = require('../utils/email')

const router = express.Router()
const prisma = new PrismaClient()

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [users, pending, bookings, suspended] = await Promise.all([
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.profile.count({ where: { ninVerified: 'PENDING' } }),
      prisma.booking.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ])
    const wallets = await prisma.wallet.aggregate({ _sum: { totalEarned: true } })
    res.json({ users, pending, bookings, suspended, totalPaidOut: wallets._sum.totalEarned || 0 })
  } catch {
    res.status(500).json({ error: 'Failed to load stats.' })
  }
})

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query
    const where = { isAdmin: false }
    if (role) where.primaryRole = role.toUpperCase()
    if (status === 'Suspended') where.isBanned = true
    if (status === 'Active') where.isActive = true
    if (search) where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { profile: { fullName: { contains: search, mode: 'insensitive' } } },
    ]
    const users = await prisma.user.findMany({
      where,
      include: { profile: { select: { fullName: true, ninVerified: true, state: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    })
    const total = await prisma.user.count({ where })
    res.json({ users, total })
  } catch {
    res.status(500).json({ error: 'Failed to load users.' })
  }
})

router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        wallet: true,
        bookingsAsWorker: { take: 5, orderBy: { createdAt: 'desc' } },
        ratingsReceived: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found.' })
    // Never return NIN hash or encrypted bank details to client
    if (user.profile) delete user.profile.ninHash
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to load user.' })
  }
})

router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: true, banReason: reason } })
    await prisma.adminLog.create({
      data: { adminId: req.user.id, action: 'SUSPEND_USER', targetId: req.params.id, details: { reason } },
    })
    res.json({ message: 'User suspended.' })
  } catch {
    res.status(500).json({ error: 'Failed to suspend user.' })
  }
})

router.post('/users/:id/unsuspend', requireAdmin, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: false, banReason: null } })
    await prisma.adminLog.create({
      data: { adminId: req.user.id, action: 'UNSUSPEND_USER', targetId: req.params.id },
    })
    res.json({ message: 'User unsuspended.' })
  } catch {
    res.status(500).json({ error: 'Failed to unsuspend user.' })
  }
})

// ─── VERIFICATION QUEUE ───────────────────────────────────────────────────────
router.get('/verification/queue', requireAdmin, async (req, res) => {
  try {
    const pending = await prisma.profile.findMany({
      where: { ninVerified: { in: ['PENDING', 'FACE_SUBMITTED'] } },
      include: { user: { select: { id: true, email: true, primaryRole: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ queue: pending })
  } catch {
    res.status(500).json({ error: 'Failed to load verification queue.' })
  }
})

router.post('/verification/:userId/approve', requireAdmin, async (req, res) => {
  try {
    const profile = await prisma.profile.update({
      where: { userId: req.params.userId },
      data: { ninVerified: 'VERIFIED', ninVerifiedAt: new Date(), verifiedByAdmin: req.user.id, isPublic: true },
    })
    await prisma.adminLog.create({
      data: { adminId: req.user.id, action: 'VERIFY_USER', targetId: req.params.userId },
    })
    // Send email notification
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    try { await sendVerificationResult(user.email, true) } catch {}
    res.json({ message: 'User verified and profile is now live.' })
  } catch {
    res.status(500).json({ error: 'Failed to verify user.' })
  }
})

router.post('/verification/:userId/reject', requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    await prisma.profile.update({
      where: { userId: req.params.userId },
      data: { ninVerified: 'REJECTED' },
    })
    await prisma.adminLog.create({
      data: { adminId: req.user.id, action: 'REJECT_VERIFICATION', targetId: req.params.userId, details: { reason } },
    })
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    try { await sendVerificationResult(user.email, false, reason) } catch {}
    res.json({ message: 'Verification rejected.' })
  } catch {
    res.status(500).json({ error: 'Failed to reject verification.' })
  }
})

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
router.get('/bookings', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status.toUpperCase()
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        worker: { include: { profile: { select: { fullName: true } } } },
        booker: { include: { profile: { select: { fullName: true } } } },
        bookedDates: { select: { date: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    })
    const total = await prisma.booking.count({ where })
    res.json({ bookings, total })
  } catch {
    res.status(500).json({ error: 'Failed to load bookings.' })
  }
})

// ─── SUB ADMINS ───────────────────────────────────────────────────────────────
router.get('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, email: true, adminLevel: true, createdAt: true, profile: { select: { fullName: true } } },
    })
    res.json({ admins })
  } catch {
    res.status(500).json({ error: 'Failed to load admins.' })
  }
})

router.post('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, level } = req.body
    if (!name || !email || !password || !level) return res.status(400).json({ error: 'All fields required.' })

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return res.status(409).json({ error: 'Email already registered.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          primaryRole: 'COORDINATOR',
          roles: ['COORDINATOR'],
          isAdmin: true,
          adminLevel: level.toUpperCase(),
        },
      })
      await tx.profile.create({ data: { userId: u.id, fullName: name, location: '', state: '', ninHash: 'admin', isPublic: false } })
      await tx.wallet.create({ data: { userId: u.id } })
      return u
    })
    await prisma.adminLog.create({
      data: { adminId: req.user.id, action: 'CREATE_SUB_ADMIN', targetId: admin.id, details: { level } },
    })
    res.status(201).json({ message: 'Sub admin created.' })
  } catch {
    res.status(500).json({ error: 'Failed to create sub admin.' })
  }
})

router.delete('/admins/:id', requireSuperAdmin, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isAdmin: false, adminLevel: null },
    })
    res.json({ message: 'Admin removed.' })
  } catch {
    res.status(500).json({ error: 'Failed to remove admin.' })
  }
})

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    res.json({ notifications: notifs })
  } catch {
    res.status(500).json({ error: 'Failed to load notifications.' })
  }
})

router.post('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } })
    res.json({ message: 'All notifications marked as read.' })
  } catch {
    res.status(500).json({ error: 'Failed to mark notifications.' })
  }
})

module.exports = router

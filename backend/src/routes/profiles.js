// backend/src/routes/profiles.js
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/profiles — Browse all public profiles with filters
router.get('/', async (req, res) => {
  try {
    const { role, location, skinTone, minRating, available, date, sort, page = 1, limit = 20 } = req.query

    const where = {
      isPublic: true,
      ninVerified: 'VERIFIED',
    }
    if (location) where.state = { contains: location, mode: 'insensitive' }
    if (skinTone) where.skinTone = skinTone

    let profiles = await prisma.profile.findMany({
      where,
      include: {
        user: { select: { id: true, primaryRole: true, roles: true, isSuper: true } },
        photos: { orderBy: { order: 'asc' }, take: 5 },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    })

    // Filter by role (including multi-roles)
    if (role) {
      profiles = profiles.filter(p =>
        p.user.primaryRole === role.toUpperCase() ||
        p.user.roles.includes(role.toUpperCase())
      )
    }

    // Filter by availability on a specific date
    if (date) {
      const targetDate = new Date(date)
      const bookedUserIds = (await prisma.bookedDate.findMany({
        where: {
          date: {
            gte: new Date(new Date(targetDate).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(targetDate).setHours(23, 59, 59, 999)),
          },
        },
        select: { userId: true },
      })).map(b => b.userId)

      if (available === 'true') {
        profiles = profiles.filter(p => !bookedUserIds.includes(p.userId))
      } else {
        profiles = profiles.map(p => ({
          ...p,
          isAvailable: !bookedUserIds.includes(p.userId),
        }))
      }
    }

    // Sort
    if (sort === 'rating') profiles.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))

    res.json({ profiles, total: profiles.length, page: parseInt(page) })
  } catch (err) {
    console.error('Profiles fetch error:', err)
    res.status(500).json({ error: 'Failed to load profiles.' })
  }
})

// GET /api/profiles/:userId — Single profile
router.get('/:userId', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { userId: req.params.userId, isPublic: true },
      include: {
        user: { select: { id: true, primaryRole: true, roles: true, isSuper: true } },
        photos: { orderBy: { order: 'asc' } },
      },
    })
    if (!profile) return res.status(404).json({ error: 'Profile not found.' })

    // Get booked dates
    const bookedDates = await prisma.bookedDate.findMany({
      where: { userId: req.params.userId, isPublic: true },
      select: { date: true },
    })

    // Get ratings summary
    const ratings = await prisma.rating.findMany({
      where: { receiverId: req.params.userId },
      select: { score: true, comment: true, createdAt: true, giver: { select: { profile: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    const avgRating = ratings.length > 0
      ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      : 0

    res.json({
      profile,
      bookedDates: bookedDates.map(d => d.date.toISOString().split('T')[0]),
      ratings,
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalRatings: ratings.length,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' })
  }
})

// PUT /api/profiles/me — Update my profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { bio, height, skinTone, instagramHandle, xHandle, tiktokHandle, hotlineNumber } = req.body

    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        bio: bio || undefined,
        height: height || undefined,
        skinTone: skinTone || undefined,
        instagramHandle: instagramHandle || undefined,
        xHandle: xHandle || undefined,
        tiktokHandle: tiktokHandle || undefined,
        hotlineNumber: hotlineNumber || undefined,
      },
    })
    res.json({ message: 'Profile updated.', profile: updated })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' })
  }
})

// PUT /api/profiles/me/roles — Update my roles
router.put('/me/roles', requireAuth, async (req, res) => {
  try {
    const { roles } = req.body
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'At least one role required.' })
    }
    const upperRoles = roles.map(r => r.toUpperCase())
    await prisma.user.update({
      where: { id: req.user.id },
      data: { roles: upperRoles, primaryRole: upperRoles[0] },
    })
    res.json({ message: 'Roles updated. Changes go live after admin review.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update roles.' })
  }
})

module.exports = router

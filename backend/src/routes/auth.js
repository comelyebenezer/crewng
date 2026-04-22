// backend/src/routes/auth.js
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { encrypt } = require('../utils/encrypt')
const { sendResetEmail } = require('../utils/email')
const { requireAuth } = require('../middleware/auth')

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

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter'
  if (!/[0-9]/.test(pw)) return 'Password must include a number'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a special character (!@#$%^&*)'
  return null
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      email, password, primaryRole, roles, fullName, nin, phone, location,
      whatsapp, hotline, instagram, x, tiktok,
      bankName, accountNum, accountName,
    } = req.body

    if (!email || !password || !primaryRole || !fullName || !nin || !phone || !whatsapp) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const pwError = validatePassword(password)
    if (pwError) return res.status(400).json({ error: pwError })

    const isSuper = primaryRole === 'COORDINATOR' || primaryRole === 'EVENT_PLANNER'
    if (isSuper && (!instagram || !x)) {
      return res.status(400).json({ error: 'Instagram and X handles are required for coordinators and event planners.' })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return res.status(409).json({ error: 'Email already registered.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const ninHash = await bcrypt.hash(nin.replace(/\D/g, ''), 12)
    const bankNameEnc = bankName ? encrypt(bankName) : ''
    const accNumEnc = accountNum ? encrypt(accountNum) : ''
    const accNameEnc = accountName ? encrypt(accountName) : ''

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          primaryRole: primaryRole.toUpperCase(),
          roles: (roles || [primaryRole]).map(r => r.toUpperCase()),
          isSuper,
        },
      })
      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          location: location || '',
          state: location || '',
          ninHash,
          whatsappNumber: whatsapp,
          hotlineNumber: hotline || null,
          instagramHandle: instagram || null,
          xHandle: x || null,
          tiktokHandle: tiktok || null,
          isPublic: false,
        },
      })
      await tx.wallet.create({ data: { userId: user.id } })
      if (bankName && accountNum && accountName) {
        await tx.bankAccount.create({
          data: {
            userId: user.id,
            bankNameEncrypted: bankNameEnc,
            accountNumEncrypted: accNumEnc,
            accountNameEncrypted: accNameEnc,
          },
        })
      }
      return user
    })

    const token = signToken(newUser.id)
    res.status(201).json({
      message: 'Registration submitted! Profile will go live after NIN verification (within 24hrs).',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.primaryRole, isSuper },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: { select: { fullName: true, isPublic: true, ninVerified: true, featuredPhoto: true } },
        wallet: { select: { balance: true } },
      },
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    if (user.isBanned) return res.status(403).json({ error: 'Account suspended. Contact support.' })

    const token = signToken(user.id)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.primaryRole,
        roles: user.roles,
        name: user.profile?.fullName,
        photo: user.profile?.featuredPhoto,
        isSuper: user.isSuper,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        adminLevel: user.adminLevel,
        verified: user.profile?.ninVerified === 'VERIFIED',
        balance: user.wallet?.balance || 0,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed.' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required.' })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpiry },
    })

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    await sendResetEmail(email, resetLink)

    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to send reset email.' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and password required.' })

    const pwError = validatePassword(password)
    if (pwError) return res.status(400).json({ error: pwError })

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetExpiry: { gt: new Date() } },
    })
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' })

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpiry: null },
    })

    res.json({ message: 'Password updated. Please log in.' })
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed.' })
  }
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Current password is incorrect.' })
    }
    const pwError = validatePassword(newPassword)
    if (pwError) return res.status(400).json({ error: pwError })

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: { select: { fullName: true, isPublic: true, ninVerified: true, featuredPhoto: true, location: true, whatsappNumber: true } },
        wallet: { select: { balance: true, totalEarned: true } },
      },
    })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to fetch user.' })
  }
})

module.exports = router

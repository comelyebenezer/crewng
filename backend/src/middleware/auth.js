// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, primaryRole: true, roles: true, isSuper: true, isAdmin: true, isSuperAdmin: true, adminLevel: true, isActive: true, isBanned: true }
    })
    if (!user) return res.status(401).json({ error: 'User not found.' })
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated.' })
    if (user.isBanned) return res.status(403).json({ error: 'Account suspended. Contact support.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required.' })
    next()
  })
}

async function requireSuperAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user.isSuperAdmin) return res.status(403).json({ error: 'Super admin access required.' })
    next()
  })
}

async function requireSuper(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user.isSuper) return res.status(403).json({ error: 'Only coordinators and event planners can do this.' })
    next()
  })
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin, requireSuper }

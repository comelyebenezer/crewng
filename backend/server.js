// CrewNG Backend Server
// Run: npm run dev

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')
const { createServer } = require('http')
const { Server }       = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const app    = express()
const server = createServer(app)
const prisma = new PrismaClient()

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
})
app.set('io', io)

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// General rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

// Stricter rate limit for auth routes
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Wait 15 minutes.' },
}))
app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registration attempts. Wait 1 hour.' },
}))
app.use('/api/auth/forgot-password', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reset attempts. Wait 1 hour.' },
}))

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./src/routes/auth'))
app.use('/api/profiles', require('./src/routes/profiles'))
app.use('/api/bookings', require('./src/routes/bookings'))
app.use('/api/wallet',   require('./src/routes/wallet'))
app.use('/api/admin',    require('./src/routes/admin'))

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  app: 'CrewNG',
  version: '1.0.0',
  time: new Date().toISOString(),
}))

// 404 handler
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found.' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

// ─── SOCKET.IO REAL-TIME ──────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Unauthorized'))
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.userId
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`)
  onlineUsers.set(socket.userId, socket.id)
  socket.join(`user:${socket.userId}`)

  // Join conversation rooms
  socket.on('join:conversation', ({ conversationId }) => {
    socket.join(`conv:${conversationId}`)
  })

  // Send message
  socket.on('message:send', async ({ conversationId, content, type = 'TEXT' }) => {
    try {
      const message = await prisma.message.create({
        data: { conversationId, senderId: socket.userId, content, type },
        include: {
          sender: {
            include: { profile: { select: { fullName: true, featuredPhoto: true } } },
          },
        },
      })
      io.to(`conv:${conversationId}`).emit('message:new', message)
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message.' })
    }
  })

  // WebRTC signaling for voice / video calls
  socket.on('call:initiate', ({ targetUserId, callType, offer }) => {
    io.to(`user:${targetUserId}`).emit('call:incoming', {
      from: socket.userId, callType, offer,
    })
  })
  socket.on('call:answer',  ({ targetUserId, answer })    => io.to(`user:${targetUserId}`).emit('call:answered',  { answer }))
  socket.on('call:ice',     ({ targetUserId, candidate }) => io.to(`user:${targetUserId}`).emit('call:ice',       { candidate }))
  socket.on('call:decline', ({ targetUserId })            => io.to(`user:${targetUserId}`).emit('call:declined'))
  socket.on('call:end',     ({ targetUserId })            => io.to(`user:${targetUserId}`).emit('call:ended'))

  // Real-time notification helper (used by routes via io.to(userId).emit())
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId)
    console.log(`🔌 User disconnected: ${socket.userId}`)
  })
})

// Expose io for use in route files
global.io = io

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log('')
  console.log('🚀 ─────────────────────────────────────────')
  console.log(`   CrewNG Server running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Client URL:  ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
  console.log('────────────────────────────────────────────')
  console.log('')
})

module.exports = { app, io, prisma }

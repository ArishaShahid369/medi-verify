const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// ══ Security ══
app.use(helmet())
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://medi-verify-livid.vercel.app',
      process.env.FRONTEND_URL,
    ]
    if (!origin || allowed.some(o => o && origin.startsWith(o.replace(/\/$/, '')))) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true
}))

// ══ Rate Limiting ══
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, try again later.' }
})
app.use('/api/', limiter)

// ══ Body Parser ══
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ══ MongoDB Connect ══
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ MongoDB Error:', err.message))

// ══ Routes ══
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/medicines', require('./routes/medicineRoutes'))
app.use('/api/verify', require('./routes/verifyRoutes'))
app.use('/api/batches', require('./routes/batchRoutes'))

// ══ Health Check ══
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔬 MediVerify API is Live!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'
  })
})

// ══ 404 Handler ══
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ══ Error Handler ══
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 MediVerify Server running on port ${PORT}`)
  console.log(`📡 API: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

module.exports = app
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// ══ CORS — Sabse Pehle! ══
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))
// ══ Security ══
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
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

// ══ Expiry Alert Cron Job ══
const cron = require('node-cron')
const Medicine = require('./models/Medicine')

// Har raat 12 baje run hoga
cron.schedule('0 0 * * *', async () => {
  console.log('🕐 Running expiry check...')
  try {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Expire hone wali medicines update karo
    const expiringSoon = await Medicine.find({
      expiryDate: { $lte: thirtyDaysFromNow },
      status: 'active'
    })

    // Already expired medicines ko EXPIRED mark karo
    const alreadyExpired = await Medicine.updateMany(
      {
        expiryDate: { $lt: new Date() },
        status: 'active'
      },
      { $set: { status: 'expired' } }
    )

    console.log(`✅ Expiry check done: ${expiringSoon.length} expiring soon, ${alreadyExpired.modifiedCount} marked expired`)
  } catch (err) {
    console.error('❌ Expiry check error:', err.message)
  }
})

console.log('⏰ Expiry alert cron job scheduled!')

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

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`🚀 MediVerify Server running on port ${PORT}`)
  console.log(`📡 API: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

module.exports = app
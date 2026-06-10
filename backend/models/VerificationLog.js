const mongoose = require('mongoose')

const VerificationLogSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batchNumber: { type: String, required: true },
  scannedHash: { type: String, required: true },
  result: { type: String, enum: ['authentic', 'counterfeit', 'expired', 'recalled'], required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceInfo: {
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  blockchainVerified: { type: Boolean, default: false },
  responseTime: { type: Number, default: 0 },
  flaggedAsClone: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('VerificationLog', VerificationLogSchema)
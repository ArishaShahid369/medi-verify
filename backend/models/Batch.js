const mongoose = require('mongoose')

const BatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  quantity: { type: Number, required: true },
  unitsSold: { type: Number, default: 0 },
  unitsVerified: { type: Number, default: 0 },
  productionDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'recalled', 'expired', 'flagged'], default: 'active' },
  blockchainTxHash: { type: String, default: '' },
  isOnChain: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  distributionRegions: [{ type: String }],
}, { timestamps: true })

module.exports = mongoose.model('Batch', BatchSchema)
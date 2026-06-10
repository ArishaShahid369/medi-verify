const mongoose = require('mongoose')
const crypto = require('crypto')

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, required: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  manufacturerName: { type: String, required: true },
  batchNumber: { type: String, required: true, unique: true },
  serialNumber: { type: String, unique: true, sparse: true },
  dosage: { type: String, required: true },
  saltComposition: { type: String, required: true },
  drugType: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'other'], default: 'tablet' },
  manufactureDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  licenseNumber: { type: String, required: true },
  storageConditions: { type: String, default: 'Store below 25°C' },
  sha256Hash: { type: String, unique: true, sparse: true },
  blockchainTxHash: { type: String, default: '' },
  blockchainNetwork: { type: String, default: 'ethereum-sepolia' },
  isOnChain: { type: Boolean, default: false },
  qrCode: { type: String, default: '' },
  status: { type: String, enum: ['active', 'recalled', 'expired', 'flagged'], default: 'active' },
  verificationCount: { type: Number, default: 0 },
  supplyChain: [{
    stage: { type: String },
    location: { type: String },
    handler: { type: String },
    timestamp: { type: Date, default: Date.now },
    txHash: { type: String },
    notes: { type: String }
  }]
}, { timestamps: true })

MedicineSchema.pre('save', async function() {
  if (!this.sha256Hash) {
    const data = `${this.batchNumber}-${this.name}-${this.manufacturerName}-${Date.now()}`
    this.sha256Hash = crypto.createHash('sha256').update(data).digest('hex')
  }
  if (!this.serialNumber) {
    this.serialNumber = `MV-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`
  }
})

module.exports = mongoose.model('Medicine', MedicineSchema)
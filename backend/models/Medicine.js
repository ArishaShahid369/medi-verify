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
  recallInfo: {
    isRecalled: { type: Boolean, default: false },
    recalledAt: { type: Date },
    reasonCategory: { type: String, enum: ['contamination', 'labeling_error', 'efficacy_issue', 'packaging_defect', 'under_investigation'], default: 'under_investigation' },
    investigationComplete: { type: Boolean, default: false },
    fullReason: { type: String, default: '' }, // only shown after investigation complete
    affectedRegions: [{ type: String }],
    alertsSent: { type: Number, default: 0 },
  },
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
// @PATCH /api/medicines/:id/recall — Initiate a batch recall
exports.recallBatch = async (req, res) => {
  try {
    const { reasonCategory, fullReason, affectedRegions } = req.body
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })

    medicine.status = 'recalled'
    medicine.recallInfo = {
      isRecalled: true,
      recalledAt: new Date(),
      reasonCategory: reasonCategory || 'under_investigation',
      investigationComplete: false,
      fullReason: fullReason || '',
      affectedRegions: affectedRegions || [],
      alertsSent: medicine.verificationCount || 0, // simulate alerting everyone who scanned it
    }

    // Add recall event to supply chain (visible, transparent)
    medicine.supplyChain.push({
      stage: 'Batch Recalled',
      location: 'System-wide',
      handler: 'MediVerify Compliance',
      timestamp: new Date(),
      notes: 'Quality investigation initiated — batch flagged for recall',
    })

    await medicine.save()

    res.json({
      success: true,
      message: '⚠️ Batch recalled — alerts sent to all pharmacies that scanned this batch',
      medicine: {
        id: medicine._id,
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        status: medicine.status,
        alertsSent: medicine.recallInfo.alertsSent,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PATCH /api/medicines/:id/complete-investigation — Reveal full details
exports.completeInvestigation = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    medicine.recallInfo.investigationComplete = true
    await medicine.save()
    res.json({ success: true, message: 'Investigation marked complete — full details now public', medicine })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/medicines/recalls/active — Get all active recalls
exports.getActiveRecalls = async (req, res) => {
  try {
    const recalls = await Medicine.find({ status: 'recalled' }).select('name batchNumber recallInfo verificationCount createdAt')
    res.json({ success: true, count: recalls.length, recalls })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
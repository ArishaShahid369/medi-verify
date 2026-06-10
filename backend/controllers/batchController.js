const Batch = require('../models/Batch')
const Medicine = require('../models/Medicine')

// @POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const batchId = `BXC-${Date.now().toString().slice(-6)}`
    const batch = await Batch.create({ ...req.body, batchId, manufacturer: req.user._id })
    res.status(201).json({ success: true, message: 'Batch created', batch })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/batches
exports.getBatches = async (req, res) => {
  try {
    const query = req.user.role === 'manufacturer' ? { manufacturer: req.user._id } : {}
    const batches = await Batch.find(query).populate('medicine', 'name dosage sha256Hash').sort({ createdAt: -1 })
    res.json({ success: true, count: batches.length, batches })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/batches/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const query = req.user.role === 'manufacturer' ? { manufacturer: req.user._id } : {}
    const totalBatches = await Batch.countDocuments(query)
    const activeBatches = await Batch.countDocuments({ ...query, status: 'active' })
    const flaggedBatches = await Batch.countDocuments({ ...query, status: 'flagged' })
    const medicines = await Medicine.find(query.manufacturer ? { manufacturer: query.manufacturer } : {})
    const totalVerifications = medicines.reduce((sum, m) => sum + m.verificationCount, 0)
    res.json({
      success: true,
      stats: { totalBatches, activeBatches, flaggedBatches, totalVerifications }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
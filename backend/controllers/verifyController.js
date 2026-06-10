const Medicine = require('../models/Medicine')
const VerificationLog = require('../models/VerificationLog')
const crypto = require('crypto')

// @POST /api/verify/scan
exports.verifyScan = async (req, res) => {
  const startTime = Date.now()
  try {
    const { hash, batchNumber, serialNumber } = req.body
    if (!hash && !batchNumber && !serialNumber) {
      return res.status(400).json({ success: false, message: 'Provide hash, batchNumber or serialNumber' })
    }

    // Find medicine
    let medicine = null
    if (hash) medicine = await Medicine.findOne({ sha256Hash: hash }).populate('manufacturer', 'name companyName')
    if (!medicine && batchNumber) medicine = await Medicine.findOne({ batchNumber }).populate('manufacturer', 'name companyName')
    if (!medicine && serialNumber) medicine = await Medicine.findOne({ serialNumber }).populate('manufacturer', 'name companyName')

    const responseTime = Date.now() - startTime
    const deviceInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      location: req.headers['x-forwarded-for'] || 'Unknown',
    }

    if (!medicine) {
      await VerificationLog.create({
        batchNumber: batchNumber || 'UNKNOWN',
        scannedHash: hash || batchNumber || serialNumber,
        result: 'counterfeit',
        deviceInfo,
        responseTime,
        flaggedAsClone: true,
      })
      return res.status(200).json({
        success: true,
        result: 'counterfeit',
        message: '⚠️ WARNING: This medicine is NOT registered on MediVerify blockchain!',
        responseTime,
      })
    }

    // Check expiry
    const isExpired = new Date(medicine.expiryDate) < new Date()
    const result = medicine.status === 'recalled' ? 'recalled' : isExpired ? 'expired' : 'authentic'

    // Update verification count
    await Medicine.findByIdAndUpdate(medicine._id, { $inc: { verificationCount: 1 } })

    // Log verification
    await VerificationLog.create({
      medicine: medicine._id,
      batchNumber: medicine.batchNumber,
      scannedHash: hash || medicine.sha256Hash,
      result,
      verifiedBy: req.user?._id,
      deviceInfo,
      blockchainVerified: medicine.isOnChain,
      responseTime,
    })

    res.json({
      success: true,
      result,
      responseTime,
      medicine: {
        name: medicine.name,
        genericName: medicine.genericName,
        batchNumber: medicine.batchNumber,
        serialNumber: medicine.serialNumber,
        dosage: medicine.dosage,
        saltComposition: medicine.saltComposition,
        manufacturerName: medicine.manufacturerName,
        licenseNumber: medicine.licenseNumber,
        manufactureDate: medicine.manufactureDate,
        expiryDate: medicine.expiryDate,
        sha256Hash: medicine.sha256Hash,
        blockchainTxHash: medicine.blockchainTxHash,
        isOnChain: medicine.isOnChain,
        status: medicine.status,
        supplyChain: medicine.supplyChain,
        verificationCount: medicine.verificationCount + 1,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/verify/stats
exports.getStats = async (req, res) => {
  try {
    const totalVerifications = await VerificationLog.countDocuments()
    const authenticCount = await VerificationLog.countDocuments({ result: 'authentic' })
    const counterfeitCount = await VerificationLog.countDocuments({ result: 'counterfeit' })
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const todayCount = await VerificationLog.countDocuments({ createdAt: { $gte: todayStart } })
    res.json({
      success: true,
      stats: { totalVerifications, authenticCount, counterfeitCount, todayCount,
        authenticRate: totalVerifications > 0 ? ((authenticCount/totalVerifications)*100).toFixed(1) : 0 }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getHistory = async (req, res) => {
  try {
    const logs = await VerificationLog.find({})
      .populate('medicine', 'name batchNumber')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, logs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getSupplyChain = async (req, res) => {
  try {
    const medicines = await require('../models/Medicine')
      .find({ 'supplyChain.0': { $exists: true } })
      .select('name batchNumber supplyChain status verificationCount')
      .sort({ createdAt: -1 })
      .limit(10)
    res.json({ success: true, medicines })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
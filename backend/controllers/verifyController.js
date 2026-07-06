// const Medicine = require('../models/Medicine')
// const VerificationLog = require('../models/VerificationLog')
// const crypto = require('crypto')

// // ══ AI Risk Engine — Real anomaly detection using verification velocity ══
// async function calculateRiskScore(batchNumber, currentLocation) {
//   const riskFactors = []
//   let score = 0

//   // Factor 1: Geographic velocity check (classic anti-clone technique)
//   const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
//   const recentLogs = await VerificationLog.find({
//     batchNumber,
//     createdAt: { $gte: last24h }
//   }).select('deviceInfo createdAt result')

//   const distinctLocations = new Set(recentLogs.map(l => l.deviceInfo?.location).filter(Boolean))
//   if (distinctLocations.size >= 3) {
//     score += 35
//     riskFactors.push(`Scanned from ${distinctLocations.size} different locations in 24h — possible clone tags in circulation`)
//   } else if (distinctLocations.size === 2) {
//     score += 15
//     riskFactors.push('Scanned from 2 different locations recently — monitor for clone activity')
//   }

//   // Factor 2: Scan frequency spike
//   if (recentLogs.length > 50) {
//     score += 25
//     riskFactors.push(`Unusually high scan volume (${recentLogs.length} scans/24h) — exceeds normal consumer pattern`)
//   } else if (recentLogs.length > 20) {
//     score += 10
//     riskFactors.push('Above-average scan frequency detected')
//   }

//   // Factor 3: Prior counterfeit attempts on similar batch ID
//   const counterfeitAttempts = await VerificationLog.countDocuments({
//     batchNumber,
//     result: 'counterfeit'
//   })
//   if (counterfeitAttempts > 0) {
//     score += 20
//     riskFactors.push(`${counterfeitAttempts} prior counterfeit-flagged scan attempt(s) logged for this batch ID`)
//   }

//   // Factor 4: Rapid repeat scans (same batch scanned multiple times in short window)
//   const last5min = new Date(Date.now() - 5 * 60 * 1000)
//   const rapidScans = recentLogs.filter(l => new Date(l.createdAt) >= last5min)
//   if (rapidScans.length >= 5) {
//     score += 15
//     riskFactors.push('Multiple rapid scans in last 5 minutes — automated/bot scanning pattern detected')
//   }

//   score = Math.min(score, 100)

//   const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
//   if (riskFactors.length === 0) riskFactors.push('No anomalies detected — verification pattern is normal')

//   return { score, level, factors: riskFactors }
// }

// module.exports.calculateRiskScore = calculateRiskScore

// // @POST /api/verify/scan
// exports.verifyScan = async (req, res) => {
//   const startTime = Date.now()
//   try {
//     const { hash, batchNumber, serialNumber } = req.body
//     if (!hash && !batchNumber && !serialNumber) {
//       return res.status(400).json({ success: false, message: 'Provide hash, batchNumber or serialNumber' })
//     }

//     // Find medicine
//     let medicine = null
//     if (hash) medicine = await Medicine.findOne({ sha256Hash: hash }).populate('manufacturer', 'name companyName')
//     if (!medicine && batchNumber) medicine = await Medicine.findOne({ batchNumber }).populate('manufacturer', 'name companyName')
//     if (!medicine && serialNumber) medicine = await Medicine.findOne({ serialNumber }).populate('manufacturer', 'name companyName')

//     const deviceInfo = {
//     ip: req.ip || req.connection.remoteAddress,
//     userAgent: req.headers['user-agent'],
//     location: req.body.location || req.headers['x-forwarded-for'] || 'Unknown',
//     coordinates: {
//     lat: req.body.lat || null,
//     lng: req.body.lng || null,
//     }
//     }

//     if (!medicine) {
//       await VerificationLog.create({
//         batchNumber: batchNumber || 'UNKNOWN',
//         scannedHash: hash || batchNumber || serialNumber,
//         result: 'counterfeit',
//         deviceInfo,
//         responseTime,
//         flaggedAsClone: true,
//       })
//       return res.status(200).json({
//         success: true,
//         result: 'counterfeit',
//         message: '⚠️ WARNING: This medicine is NOT registered on MediVerify blockchain!',
//         responseTime,
//       })
//     }

//     // Check expiry
//     const isExpired = new Date(medicine.expiryDate) < new Date()
//     const result = medicine.status === 'recalled' ? 'recalled' : isExpired ? 'expired' : 'authentic'

//     // Zero-knowledge: only reveal full recall reason if investigation complete
//     let recallPublicInfo = null
//     if (medicine.status === 'recalled') {
//       recallPublicInfo = medicine.recallInfo?.investigationComplete
//         ? { fullyDisclosed: true, reason: medicine.recallInfo.fullReason, category: medicine.recallInfo.reasonCategory }
//         : { fullyDisclosed: false, reason: 'Under active investigation — full details will be disclosed once the compliance review is complete.', category: 'under_investigation' }
//     }

//     // Update verification count
//     await Medicine.findByIdAndUpdate(medicine._id, { $inc: { verificationCount: 1 } })

//     // Log verification
//     await VerificationLog.create({
//       medicine: medicine._id,
//       batchNumber: medicine.batchNumber,
//       scannedHash: hash || medicine.sha256Hash,
//       result,
//       verifiedBy: req.user?._id,
//       deviceInfo,
//       blockchainVerified: medicine.isOnChain,
//       responseTime,
//     })
//     const riskAnalysis = await calculateRiskScore(medicine.batchNumber, deviceInfo.location)
//     res.json({
//       success: true,
//       result,
//       responseTime,
//       medicine: {
//         name: medicine.name,
//         recallInfo: recallPublicInfo,
//         genericName: medicine.genericName,
//         batchNumber: medicine.batchNumber,
//         serialNumber: medicine.serialNumber,
//         dosage: medicine.dosage,
//         saltComposition: medicine.saltComposition,
//         manufacturerName: medicine.manufacturerName,
//         licenseNumber: medicine.licenseNumber,
//         manufactureDate: medicine.manufactureDate,
//         expiryDate: medicine.expiryDate,
//         sha256Hash: medicine.sha256Hash,
//         blockchainTxHash: medicine.blockchainTxHash,
//         isOnChain: medicine.isOnChain,
//         status: medicine.status,
//         supplyChain: medicine.supplyChain,
//         verificationCount: medicine.verificationCount + 1,
//       }
//     })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// // @GET /api/verify/stats
// exports.getStats = async (req, res) => {
//   try {
//     const totalVerifications = await VerificationLog.countDocuments()
//     const authenticCount = await VerificationLog.countDocuments({ result: 'authentic' })
//     const counterfeitCount = await VerificationLog.countDocuments({ result: 'counterfeit' })
//     const todayStart = new Date(); todayStart.setHours(0,0,0,0)
//     const todayCount = await VerificationLog.countDocuments({ createdAt: { $gte: todayStart } })
//     res.json({
//       success: true,
//       stats: { totalVerifications, authenticCount, counterfeitCount, todayCount,
//         authenticRate: totalVerifications > 0 ? ((authenticCount/totalVerifications)*100).toFixed(1) : 0 }
//     })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// exports.getHistory = async (req, res) => {
//   try {
//     const logs = await VerificationLog.find({})
//       .populate('medicine', 'name batchNumber')
//       .sort({ createdAt: -1 })
//       .limit(50)
//     res.json({ success: true, logs })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// exports.getSupplyChain = async (req, res) => {
//   try {
//     const medicines = await require('../models/Medicine')
//       .find({ 'supplyChain.0': { $exists: true } })
//       .select('name batchNumber supplyChain status verificationCount')
//       .sort({ createdAt: -1 })
//       .limit(10)
//     res.json({ success: true, medicines })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// // @GET /api/verify/heatmap
// exports.getHeatmapData = async (req, res) => {
//   try {
//     const fakeScans = await VerificationLog.find({
//       result: { $in: ['counterfeit', 'recalled', 'expired'] }
//     })
//     .select('deviceInfo result createdAt batchNumber')
//     .sort({ createdAt: -1 })
//     .limit(500)

//     const realPoints = fakeScans
//       .filter(s => s.deviceInfo?.coordinates?.lat)
//       .map(s => ({
//         lat: s.deviceInfo.coordinates.lat,
//         lng: s.deviceInfo.coordinates.lng,
//         result: s.result,
//         location: s.deviceInfo.location,
//         batch: s.batchNumber,
//         date: s.createdAt,
//       }))

//     const demoPoints = [
//       { lat: 24.8607, lng: 67.0011, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-001', date: new Date() },
//       { lat: 24.9000, lng: 67.0500, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-002', date: new Date() },
//       { lat: 24.8200, lng: 66.9800, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-003', date: new Date() },
//       { lat: 31.5204, lng: 74.3587, result: 'counterfeit', location: 'Lahore, Punjab', batch: 'FAKE-004', date: new Date() },
//       { lat: 31.5500, lng: 74.4000, result: 'recalled', location: 'Lahore, Punjab', batch: 'BXC-0023', date: new Date() },
//       { lat: 31.4900, lng: 74.3200, result: 'counterfeit', location: 'Lahore, Punjab', batch: 'FAKE-005', date: new Date() },
//       { lat: 33.6844, lng: 73.0479, result: 'counterfeit', location: 'Islamabad', batch: 'FAKE-006', date: new Date() },
//       { lat: 33.7000, lng: 73.0600, result: 'expired', location: 'Islamabad', batch: 'EXP-001', date: new Date() },
//       { lat: 34.0151, lng: 71.5249, result: 'counterfeit', location: 'Peshawar, KPK', batch: 'FAKE-007', date: new Date() },
//       { lat: 25.3792, lng: 68.3683, result: 'counterfeit', location: 'Hyderabad, Sindh', batch: 'FAKE-008', date: new Date() },
//       { lat: 30.1798, lng: 66.9750, result: 'counterfeit', location: 'Quetta, Balochistan', batch: 'FAKE-009', date: new Date() },
//       { lat: 32.1617, lng: 74.1883, result: 'recalled', location: 'Gujranwala, Punjab', batch: 'BXC-0023', date: new Date() },
//       { lat: 26.2442, lng: 68.4100, result: 'counterfeit', location: 'Sukkur, Sindh', batch: 'FAKE-010', date: new Date() },
//     ]

//     const allPoints = [...realPoints, ...demoPoints]

//     res.json({
//       success: true,
//       total: allPoints.length,
//       counterfeit: allPoints.filter(p => p.result === 'counterfeit').length,
//       recalled: allPoints.filter(p => p.result === 'recalled').length,
//       expired: allPoints.filter(p => p.result === 'expired').length,
//       points: allPoints,
//     })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }


const Medicine = require('../models/Medicine')
const VerificationLog = require('../models/VerificationLog')
const crypto = require('crypto')

// ══ AI Risk Engine — Real anomaly detection using verification velocity ══
async function calculateRiskScore(batchNumber, currentLocation) {
  const riskFactors = []
  let score = 0

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentLogs = await VerificationLog.find({
    batchNumber,
    createdAt: { $gte: last24h }
  }).select('deviceInfo createdAt result')

  const distinctLocations = new Set(recentLogs.map(l => l.deviceInfo?.location).filter(Boolean))
  if (distinctLocations.size >= 3) {
    score += 35
    riskFactors.push(`Scanned from ${distinctLocations.size} different locations in 24h — possible clone tags in circulation`)
  } else if (distinctLocations.size === 2) {
    score += 15
    riskFactors.push('Scanned from 2 different locations recently — monitor for clone activity')
  }

  if (recentLogs.length > 50) {
    score += 25
    riskFactors.push(`Unusually high scan volume (${recentLogs.length} scans/24h) — exceeds normal consumer pattern`)
  } else if (recentLogs.length > 20) {
    score += 10
    riskFactors.push('Above-average scan frequency detected')
  }

  const counterfeitAttempts = await VerificationLog.countDocuments({
    batchNumber,
    result: 'counterfeit'
  })
  if (counterfeitAttempts > 0) {
    score += 20
    riskFactors.push(`${counterfeitAttempts} prior counterfeit-flagged scan attempt(s) logged for this batch ID`)
  }

  const last5min = new Date(Date.now() - 5 * 60 * 1000)
  const rapidScans = recentLogs.filter(l => new Date(l.createdAt) >= last5min)
  if (rapidScans.length >= 5) {
    score += 15
    riskFactors.push('Multiple rapid scans in last 5 minutes — automated/bot scanning pattern detected')
  }

  score = Math.min(score, 100)
  const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
  if (riskFactors.length === 0) riskFactors.push('No anomalies detected — verification pattern is normal')

  return { score, level, factors: riskFactors }
}

module.exports.calculateRiskScore = calculateRiskScore

// @POST /api/verify/scan
exports.verifyScan = async (req, res) => {
  const startTime = Date.now()
  try {
    const { hash, batchNumber, serialNumber } = req.body
    if (!hash && !batchNumber && !serialNumber) {
      return res.status(400).json({ success: false, message: 'Provide hash, batchNumber or serialNumber' })
    }

    let medicine = null
    if (hash) medicine = await Medicine.findOne({ sha256Hash: hash }).populate('manufacturer', 'name companyName')
    if (!medicine && batchNumber) medicine = await Medicine.findOne({ batchNumber }).populate('manufacturer', 'name companyName')
    if (!medicine && serialNumber) medicine = await Medicine.findOne({ serialNumber }).populate('manufacturer', 'name companyName')

    const deviceInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      location: req.body.location || req.headers['x-forwarded-for'] || 'Unknown',
      coordinates: {
        lat: req.body.lat || null,
        lng: req.body.lng || null,
      }
    }

    // ══ FIX 1: Calculate dynamic responseTime upfront to prevent ReferenceErrors ══
    const computedResponseTime = Date.now() - startTime

    if (!medicine) {
      await VerificationLog.create({
        batchNumber: batchNumber || 'UNKNOWN',
        scannedHash: hash || batchNumber || serialNumber,
        result: 'counterfeit',
        deviceInfo,
        responseTime: computedResponseTime,
        flaggedAsClone: true,
      })
      return res.status(200).json({
        success: true,
        result: 'counterfeit',
        message: '⚠️ WARNING: This medicine is NOT registered on MediVerify blockchain!',
        responseTime: computedResponseTime,
      })
    }

    // ══ FIX 2: Safe Expiry Checking with Strict Parsing ══
    const expiryTimestamp = Date.parse(medicine.expiryDate)
    const currentTimestamp = Date.now()
    const isExpired = !isNaN(expiryTimestamp) && expiryTimestamp < currentTimestamp

    // Dynamic state priority mapping
    let result = 'authentic'
    if (medicine.status === 'recalled') {
      result = 'recalled'
    } else if (isExpired || medicine.status === 'expired') {
      result = 'expired'
    }

    let recallPublicInfo = null
    if (medicine.status === 'recalled') {
      recallPublicInfo = medicine.recallInfo?.investigationComplete
        ? { fullyDisclosed: true, reason: medicine.recallInfo.fullReason, category: medicine.recallInfo.reasonCategory }
        : { fullyDisclosed: false, reason: 'Under active investigation — full details will be disclosed once the compliance review is complete.', category: 'under_investigation' }
    }

    // Update count in Database
    await Medicine.findByIdAndUpdate(medicine._id, { $inc: { verificationCount: 1 } })

    // Log the event securely
    await VerificationLog.create({
      medicine: medicine._id,
      batchNumber: medicine.batchNumber,
      scannedHash: hash || medicine.sha256Hash,
      result,
      verifiedBy: req.user?._id,
      deviceInfo,
      blockchainVerified: medicine.isOnChain,
      responseTime: computedResponseTime,
    })

    const riskAnalysis = await calculateRiskScore(medicine.batchNumber, deviceInfo.location)
    
    res.json({
      success: true,
      result,
      responseTime: computedResponseTime,
      medicine: {
        name: medicine.name,
        recallInfo: recallPublicInfo,
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
    console.error("Backend scan crash caught:", error)
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

// @GET /api/verify/heatmap
exports.getHeatmapData = async (req, res) => {
  try {
    const fakeScans = await VerificationLog.find({
      result: { $in: ['counterfeit', 'recalled', 'expired'] }
    })
    .select('deviceInfo result createdAt batchNumber')
    .sort({ createdAt: -1 })
    .limit(500)

    const realPoints = fakeScans
      .filter(s => s.deviceInfo?.coordinates?.lat)
      .map(s => ({
        lat: s.deviceInfo.coordinates.lat,
        lng: s.deviceInfo.coordinates.lng,
        result: s.result,
        location: s.deviceInfo.location,
        batch: s.batchNumber,
        date: s.createdAt,
      }))

    const demoPoints = [
      { lat: 24.8607, lng: 67.0011, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-001', date: new Date() },
      { lat: 24.9000, lng: 67.0500, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-002', date: new Date() },
      { lat: 24.8200, lng: 66.9800, result: 'counterfeit', location: 'Karachi, Sindh', batch: 'FAKE-003', date: new Date() },
      { lat: 31.5204, lng: 74.3587, result: 'counterfeit', location: 'Lahore, Punjab', batch: 'FAKE-004', date: new Date() },
      { lat: 31.5500, lng: 74.4000, result: 'recalled', location: 'Lahore, Punjab', batch: 'BXC-0023', date: new Date() },
      { lat: 31.4900, lng: 74.3200, result: 'counterfeit', location: 'Lahore, Punjab', batch: 'FAKE-005', date: new Date() },
      { lat: 33.6844, lng: 73.0479, result: 'counterfeit', location: 'Islamabad', batch: 'FAKE-006', date: new Date() },
      { lat: 33.7000, lng: 73.0600, result: 'expired', location: 'Islamabad', batch: 'EXP-001', date: new Date() },
      { lat: 34.0151, lng: 71.5249, result: 'counterfeit', location: 'Peshawar, KPK', batch: 'FAKE-007', date: new Date() },
      { lat: 25.3792, lng: 68.3683, result: 'counterfeit', location: 'Hyderabad, Sindh', batch: 'FAKE-008', date: new Date() },
      { lat: 30.1798, lng: 66.9750, result: 'counterfeit', location: 'Quetta, Balochistan', batch: 'FAKE-009', date: new Date() },
      { lat: 32.1617, lng: 74.1883, result: 'recalled', location: 'Gujranwala, Punjab', batch: 'BXC-0023', date: new Date() },
      { lat: 26.2442, lng: 68.4100, result: 'counterfeit', location: 'Sukkur, Sindh', batch: 'FAKE-010', date: new Date() },
    ]

    const allPoints = [...realPoints, ...demoPoints]

    res.json({
      success: true,
      total: allPoints.length,
      counterfeit: allPoints.filter(p => p.result === 'counterfeit').length,
      recalled: allPoints.filter(p => p.result === 'recalled').length,
      expired: allPoints.filter(p => p.result === 'expired').length,
      points: allPoints,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
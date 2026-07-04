const mongoose = require('mongoose')
const Medicine = require('../models/Medicine')
const QRCode = require('qrcode')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Load private key for digital signatures
let privateKey
try {
  privateKey = process.env.PRIVATE_KEY
    ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    : fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8')
} catch (err) {
  console.error('Private key load error:', err.message)
  privateKey = null
}

exports.registerMedicine = async (req, res) => {
  try {
    const {
      name, genericName, dosage, saltComposition,
      batchNumber, manufactureDate, expiryDate,
      licenseNumber, manufacturerName, drugType,
      storageConditions, manufacturingLocation
    } = req.body

    // Check duplicate batch
    const existing = await Medicine.findOne({ batchNumber })
    if (existing) return res.status(400).json({ success: false, message: 'Batch number already exists!' })

    // Create medicine
    const medicine = await Medicine.create({
      name, genericName, dosage, saltComposition,
      batchNumber, manufactureDate, expiryDate,
      licenseNumber, manufacturerName, drugType,
      storageConditions,
      manufacturer: req.user?._id || new mongoose.Types.ObjectId(),
      supplyChain: [{
        stage: 'Manufacturing',
        location: manufacturingLocation || 'Factory',
        handler: manufacturerName,
        timestamp: new Date(),
        notes: 'Genesis Block — Medicine registered on MediVerify Blockchain'
      }]
    })

    // ══ OFFLINE-FIRST: Create signed payload for offline verification ══
    const payload = {
      name: medicine.name,
      genericName: medicine.genericName,
      batch: medicine.batchNumber,
      serial: medicine.serialNumber,
      dosage: medicine.dosage,
      saltComposition: medicine.saltComposition,
      manufacturer: medicine.manufacturerName,
      license: medicine.licenseNumber,
      manufactureDate: medicine.manufactureDate,
      expiry: medicine.expiryDate,
      hash: medicine.sha256Hash,
    }

    // Sign payload with RSA private key (digital signature)
    const payloadString = JSON.stringify(payload)
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(payloadString)
    signer.end()
    const signature = signer.sign(privateKey, 'base64')

    // QR contains: full medicine data + cryptographic signature (works offline!)
    const qrData = JSON.stringify({
      ...payload,
      sig: signature,
      v: 1, // signature version
    })

    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      width: 400
    })

    medicine.qrCode = qrCode
    await medicine.save()

    res.status(201).json({
      success: true,
      message: '✅ Medicine registered on MediVerify!',
      medicine: {
        id: medicine._id,
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        serialNumber: medicine.serialNumber,
        sha256Hash: medicine.sha256Hash,
        qrCode: medicine.qrCode,
        expiryDate: medicine.expiryDate,
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({}).sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, count: medicines.length, medicines })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    res.json({ success: true, medicine })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getQRCode = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    res.json({ success: true, qrCode: medicine.qrCode, medicine: { name: medicine.name, batchNumber: medicine.batchNumber, sha256Hash: medicine.sha256Hash } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

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
      alertsSent: medicine.verificationCount || 0,
    }

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

// @PATCH /api/medicines/:id/complete-investigation
exports.completeInvestigation = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    medicine.recallInfo.investigationComplete = true
    await medicine.save()
    res.json({ success: true, message: 'Investigation marked complete', medicine })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/medicines/recalls/active
exports.getActiveRecalls = async (req, res) => {
  try {
    const recalls = await Medicine.find({ status: 'recalled' }).select('name batchNumber recallInfo verificationCount createdAt')
    res.json({ success: true, count: recalls.length, recalls })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/medicines/expiry-alerts
exports.getExpiryAlerts = async (req, res) => {
  try {
    const now = new Date()
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    const sixtyDays = new Date()
    sixtyDays.setDate(sixtyDays.getDate() + 60)

    const critical = await Medicine.find({
      expiryDate: { $gte: now, $lte: thirtyDays },
      status: 'active'
    }).select('name batchNumber expiryDate dosage manufacturerName')

    const warning = await Medicine.find({
      expiryDate: { $gt: thirtyDays, $lte: sixtyDays },
      status: 'active'
    }).select('name batchNumber expiryDate dosage manufacturerName')

    const expired = await Medicine.find({
      expiryDate: { $lt: now },
      status: { $ne: 'recalled' }
    }).select('name batchNumber expiryDate dosage manufacturerName')

    const getDaysLeft = (date) => Math.ceil((new Date(date) - now) / (1000 * 60 * 60 * 24))

    res.json({
      success: true,
      summary: {
        critical: critical.length,
        warning: warning.length,
        expired: expired.length,
        total: critical.length + warning.length + expired.length
      },
      critical: critical.map(m => ({ ...m.toObject(), daysLeft: getDaysLeft(m.expiryDate) })),
      warning: warning.map(m => ({ ...m.toObject(), daysLeft: getDaysLeft(m.expiryDate) })),
      expired: expired.map(m => ({ ...m.toObject(), daysLeft: getDaysLeft(m.expiryDate) })),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
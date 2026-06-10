const mongoose = require('mongoose')
const Medicine = require('../models/Medicine')
const QRCode = require('qrcode')
const crypto = require('crypto')

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

    // Generate QR Code with medicine data
    const qrData = JSON.stringify({
      hash: medicine.sha256Hash,
      batch: medicine.batchNumber,
      serial: medicine.serialNumber,
      name: medicine.name,
      verify: `http://localhost:3000/result?hash=${medicine.sha256Hash}`
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
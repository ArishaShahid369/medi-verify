require('dotenv').config()
const mongoose = require('mongoose')
const crypto = require('crypto')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected for seeding...'))
  .catch(err => console.error(err))

const generateHash = (data) => crypto.createHash('sha256').update(data).digest('hex')

const seedData = async () => {
  try {
    // Clear existing
    await mongoose.connection.collection('medicines').deleteMany({})
    await mongoose.connection.collection('verificationlogs').deleteMany({})
    console.log('🗑️ Cleared old data...')

    // Add real medicines
    const medicines = [
      {
        name: 'Amoxicillin CL',
        genericName: 'Amoxicillin Trihydrate',
        manufacturerName: 'PharmaCorp Global',
        batchNumber: 'M-10293',
        serialNumber: 'MV-2024-AMX-10293',
        dosage: '500mg',
        saltComposition: 'Amoxicillin Trihydrate (500mg) + Potassium Clavulanate (125mg)',
        drugType: 'capsule',
        manufactureDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-12-31'),
        licenseNumber: 'LIC-445-GLOBAL',
        storageConditions: 'Store below 25°C, away from moisture',
        sha256Hash: generateHash('M-10293-Amoxicillin-PharmaCorp-2024'),
        blockchainTxHash: '0x71C765a8b2f4e9d1c3a7b5f8e2d6c4a9b3f7e1d5c8a2b6f4e9d3c7a1b5f8e2d6',
        isOnChain: true,
        status: 'active',
        verificationCount: 1247,
        manufacturer: new mongoose.Types.ObjectId(),
        supplyChain: [
          { stage: 'Manufacturing', location: 'Karachi, Pakistan', handler: 'PharmaCorp Global', timestamp: new Date('2024-01-15'), notes: 'Genesis Block — Batch manufactured and registered on blockchain' },
          { stage: 'Quality Control', location: 'Karachi, Pakistan', handler: 'QC Department', timestamp: new Date('2024-01-20'), notes: 'Passed all quality checks — ISO 9001 certified' },
          { stage: 'Distribution', location: 'Dubai, UAE', handler: 'SecureLogix Trans-Global', timestamp: new Date('2024-02-01'), notes: 'Temp Controlled Transport — Handled with Bio-Security Protocol' },
          { stage: 'Regional Hub', location: 'Lahore, Pakistan', handler: 'Regional Distribution Hub', timestamp: new Date('2024-02-15'), notes: 'Verified Batch Receipt — All units accounted for' },
        ]
      },
      {
        name: 'Paracet-Max',
        genericName: 'Paracetamol',
        manufacturerName: 'MedLine Pharmaceuticals',
        batchNumber: 'BXC-0021',
        serialNumber: 'MV-2024-PCT-0021',
        dosage: '1000mg',
        saltComposition: 'Paracetamol (1000mg)',
        drugType: 'tablet',
        manufactureDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-06-30'),
        licenseNumber: 'LIC-221-PAK',
        storageConditions: 'Store below 30°C',
        sha256Hash: generateHash('BXC-0021-Paracet-MedLine-2024'),
        blockchainTxHash: '0x4a9d2f8e1c5b7a3d6f9e2c4b8a1d5f7e3c6b9a2d4f8e1c5b7a3d6f9e2c4b8a1',
        isOnChain: true,
        status: 'active',
        verificationCount: 892,
        manufacturer: new mongoose.Types.ObjectId(),
        supplyChain: [
          { stage: 'Manufacturing', location: 'Islamabad, Pakistan', handler: 'MedLine Pharmaceuticals', timestamp: new Date('2024-03-01'), notes: 'Batch registered on MediVerify blockchain' },
          { stage: 'Distribution', location: 'Rawalpindi, Pakistan', handler: 'FastMed Logistics', timestamp: new Date('2024-03-10'), notes: 'Temperature maintained throughout transport' },
        ]
      },
      {
        name: 'Ciprofloxacin 500',
        genericName: 'Ciprofloxacin HCl',
        manufacturerName: 'BioSafe Labs',
        batchNumber: 'BXC-0023',
        serialNumber: 'MV-2024-CPX-0023',
        dosage: '500mg',
        saltComposition: 'Ciprofloxacin Hydrochloride (500mg)',
        drugType: 'tablet',
        manufactureDate: new Date('2024-02-10'),
        expiryDate: new Date('2025-12-31'),
        licenseNumber: 'LIC-339-GLOBAL',
        storageConditions: 'Store at room temperature',
        sha256Hash: generateHash('BXC-0023-Cipro-BioSafe-2024'),
        blockchainTxHash: '0x9f2b4e7a1c5d8f3b6e9a2c5d8f1b4e7a9c2d5f8b1e4a7c9d2f5b8e1a4c7d9f2',
        isOnChain: true,
        status: 'flagged',
        verificationCount: 43,
        manufacturer: new mongoose.Types.ObjectId(),
        supplyChain: [
          { stage: 'Manufacturing', location: 'Lahore, Pakistan', handler: 'BioSafe Labs', timestamp: new Date('2024-02-10'), notes: 'Registered on blockchain' },
        ]
      },
      {
        name: 'Metformin HCl',
        genericName: 'Metformin Hydrochloride',
        manufacturerName: 'DiabeCare Pharma',
        batchNumber: 'BXC-0024',
        serialNumber: 'MV-2024-MTF-0024',
        dosage: '500mg',
        saltComposition: 'Metformin Hydrochloride (500mg)',
        drugType: 'tablet',
        manufactureDate: new Date('2024-04-01'),
        expiryDate: new Date('2027-03-31'),
        licenseNumber: 'LIC-512-PAK',
        storageConditions: 'Store below 25°C, protect from light',
        sha256Hash: generateHash('BXC-0024-Metformin-DiabeCare-2024'),
        blockchainTxHash: '0x3e8c1a4d7f2b5e8a1c4d7f0b3e6a9c2d5f8b1e4a7c0d3f6b9e2a5c8d1f4b7e0',
        isOnChain: true,
        status: 'active',
        verificationCount: 567,
        manufacturer: new mongoose.Types.ObjectId(),
        supplyChain: [
          { stage: 'Manufacturing', location: 'Faisalabad, Pakistan', handler: 'DiabeCare Pharma', timestamp: new Date('2024-04-01'), notes: 'Batch registered on blockchain' },
          { stage: 'Distribution', location: 'Karachi, Pakistan', handler: 'MedExpress Logistics', timestamp: new Date('2024-04-15'), notes: 'Cold chain maintained' },
          { stage: 'Regional Hub', location: 'Hyderabad, Pakistan', handler: 'Sindh Distribution Hub', timestamp: new Date('2024-04-20'), notes: 'Received and verified' },
        ]
      },
    ]

    await mongoose.connection.collection('medicines').insertMany(medicines)
    console.log(`✅ ${medicines.length} real medicines added!`)
    console.log('\n📋 Medicine Hashes (use these to test scan):')
    medicines.forEach(m => {
      console.log(`\n💊 ${m.name} (${m.batchNumber})`)
      console.log(`   Hash: ${m.sha256Hash}`)
      console.log(`   Serial: ${m.serialNumber}`)
    })
    console.log('\n🎉 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error.message)
    process.exit(1)
  }
}

setTimeout(seedData, 2000)
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['consumer', 'manufacturer', 'regulator', 'admin'], default: 'consumer' },
  walletAddress: { type: String, sparse: true },
  companyName: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', UserSchema)
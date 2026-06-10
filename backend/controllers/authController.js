const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, licenseNumber, walletAddress } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' })
    const user = await User.create({ name, email, password, role, companyName, licenseNumber, walletAddress })
    res.status(201).json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' })
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

exports.walletLogin = async (req, res) => {
   console.log('Wallet login request:', req.body)
  try {
    const { walletAddress, role, name } = req.body
    if (!walletAddress) return res.status(400).json({ success: false, message: 'Wallet address required' })
    let user = await User.findOne({ walletAddress })
    if (!user) {
      user = await User.create({
        name: name || `User_${walletAddress.slice(0,6)}`,
        email: `${walletAddress.toLowerCase()}@wallet.mediverify.com`,
        password: `wallet_${walletAddress}_${Date.now()}`,
        role: role || 'consumer',
        walletAddress,
        isVerified: true
      })
    }
    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, role: user.role, walletAddress: user.walletAddress } })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ success: true, user })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}
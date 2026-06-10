const express = require('express')
const router = express.Router()
const batchController = require('../controllers/batchController')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, authorize('manufacturer', 'admin'), batchController.createBatch)
router.get('/', protect, batchController.getBatches)
router.get('/dashboard', protect, batchController.getDashboardStats)

module.exports = router
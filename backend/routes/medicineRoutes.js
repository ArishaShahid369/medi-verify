const express = require('express')
const router = express.Router()
const medicineController = require('../controllers/medicineController')
const { protect, authorize } = require('../middleware/auth')

router.post('/register', medicineController.registerMedicine)
router.get('/', medicineController.getMedicines)
router.get('/:id', medicineController.getMedicine)
router.get('/:id/qr', medicineController.getQRCode)

module.exports = router
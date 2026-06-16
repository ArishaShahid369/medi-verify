const express = require('express')
const router = express.Router()
const medicineController = require('../controllers/medicineController')
const { protect, authorize } = require('../middleware/auth')

router.post('/register', medicineController.registerMedicine)
router.get('/', medicineController.getMedicines)
router.get('/recalls/active', medicineController.getActiveRecalls)
router.get('/:id', medicineController.getMedicine)
router.get('/:id/qr', medicineController.getQRCode)
router.patch('/:id/recall', medicineController.recallBatch)
router.patch('/:id/complete-investigation', medicineController.completeInvestigation)

module.exports = router
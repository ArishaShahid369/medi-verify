const express = require('express')
const router = express.Router()
const verifyController = require('../controllers/verifyController')

router.post('/scan', verifyController.verifyScan)
router.get('/stats', verifyController.getStats)
router.get('/history', verifyController.getHistory)
router.get('/supply-chain', verifyController.getSupplyChain)
router.get('/heatmap', verifyController.getHeatmapData)

module.exports = router
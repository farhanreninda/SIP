const router = require('express').Router()
const Controller = require('../../controllers/transaksi.controller')

router.get('/', Controller.list)
router.post('/checkout', Controller.checkout)
router.get('/report', Controller.report)

module.exports = router

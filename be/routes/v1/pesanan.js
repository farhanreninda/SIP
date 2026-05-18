const router = require('express').Router()
const Controller = require('../../controllers/pesanan.controller')
const { adminOnly } = require('../../middleware/auth')

router.get('/', Controller.list)
router.put('/:id/status', adminOnly, Controller.updateStatus)
router.delete('/:id', adminOnly, Controller.remove)

module.exports = router

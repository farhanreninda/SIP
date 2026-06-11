const router = require('express').Router()
const Controller = require('../../controllers/menu.controller')
const { adminOnly } = require('../../middleware/auth')

router.get('/', Controller.list)
router.post('/', adminOnly, Controller.create)
router.put('/:id', adminOnly, Controller.update)
router.delete('/:id', adminOnly, Controller.remove)

module.exports = router

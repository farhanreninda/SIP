const router = require('express').Router()
const Controller = require('../../controllers/laporan.controller')

router.get('/', Controller.list)

module.exports = router

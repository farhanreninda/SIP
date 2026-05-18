const router = require('express').Router()
const Controller = require('../../controllers/auth.controller')

router.post('/login', Controller.login)

module.exports = router

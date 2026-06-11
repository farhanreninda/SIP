const router = require('express').Router()

const v1 = require('./v1/index')

router.get('/', function(req, res) {
  res.status(200).json({
    welcome: 'sip-web-be'
  })
})

router.get('/health', function(req, res) {
  res.status(200).json({ status: 'ok' })
})

router.use('/v1', v1)

module.exports = router

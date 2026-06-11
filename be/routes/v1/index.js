const router = require('express').Router()

const auth = require('./auth')
const menu = require('./menu')
const pesanan = require('./pesanan')
const transaksi = require('./transaksi')
const laporan = require('./laporan')
const MenuController = require('../../controllers/menu.controller')
const PesananController = require('../../controllers/pesanan.controller')
const authentication = require('../../middleware/auth')

router.use('/auth', auth)

// public routes
router.get('/menu/public', MenuController.listPublic)
router.post('/pesanan/public', PesananController.createPublic)
router.get('/pesanan/tracking/:kode', PesananController.tracking)

// protected routes
router.use(authentication)
router.use('/menu', menu)
router.use('/pesanan', pesanan)
router.use('/transaksi', transaksi)
router.use('/laporan', laporan)

module.exports = router

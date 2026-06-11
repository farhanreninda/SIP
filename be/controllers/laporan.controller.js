const MySqlLaporan = require('../models/mysql/laporan')

async function list(req, res) {
  try {
    return res.json(await MySqlLaporan.getLaporan(req.query))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

module.exports = { list }

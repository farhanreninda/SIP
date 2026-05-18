const pool = require('../../config/mysql')

async function getLaporan(filters = {}) {
  const { from, to, q } = filters
  const where = []
  const params = []

  if (from && to) {
    where.push('DATE(tgl_transaksi) BETWEEN ? AND ?')
    params.push(from, to)
  }

  if (q) {
    where.push('(nama_menu LIKE ? OR nama_pelanggan LIKE ? OR kode_transaksi LIKE ?)')
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }

  const [rows] = await pool.query(`
    SELECT *
    FROM transaksi
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY tgl_transaksi DESC, id_transaksi DESC
  `, params)

  const summary = rows.reduce((acc, row) => {
    acc.omzet += Number(row.subtotal || 0)
    acc.modal += Number(row.modal || 0) * Number(row.qty || 0)
    acc.laba += Number(row.laba || 0)
    acc.qty += Number(row.qty || 0)
    return acc
  }, { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: rows.length })

  return {
    summary,
    rows: rows.map(row => ({
      id_transaksi: row.id_transaksi,
      kode_transaksi: row.kode_transaksi,
      nama_pelanggan: row.nama_pelanggan,
      nama_menu: row.nama_menu,
      qty: Number(row.qty || 0),
      harga: Number(row.harga || 0),
      modal: Number(row.modal || 0),
      subtotal: Number(row.subtotal || 0),
      laba: Number(row.laba || 0),
      tgl_transaksi: row.tgl_transaksi
    }))
  }
}

module.exports = { getLaporan }

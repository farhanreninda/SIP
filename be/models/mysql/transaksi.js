const pool = require('../../config/mysql')

function groupRows(rows) {
  const map = new Map()

  for (const row of rows) {
    const key = row.kode_transaksi || `TRX-${row.id_transaksi}`

    if (!map.has(key)) {
      map.set(key, {
        id: row.id_transaksi,
        id_transaksi: row.id_transaksi,
        kode_transaksi: key,
        nama_pelanggan: row.nama_pelanggan || 'Pelanggan Umum',
        metode_pembayaran: 'Tunai',
        total: 0,
        laba: 0,
        date: row.tgl_transaksi,
        created_at: row.tgl_transaksi,
        items: []
      })
    }

    const transaksi = map.get(key)
    transaksi.total += Number(row.subtotal || 0)
    transaksi.laba += Number(row.laba || 0)
    transaksi.items.push({
      id: row.id_menu,
      id_menu: row.id_menu,
      id_pesanan: row.id_pesanan,
      nama: row.nama_menu,
      nama_menu: row.nama_menu,
      harga: Number(row.harga || 0),
      modal: Number(row.modal || 0),
      qty: Number(row.qty || 0),
      subtotal: Number(row.subtotal || 0),
      laba: Number(row.laba || 0)
    })
  }

  return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date))
}

async function queryTransaksi(whereSql = '', params = []) {
  const [rows] = await pool.query(`
    SELECT
      id_transaksi,
      kode_transaksi,
      id_pesanan,
      id_menu,
      nama_menu,
      nama_pelanggan,
      qty,
      harga,
      modal,
      subtotal,
      laba,
      tgl_transaksi
    FROM transaksi
    ${whereSql}
    ORDER BY tgl_transaksi DESC, id_transaksi DESC
  `, params)

  return groupRows(rows)
}

async function createTransaksi(conn, data) {
  const [result] = await conn.query(`
    INSERT INTO transaksi
      (kode_transaksi,id_user,id_pesanan,id_pelanggan,id_menu,nama_menu,nama_pelanggan,qty,harga,modal,subtotal,laba,tgl_transaksi)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW())
  `, [
    data.kode_transaksi,
    data.id_user || null,
    data.id_pesanan,
    data.id_pelanggan,
    data.id_menu,
    data.nama_menu,
    data.nama_pelanggan,
    data.qty,
    data.harga,
    data.modal,
    data.subtotal,
    data.laba
  ])

  return result.insertId
}

module.exports = {
  groupRows,
  queryTransaksi,
  createTransaksi
}

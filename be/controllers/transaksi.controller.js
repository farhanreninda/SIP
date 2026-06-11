const pool = require('../config/mysql')
const MySqlTransaksi = require('../models/mysql/transaksi')

function formatPelangganCode(id) {
  return `PLG-${String(id).padStart(4, '0')}`
}
function formatPesananCode(id) {
  return `PSN-${String(id).padStart(6, '0')}`
}
function formatTransaksiCode(id) {
  return `TRX-${String(id).padStart(6, '0')}`
}

async function list(req, res) {
  try {
    return res.json(await MySqlTransaksi.queryTransaksi())
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function checkout(req, res) {
  const { items, nama_pelanggan, no_meja } = req.body

  if (!items || !items.length) return res.status(400).json({ error: 'no items' })

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [pelanggan] = await conn.query(
      'INSERT INTO pelanggan (nama_pelanggan,no_meja,kode_pelanggan) VALUES (?,?,NULL)',
      [nama_pelanggan || 'Pelanggan Umum', no_meja || '']
    )
    const idPelanggan = pelanggan.insertId
    const kodePelanggan = formatPelangganCode(idPelanggan)
    await conn.query('UPDATE pelanggan SET kode_pelanggan=? WHERE id_pelanggan=?', [kodePelanggan, idPelanggan])
    let kodePesanan = ''
    let kodeTransaksi = ''

    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      const idMenu = item.id_menu || item.id
      const qty = Number(item.qty) || 0

      if (!idMenu || qty <= 0) throw new Error('item invalid')

      const [menuRows] = await conn.query('SELECT * FROM menu WHERE id_menu=? FOR UPDATE', [idMenu])
      const menu = menuRows[0]

      if (!menu) throw new Error('menu tidak ditemukan')
      if (Number(menu.stok) < qty) throw new Error(`stok tidak cukup: ${menu.nama_menu}`)

      const [pesanan] = await conn.query(
        'INSERT INTO pesanan (kode_pesanan,id_pelanggan,id_menu,qty,keterangan,status,tgl_pesanan) VALUES (?,?,?,?,?,?,NOW())',
        [kodePesanan || 'PSN-TEMP', idPelanggan, idMenu, qty, item.keterangan || '', 'selesai']
      )
      if (!kodePesanan) {
        kodePesanan = formatPesananCode(pesanan.insertId)
        await conn.query('UPDATE pesanan SET kode_pesanan=? WHERE id_pesanan=?', [kodePesanan, pesanan.insertId])
        kodeTransaksi = kodePesanan.replace('PSN-', 'TRX-')
      }
      await conn.query('UPDATE menu SET stok = stok - ? WHERE id_menu=?', [qty, idMenu])

      const harga = Number(menu.harga || 0)
      const modal = Number(menu.modal || 0)
      const subtotal = harga * qty
      const laba = (harga - modal) * qty

      await MySqlTransaksi.createTransaksi(conn, {
        kode_transaksi: kodeTransaksi,
        id_user: req.user && req.user.id,
        id_pesanan: pesanan.insertId,
        id_pelanggan: idPelanggan,
        id_menu: idMenu,
        nama_menu: menu.nama_menu,
        nama_pelanggan: nama_pelanggan || 'Pelanggan Umum',
        qty,
        harga,
        modal,
        subtotal,
        laba
      })
    }

    await conn.commit()

    const [rows] = await pool.query('SELECT * FROM transaksi WHERE kode_transaksi=?', [kodeTransaksi])
    const grouped = MySqlTransaksi.groupRows(rows)
    return res.json(grouped[0])
  } catch (error) {
    await conn.rollback()
    console.error(error)
    return res.status(400).json({ error: error.message || 'server' })
  } finally {
    conn.release()
  }
}

async function report(req, res) {
  const { from, to } = req.query

  if (!from || !to) return res.status(400).json({ error: 'from/to required' })

  try {
    return res.json(await MySqlTransaksi.queryTransaksi('WHERE DATE(tgl_transaksi) BETWEEN ? AND ?', [from, to]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

module.exports = {
  list,
  checkout,
  report
}

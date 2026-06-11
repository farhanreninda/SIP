const pool = require('../config/mysql')
const MySqlPesanan = require('../models/mysql/pesanan')
function formatPelangganCode(id) {
  return `PLG-${String(id).padStart(4, '0')}`
}
function formatPesananCode(id) {
  return `PSN-${String(id).padStart(6, '0')}`
}

function encodeNotes(itemNote, generalNote) {
  const item = String(itemNote || '').trim()
  const umum = String(generalNote || '').trim()
  if (!umum) return item
  return JSON.stringify({ item, umum })
}

async function list(req, res) {
  const { status, from, to } = req.query
  const where = []
  const params = []

  if (status) {
    where.push('p.status=?')
    params.push(status)
  }

  if (from && to) {
    where.push('DATE(p.tgl_pesanan) BETWEEN ? AND ?')
    params.push(from, to)
  }

  try {
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    return res.json(await MySqlPesanan.listPesanan(whereSql, params))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function createPublic(req, res) {
  const { nama_pelanggan, no_meja, items } = req.body
  const catatanUmum = req.body.catatan_umum || req.body.keterangan || ''

  if (!nama_pelanggan) return res.status(400).json({ error: 'nama_pelanggan required' })
  if (!items || !items.length) return res.status(400).json({ error: 'items required' })

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const idPelanggan = await MySqlPesanan.createPelanggan(conn, {
      nama_pelanggan,
      no_meja
    })
    const kodePelanggan = formatPelangganCode(idPelanggan)
    const inserted = []
    let kodePesanan = ''

    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      const idMenu = item.id_menu || item.id
      const qty = Number(item.qty) || 0

      if (!idMenu || qty <= 0) throw new Error('item invalid')

      const [menuRows] = await conn.query('SELECT id_menu FROM menu WHERE id_menu=?', [idMenu])
      if (!menuRows.length) throw new Error('menu tidak ditemukan')

      const idPesanan = await MySqlPesanan.createPesanan(conn, {
        kode_pesanan: kodePesanan || 'PSN-TEMP',
        id_pelanggan: idPelanggan,
        id_menu: idMenu,
        qty,
        keterangan: encodeNotes(item.keterangan || item.catatan_produk || '', item.catatan_umum || catatanUmum),
        status: 'baru'
      })
      if (!kodePesanan) {
        kodePesanan = formatPesananCode(idPesanan)
        await conn.query('UPDATE pesanan SET kode_pesanan=? WHERE id_pesanan=?', [kodePesanan, idPesanan])
      }
      inserted.push(idPesanan)
    }

    await conn.commit()

    const data = await MySqlPesanan.listPesanan('WHERE p.kode_pesanan=?', [kodePesanan])
    return res.json({ kode_pesanan: kodePesanan, kode_pelanggan: kodePelanggan, pesanan: data })
  } catch (error) {
    await conn.rollback()
    console.error(error)
    return res.status(400).json({ error: error.message || 'server' })
  } finally {
    conn.release()
  }
}

async function tracking(req, res) {
  try {
    const data = await MySqlPesanan.listPesanan('WHERE p.kode_pesanan=?', [req.params.kode])
    if (!data.length) return res.status(404).json({ error: 'not found' })

    return res.json({ kode_pesanan: req.params.kode, pesanan: data })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function updateStatus(req, res) {
  const id = req.params.id
  const { status } = req.body

  if (!['baru', 'diproses', 'selesai', 'dibatalkan'].includes(status)) {
    return res.status(400).json({ error: 'status invalid' })
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    await conn.query('UPDATE pesanan SET status=? WHERE id_pesanan=?', [status, id])

    if (status === 'selesai') {
      await MySqlPesanan.insertTransaksiForPesanan(conn, id, req.user && req.user.id)
    }

    await conn.commit()

    const data = await MySqlPesanan.listPesanan('WHERE p.id_pesanan=?', [id])
    return res.json(data[0])
  } catch (error) {
    await conn.rollback()
    console.error(error)
    return res.status(400).json({ error: error.message || 'server' })
  } finally {
    conn.release()
  }
}

async function remove(req, res) {
  try {
    await pool.query('DELETE FROM pesanan WHERE id_pesanan=? AND status <> "selesai"', [req.params.id])
    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

module.exports = {
  list,
  createPublic,
  tracking,
  updateStatus,
  remove
}

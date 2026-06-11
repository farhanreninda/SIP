const pool = require('../../config/mysql')

function parseNotes(value) {
  const raw = String(value || '')
  if (!raw) return { item: '', umum: '' }

  try {
    const data = JSON.parse(raw)
    if (data && typeof data === 'object' && ('item' in data || 'umum' in data)) {
      return {
        item: String(data.item || ''),
        umum: String(data.umum || '')
      }
    }
  } catch (error) {}

  return { item: raw, umum: '' }
}

function mapPesanan(row) {
  const notes = parseNotes(row.keterangan)
  return {
    id: row.id_pesanan,
    id_pesanan: row.id_pesanan,
    kode_pesanan: row.kode_pesanan,
    id_pelanggan: row.id_pelanggan,
    nama_pelanggan: row.nama_pelanggan,
    no_meja: row.no_meja || '',
    id_menu: row.id_menu,
    nama_menu: row.nama_menu,
    nama: row.nama_menu,
    harga: Number(row.harga || 0),
    qty: Number(row.qty || 0),
    subtotal: Number(row.subtotal || 0),
    keterangan: notes.item,
    keterangan_produk: notes.item,
    catatan_produk: notes.item,
    catatan_umum: notes.umum,
    status: row.status,
    tgl_pesanan: row.tgl_pesanan
  }
}

async function listPesanan(whereSql = '', params = []) {
  const [rows] = await pool.query(`
    SELECT p.*, pel.nama_pelanggan, pel.no_meja, m.nama_menu, m.harga, (p.qty * m.harga) AS subtotal
    FROM pesanan p
    JOIN pelanggan pel ON pel.id_pelanggan = p.id_pelanggan
    JOIN menu m ON m.id_menu = p.id_menu
    ${whereSql}
    ORDER BY p.tgl_pesanan DESC, p.id_pesanan DESC
  `, params)

  return rows.map(mapPesanan)
}

async function createPelanggan(conn, data) {
  const [result] = await conn.query(
    'INSERT INTO pelanggan (nama_pelanggan,no_meja,kode_pelanggan) VALUES (?,?,NULL)',
    [data.nama_pelanggan, data.no_meja || '']
  )
  const idPelanggan = result.insertId
  const kodePelanggan = `PLG-${String(idPelanggan).padStart(4, '0')}`
  await conn.query(
    'UPDATE pelanggan SET kode_pelanggan=? WHERE id_pelanggan=?',
    [kodePelanggan, idPelanggan]
  )
  return idPelanggan
}

async function createPesanan(conn, data) {
  const [result] = await conn.query(
    'INSERT INTO pesanan (kode_pesanan,id_pelanggan,id_menu,qty,keterangan,status,tgl_pesanan) VALUES (?,?,?,?,?,?,NOW())',
    [data.kode_pesanan, data.id_pelanggan, data.id_menu, data.qty, data.keterangan || '', data.status]
  )

  return result.insertId
}

async function insertTransaksiForPesanan(conn, idPesanan, userId) {
  const [existing] = await conn.query('SELECT id_transaksi FROM transaksi WHERE id_pesanan=? LIMIT 1', [idPesanan])
  if (existing.length) return

  const [rows] = await conn.query(`
    SELECT p.*, pel.nama_pelanggan, m.nama_menu, m.harga, m.modal
    FROM pesanan p
    JOIN pelanggan pel ON pel.id_pelanggan = p.id_pelanggan
    JOIN menu m ON m.id_menu = p.id_menu
    WHERE p.id_pesanan=?
  `, [idPesanan])

  const pesanan = rows[0]
  if (!pesanan) throw new Error('pesanan not found')

  const subtotal = Number(pesanan.harga) * Number(pesanan.qty)
  const laba = (Number(pesanan.harga) - Number(pesanan.modal || 0)) * Number(pesanan.qty)
  const kodeTransaksi = String(pesanan.kode_pesanan || '').startsWith('PSN-')
    ? String(pesanan.kode_pesanan).replace('PSN-', 'TRX-')
    : `TRX-${String(pesanan.id_pesanan).padStart(6, '0')}`

  await conn.query(
    'UPDATE menu SET stok = stok - ? WHERE id_menu=? AND stok >= ?',
    [pesanan.qty, pesanan.id_menu, pesanan.qty]
  )

  const [updated] = await conn.query('SELECT ROW_COUNT() AS affected')
  if (!updated[0].affected) throw new Error('stok tidak cukup')

  await conn.query(`
    INSERT INTO transaksi
      (kode_transaksi,id_user,id_pesanan,id_pelanggan,id_menu,nama_menu,nama_pelanggan,qty,harga,modal,subtotal,laba,tgl_transaksi)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW())
  `, [
    kodeTransaksi,
    userId || null,
    pesanan.id_pesanan,
    pesanan.id_pelanggan,
    pesanan.id_menu,
    pesanan.nama_menu,
    pesanan.nama_pelanggan,
    pesanan.qty,
    pesanan.harga,
    pesanan.modal || 0,
    subtotal,
    laba
  ])
}

module.exports = {
  mapPesanan,
  listPesanan,
  createPelanggan,
  createPesanan,
  insertTransaksiForPesanan
}

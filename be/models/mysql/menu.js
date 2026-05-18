const pool = require('../../config/mysql')

function mapMenu(row) {
  if (!row) return null

  return {
    id: row.id_menu,
    id_menu: row.id_menu,
    nama: row.nama_menu,
    nama_menu: row.nama_menu,
    kategori: row.kategori || 'Umum',
    harga: Number(row.harga || 0),
    modal: Number(row.modal || 0),
    stok: Number(row.stok || 0),
    gambar: row.gambar || '',
    deskripsi: row.deskripsi || '',
    created_at: row.created_at
  }
}

function getMenuPayload(body = {}) {
  return {
    nama_menu: body.nama_menu || body.nama || 'Menu Baru',
    kategori: body.kategori || 'Umum',
    harga: Number(body.harga) || 0,
    modal: Number(body.modal) || 0,
    stok: Number(body.stok) || 0,
    gambar: body.gambar || '',
    deskripsi: body.deskripsi || ''
  }
}

async function listMenus() {
  const [rows] = await pool.query('SELECT * FROM menu ORDER BY nama_menu')
  return rows.map(mapMenu)
}

async function getMenuById(id, conn = pool) {
  const [rows] = await conn.query('SELECT * FROM menu WHERE id_menu=?', [id])
  return mapMenu(rows[0])
}

async function createMenu(data) {
  const [result] = await pool.query(
    'INSERT INTO menu (nama_menu,kategori,harga,modal,stok,gambar,deskripsi) VALUES (?,?,?,?,?,?,?)',
    [data.nama_menu, data.kategori, data.harga, data.modal, data.stok, data.gambar, data.deskripsi]
  )

  return getMenuById(result.insertId)
}

async function updateMenu(id, data) {
  await pool.query(
    'UPDATE menu SET nama_menu=?,kategori=?,harga=?,modal=?,stok=?,gambar=?,deskripsi=? WHERE id_menu=?',
    [data.nama_menu, data.kategori, data.harga, data.modal, data.stok, data.gambar, data.deskripsi, id]
  )

  return getMenuById(id)
}

async function deleteMenu(id) {
  await pool.query('DELETE FROM menu WHERE id_menu=?', [id])
}

module.exports = {
  mapMenu,
  getMenuPayload,
  listMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
}

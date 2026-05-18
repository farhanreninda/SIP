const MySqlMenu = require('../models/mysql/menu')

async function listPublic(req, res) {
  try {
    return res.json(await MySqlMenu.listMenus())
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function list(req, res) {
  try {
    return res.json(await MySqlMenu.listMenus())
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function create(req, res) {
  const data = MySqlMenu.getMenuPayload(req.body)
  if (!data.nama_menu) return res.status(400).json({ error: 'nama_menu required' })

  try {
    return res.json(await MySqlMenu.createMenu(data))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function update(req, res) {
  const data = MySqlMenu.getMenuPayload(req.body)

  try {
    return res.json(await MySqlMenu.updateMenu(req.params.id, data))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}

async function remove(req, res) {
  try {
    await MySqlMenu.deleteMenu(req.params.id)
    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server', message: 'Menu masih dipakai di pesanan/transaksi' })
  }
}

module.exports = {
  listPublic,
  list,
  create,
  update,
  remove
}

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const MySqlAdmin = require('../models/mysql/admin')

async function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'username/password required' })
  }

  try {
    const user = await MySqlAdmin.findByUsername(username)
    if (!user) return res.status(401).json({ error: 'invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'invalid credentials' })

    const token = jwt.sign(
      { id: user.id_user, username: user.username, role: user.role, nama_user: user.nama_user },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    )

    return res.json({
      token,
      user: {
        id: user.id_user,
        username: user.username,
        nama_user: user.nama_user,
        role: user.role
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server error' })
  }
}

module.exports = { login }

const pool = require('../../config/mysql')

async function findByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id_user, nama_user, username, password, role FROM admin WHERE username = ?',
    [username]
  )

  return rows[0]
}

module.exports = { findByUsername }

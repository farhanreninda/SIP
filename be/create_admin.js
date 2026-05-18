#!/usr/bin/env node
// create_admin.js
// Usage: node create_admin.js [username] [password] [role]

const bcrypt = require('bcrypt')
require('dotenv').config()
const pool = require('./config/mysql')

;(async()=>{
  try{
    const username = process.argv[2] || process.env.ADMIN_USER || 'admin'
    const password = process.argv[3] || process.env.ADMIN_PASS || 'admin'
    const role = process.argv[4] || 'admin'
    if(!password){
      console.error('Error: password required as argument or set ADMIN_PASS in .env')
      process.exit(1)
    }

    const hashed = await bcrypt.hash(password, 10)
    const [rows] = await pool.query('SELECT id_user FROM admin WHERE username = ?', [username])
    if(rows.length){
      await pool.query('UPDATE admin SET password = ?, role = ?, nama_user = ? WHERE username = ?', [hashed, role, username, username])
      console.log('Updated existing user:', username)
    }else{
      await pool.query('INSERT INTO admin (nama_user,username,password,role) VALUES (?,?,?,?)', [username, username, hashed, role])
      console.log('Created user:', username)
    }
    process.exit(0)
  }catch(err){
    console.error('Failed:', err)
    process.exit(1)
  }
})()

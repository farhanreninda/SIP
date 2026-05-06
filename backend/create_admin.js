#!/usr/bin/env node
// create_admin.js
// Usage: node create_admin.js [username] [password] [role]

const bcrypt = require('bcrypt')
require('dotenv').config()
const pool = require('./db')

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
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if(rows.length){
      await pool.query('UPDATE users SET password = ?, role = ? WHERE username = ?', [hashed, role, username])
      console.log('Updated existing user:', username)
    }else{
      await pool.query('INSERT INTO users (username,password,role) VALUES (?,?,?)', [username, hashed, role])
      console.log('Created user:', username)
    }
    process.exit(0)
  }catch(err){
    console.error('Failed:', err)
    process.exit(1)
  }
})()

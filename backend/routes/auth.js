const express = require('express')
const router = express.Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// POST /api/auth/login
router.post('/login', async (req,res)=>{
  const {username,password} = req.body
  if(!username||!password) return res.status(400).json({error:'username/password required'})
  try{
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    const user = rows[0]
    if(!user) return res.status(401).json({error:'invalid credentials'})
    const match = await bcrypt.compare(password, user.password)
    if(!match) return res.status(401).json({error:'invalid credentials'})
    const token = jwt.sign({id:user.id,username:user.username,role:user.role}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'})
    res.json({token,user:{id:user.id,username:user.username,role:user.role}})
  }catch(err){ console.error(err); res.status(500).json({error:'server error'}) }
})

module.exports = router

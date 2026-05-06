const express = require('express')
const router = express.Router()
const pool = require('../db')
const {authMiddleware, adminOnly} = require('./_auth_middleware')

// GET /api/products
router.get('/', authMiddleware, async (req,res)=>{
  try{ const [rows] = await pool.query('SELECT * FROM products'); res.json(rows) }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

// POST /api/products (admin)
router.post('/', authMiddleware, adminOnly, async (req,res)=>{
  const {nama,kategori,harga,stok} = req.body
  try{ const [result] = await pool.query('INSERT INTO products (nama,kategori,harga,stok) VALUES (?,?,?,?)',[nama,kategori,harga,stok]); const [rows]=await pool.query('SELECT * FROM products WHERE id=?',[result.insertId]); res.json(rows[0]) }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

// PUT /api/products/:id (admin)
router.put('/:id', authMiddleware, adminOnly, async (req,res)=>{
  const id = req.params.id; const {nama,kategori,harga,stok} = req.body
  try{ await pool.query('UPDATE products SET nama=?,kategori=?,harga=?,stok=? WHERE id=?',[nama,kategori,harga,stok,id]); const [rows]=await pool.query('SELECT * FROM products WHERE id=?',[id]); res.json(rows[0]) }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

// DELETE /api/products/:id (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req,res)=>{
  const id = req.params.id
  try{ await pool.query('DELETE FROM products WHERE id=?',[id]); res.json({success:true}) }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

module.exports = router

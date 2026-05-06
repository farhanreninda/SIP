const express = require('express')
const router = express.Router()
const pool = require('../db')
const {authMiddleware, adminOnly} = require('./_auth_middleware')

// GET /api/transactions - list
router.get('/', authMiddleware, async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY id DESC')
    // load items
    for(const tx of rows){ const [items]=await pool.query('SELECT * FROM transaction_items WHERE transaction_id=?',[tx.id]); tx.items = items }
    res.json(rows)
  }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

// POST /api/transactions/checkout
router.post('/checkout', authMiddleware, async (req,res)=>{
  const {items,total} = req.body
  if(!items || !items.length) return res.status(400).json({error:'no items'})
  const conn = await pool.getConnection()
  try{
    await conn.beginTransaction()
    const [r] = await conn.query('INSERT INTO transactions (total,created_at) VALUES (?,NOW())',[total])
    const txId = r.insertId
    for(const it of items){ await conn.query('INSERT INTO transaction_items (transaction_id,product_id,nama,harga,qty) VALUES (?,?,?,?,?)',[txId,it.id,it.nama,it.harga,it.qty]); await conn.query('UPDATE products SET stok = GREATEST(0,stok-?) WHERE id=?',[it.qty,it.id]) }
    await conn.commit()
    const [txRows] = await conn.query('SELECT * FROM transactions WHERE id=?',[txId])
    const [itemsRows] = await conn.query('SELECT * FROM transaction_items WHERE transaction_id=?',[txId])
    const tx = txRows[0]; tx.items = itemsRows
    res.json(tx)
  }catch(e){ await conn.rollback(); console.error(e); res.status(500).json({error:'server'}) }finally{ conn.release() }
})

// GET /api/transactions/report?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/report', authMiddleware, async (req,res)=>{
  const {from,to} = req.query
  if(!from||!to) return res.status(400).json({error:'from/to required'})
  try{
    const [rows] = await pool.query('SELECT * FROM transactions WHERE DATE(created_at) BETWEEN ? AND ?',[from,to])
    for(const tx of rows){ const [items]=await pool.query('SELECT * FROM transaction_items WHERE transaction_id=?',[tx.id]); tx.items = items }
    res.json(rows)
  }catch(e){console.error(e);res.status(500).json({error:'server'})}
})

module.exports = router

#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
require('dotenv').config()

async function runStatements(conn, sql) {
  const statements = sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await conn.query(statement)
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: false
  })

  const schema = fs.readFileSync(path.join(__dirname, 'databases', 'schema.sql'), 'utf8')
  await runStatements(conn, schema)

  const [counts] = await conn.query(`
    SELECT
      (SELECT COUNT(*) FROM admin) AS admin,
      (SELECT COUNT(*) FROM pelanggan) AS pelanggan,
      (SELECT COUNT(*) FROM menu) AS menu,
      (SELECT COUNT(*) FROM pesanan) AS pesanan,
      (SELECT COUNT(*) FROM transaksi) AS transaksi
  `)

  console.log(JSON.stringify(counts[0], null, 2))
  await conn.end()
}

main().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})

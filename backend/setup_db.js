const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });

  console.log('Connecting to MySQL...');

  // Create Database
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Database "${process.env.DB_NAME}" ensured.`);

  await connection.query(`USE ${process.env.DB_NAME}`);

  // Read schema.sql
  const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split by semicolon but ignore ones inside strings or comments if any (simple split here)
  const statements = schema
    .replace(/--.*$/gm, '') // remove comments
    .split(';')
    .filter(st => st.trim().length > 0);

  console.log('Running migrations...');
  for (let statement of statements) {
    if (statement.toLowerCase().includes('create database')) continue;
    if (statement.toLowerCase().includes('use ')) continue;
    await connection.query(statement);
  }

  console.log('Migrations completed successfully.');
  await connection.end();
}

setup().catch(err => {
  console.error('Error during setup:', err);
  process.exit(1);
});

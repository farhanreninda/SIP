Setup backend (Node.js + MySQL)

1. Install Node.js (v16+ recommended).
2. Copy `.env.example` to `.env` and fill DB credentials and `JWT_SECRET`.
3. Create the database using phpMyAdmin or mysql CLI:
   - In phpMyAdmin: create database `penjualan` (or import `migrations/schema.sql`).
   - Or from terminal: `mysql -u root -p < backend/migrations/schema.sql`
4. Install dependencies:

```bash
cd backend
npm install
```

5. Create admin user (hash password). From project root you can run a small Node snippet:

```js
// run with: node create_admin.js
const bcrypt = require('bcrypt')
const mysql = require('mysql2/promise')
require('dotenv').config()
;(async()=>{
  const p = await bcrypt.hash('admin',10)
  const conn = await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME})
  await conn.query('INSERT INTO users (username,password,role) VALUES (?,?,?)',['admin',p,'admin'])
  console.log('admin user created')
  process.exit(0)
})()
```

6. Start server:

```bash
npm run start
```

7. API endpoints:
- `POST /api/auth/login` {username,password} => {token,user}
- `GET /api/products` (auth)
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `GET /api/transactions` (auth)
- `POST /api/transactions/checkout` (auth)
- `GET /api/transactions/report?from=YYYY-MM-DD&to=YYYY-MM-DD` (auth)

8. Next steps: integrate frontend to call these endpoints (modify `js/services/api.js`).

Create admin helper
-------------------
There's a small helper script `create_admin.js` in the `backend/` folder. From the backend folder run:

```bash
# create user 'admin' with password 'admin' (change password immediately)
node create_admin.js admin admin

# or use env variables
ADMIN_USER=admin ADMIN_PASS=YourStrongPass node create_admin.js
```

This will insert (or update) an admin user in the `users` table using a bcrypt-hashed password.

Setup BE (Node.js + MySQL)

1. Install Node.js (v16+ recommended).
2. Copy `.env.example` to `.env` and fill DB credentials and `JWT_SECRET`.
3. Install dependencies:

```bash
cd be
npm install
```

4. Create the database schema:

```bash
npm run migrate
```

5. Create admin user:

```bash
node create_admin.js admin admin
```

6. Start server:

```bash
npm run start
```

7. API endpoints:
- `POST /v1/auth/login` {username,password} => {token,user}
- `GET /v1/menu` (auth)
- `GET /v1/menu/public`
- `POST /v1/menu` (admin)
- `PUT /v1/menu/:id` (admin)
- `DELETE /v1/menu/:id` (admin)
- `GET /v1/pesanan` (auth)
- `POST /v1/pesanan/public`
- `GET /v1/pesanan/tracking/:kode`
- `PUT /v1/pesanan/:id/status` (admin)
- `GET /v1/transaksi` (auth)
- `POST /v1/transaksi/checkout` (auth)
- `GET /v1/laporan?from=YYYY-MM-DD&to=YYYY-MM-DD` (auth)

8. Next steps: integrate FE to call these endpoints (modify `fe/js/services/api.js`).

Create admin helper
-------------------
There's a small helper script `create_admin.js` in the `be/` folder. From the `be` folder run:

```bash
# create user 'admin' with password 'admin' (change password immediately)
node create_admin.js admin admin

# or use env variables
ADMIN_USER=admin ADMIN_PASS=YourStrongPass node create_admin.js
```

This will insert (or update) an admin user in the `admin` table using a bcrypt-hashed password.

Deploy & Run (local) — Sistem Informasi Penjualan

Prerequisites
- Node.js v16+ (https://nodejs.org)
- MySQL (or XAMPP/WAMP on Windows) with phpMyAdmin (optional)
- Git (optional)

1) Create the database
- Using phpMyAdmin (XAMPP/WAMP):
  - Start Apache + MySQL
  - Open http://localhost/phpmyadmin
  - Create database `penjualan` (utf8mb4)
  - Select the new DB and use Import → choose `backend/migrations/schema.sql` and run

- Or using MySQL CLI:
```bash
mysql -u root -p < backend/migrations/schema.sql
# or create DB then import
mysql -u root -p
CREATE DATABASE penjualan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
mysql -u root -p penjualan < backend/migrations/schema.sql
```

2) Configure backend
- Copy `.env.example` to `.env` in `backend/` and edit values (DB credentials, JWT secret):
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=penjualan
JWT_SECRET=change_this_secret
PORT=3000
```

3) Install and start backend
```bash
cd backend
npm install
# create an admin user (see next step) then start
npm run start
# or for development with auto-reload
npm run dev
```

4) Create admin user
- There's a helper script at `backend/create_admin.js`.
- Usage (from `backend/` folder):
```bash
# username password (role optional)
node create_admin.js admin StrongPassword123
# or use env vars
ADMIN_USER=admin ADMIN_PASS=StrongPassword123 node create_admin.js
```
The script will insert or update the `users` table with a bcrypt-hashed password.

5) Serve frontend (static)
- You can serve the frontend folder (project root) using a simple static server:
```bash
# from project root
npx http-server . -c-1
# or
python -m http.server 8000
```
- By default the frontend will call `http://localhost:3000` for the API. If your backend runs on a different host/port, set `window.API_BASE_URL` in `index.html` to the backend URL (before `js/services/api.js`).

6) Verify
- Open the frontend (e.g. http://127.0.0.1:8080), login with the admin account you created.
- Test adding products, creating transactions, and viewing dashboard.

Production notes
- Use a managed MySQL instance (RDS, Cloud SQL) or a production DB server.
- Use HTTPS and a strong `JWT_SECRET`.
- Use a process manager (PM2) or container (Docker) for the backend. Use nginx or a CDN to serve static frontend.
- Configure CORS (if needed) to restrict origins.

Git / Commit example
```bash
git add .
git commit -m "feat: add backend API, Vuetify UI and deploy docs"
git push origin main
```

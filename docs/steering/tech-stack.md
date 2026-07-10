# Tech Stack Steering

## Runtime

- Frontend: static HTML/CSS/JavaScript, tanpa bundler.
- Backend: Node.js + Express.
- Database: MySQL/MariaDB.
- Local environment yang didokumentasikan: Laragon.
- Deployment frontend: GitHub Pages via GitHub Actions.

## Frontend Libraries

Dimuat via CDN di HTML:

- Vue 2 (`https://cdn.jsdelivr.net/npm/vue@2`)
- Vuetify 2.6.14
- Material Design Icons font `@mdi/font@6.x`
- Chart.js
- Google Font Inter

Konsekuensi:

- Tidak ada `npm run build` untuk frontend.
- Semua komponen harus kompatibel dengan browser runtime global.
- Jangan memakai import/export module kecuali arsitektur FE diubah secara sadar.
- Cache busting dilakukan manual lewat query `?v=...` pada asset script/CSS.

## Backend Dependencies

`be/package.json`:

- `express`: HTTP server/routing.
- `cors`: CORS open untuk FE static.
- `dotenv`: environment variables.
- `mysql2`: promise-based MySQL pool.
- `jsonwebtoken`: JWT auth.
- `bcrypt`: password hashing.
- `nodemon`: dev server.

Scripts:

```bash
npm run start        # node ./bin/www
npm run dev          # nodemon --trace-warnings ./bin/www
npm run migrate      # node migrate.js
npm run seed         # node seed_dummy.js
npm run create-admin # node create_admin.js
```

## Environment Variables

Backend membaca:

- `DB_HOST`, default `localhost`.
- `DB_USER`, default `root`.
- `DB_PASS`, default empty.
- `DB_NAME`, default `penjualan`.
- `JWT_SECRET`, default `secret`.
- `ADMIN_USER`, optional untuk `create_admin.js`.
- `ADMIN_PASS`, optional untuk `create_admin.js`.

Disarankan membuat `.env` di `be/` untuk environment lokal/production. Jangan commit secret.

## Database

Schema utama: `be/databases/schema.sql`.

Migration:

```bash
cd be
npm run migrate
```

Seed dummy:

```bash
cd be
npm run seed
```

Create/update admin:

```bash
cd be
node create_admin.js admin admin
```

Default database name adalah `penjualan`.

## API Transport

Default backend:

```text
http://localhost:3000
```

Default API prefix:

```text
/v1
```

Untuk ngrok/localtunnel, FE bisa memakai `api.php` sebagai proxy:

```text
api.php?path=/v1/...
```

`api.php` meneruskan method, header, query, dan body ke `http://localhost:3000`.

## Deployment

GitHub Pages workflow ada di `.github/workflows/deploy-pages.yml`.

- Trigger: push ke `main` atau manual `workflow_dispatch`.
- Artifact path: `fe`.
- Artinya hanya frontend static yang dipublish.
- Backend/API/MySQL tidak otomatis ikut deploy.

URL dokumentasi lama menyebut variasi:

```text
https://farhanreninda.github.io/SIP/
https://farhanreninda.github.io/SIP/pelanggan/
https://farhanreninda.github.io/SIP/admin/
```

Saat publish static-only, pastikan backend reachable dari browser atau FE akan memakai fallback localStorage.

## Tooling dan Verification

Tidak ditemukan test runner otomatis. Verifikasi minimal:

1. Jalankan backend:

```bash
cd be
npm run start
```

2. Cek health:

```text
GET http://localhost:3000/health
```

3. Login:

```text
POST http://localhost:3000/v1/auth/login
```

4. Coba flow UI:

- Admin login.
- CRUD menu.
- Pelanggan buat pesanan.
- Admin ubah pesanan ke selesai.
- Cek transaksi dan laporan.

## Compatibility Rules

- Backend harus tetap mengembalikan alias `id`/`id_menu` dan `nama`/`nama_menu` untuk menu.
- FE `Api` harus tetap menyediakan nama lama seperti `getProducts`, `addProduct`, `getLaporan` selain nama domain baru.
- Laporan berbasis tabel `transaksi`, bukan langsung `pesanan`.
- Pembayaran saat ini dinormalisasi sebagai `Tunai`.


# Architecture Steering

## Gambaran Besar

Repository ini berisi aplikasi penjualan full-stack sederhana dengan frontend static dan backend API terpisah.

```text
sip-web/
  fe/                 Frontend static Vue 2 + Vuetify
  be/                 Backend Express + MySQL
  admin/              Redirect ke fe/admin.html
  pelanggan/          Redirect ke fe/pelanggan.html
  api.php             Reverse proxy ke backend Node port 3000
  index.html          Portal pilihan Admin/Pelanggan
```

Frontend bertanggung jawab atas UX admin dan pelanggan. Backend bertanggung jawab atas autentikasi, validasi utama, transaksi database, stok, dan laporan. Database MySQL menjadi source of truth saat backend tersedia, tetapi FE juga memiliki fallback `localStorage` untuk mode demo/offline.

## Frontend Architecture

Frontend berada di `fe/` dan tidak memakai build step.

- `fe/index.html` adalah portal masuk ke admin dan pelanggan.
- `fe/admin.html` membuat root Vue app untuk panel admin.
- `fe/pelanggan.html` membuat root Vue app untuk pelanggan.
- `fe/js/services/api.js` adalah facade API tunggal yang dipakai semua komponen.
- `fe/js/components/*.js` berisi Vue global components.
- `fe/assets/css/style.css` adalah stylesheet utama untuk admin, pelanggan, dialog, print, responsive, dan utility class.

Pola komponen:

- Komponen didefinisikan dengan `Vue.component('nama-komponen', { ... })`.
- Template ditulis inline sebagai template literal.
- State lokal berada di `data()`.
- Derived state berada di `computed`.
- Network/data loading berada di method seperti `load()`, `loadAll()`, `refreshOrders()`.
- Feedback UI memakai `inline-feedback`, `window.notify`, dan `window.Confirm`.

Komponen utama:

- `login-page`: login admin, remember username/password, session feedback.
- `dashboard-page`: ringkasan omzet, pesanan, menu aktif, stok rendah, chart Chart.js.
- `order-page`: daftar/group pesanan, filter status/tanggal, update status, hapus, export CSV.
- `transaction-page`: kasir manual, cart, checkout, riwayat transaksi, print struk/laporan.
- `menu-page`: CRUD menu, kategori, stok, harga, modal, gambar, deskripsi.
- `report-page`: laporan penjualan periodik, summary, chart, print.
- `customer-scan-page`: input nama pelanggan dan nomor meja.
- `customer-menu-page`: menu digital, cart pelanggan, kirim pesanan.
- `customer-tracking-page`: tracking status pesanan berdasarkan kode.
- `mobile-bottom-nav`: navigasi bawah untuk flow pelanggan mobile.

## API Facade

`fe/js/services/api.js` menentukan base URL backend:

- Jika `window.API_BASE_URL` tersedia, gunakan itu.
- Jika hostname mengandung `ngrok` atau `loca.lt`, gunakan `api.php` dengan query `?path=/v1`.
- Selain itu gunakan `protocol//hostname:3000`.

Facade mencoba HTTP API lebih dulu, lalu fallback ke `localStorage` untuk banyak operasi. Khusus mutasi admin, jika session bukan `local-session`, error auth tetap dianggap fatal dan memicu logout.

Local storage key penting:

- `penjualan_v1`: data demo/fallback.
- `token`: JWT atau `local-session`.
- `currentUser`: user admin aktif.
- `sip_admin_session_expires_at`: expiry session admin.
- `sip_admin_active_page`: halaman admin terakhir.
- `sip_customer_*`: session pelanggan, table, last order code, cart state.

## Backend Architecture

Backend berada di `be/` dan memakai struktur Express klasik:

```text
be/
  app.js
  bin/www
  config/mysql.js
  routes/index.js
  routes/v1/*.js
  controllers/*.controller.js
  models/mysql/*.js
  middleware/auth.js
  exceptions/*.js
  databases/schema.sql
```

Layering yang harus dipertahankan:

- `app.js`: setup Express, CORS, parser, root router, 404, error handler.
- `routes`: hanya mapping endpoint ke controller dan middleware.
- `controllers`: validasi request, transaction orchestration, response shape.
- `models/mysql`: query SQL, mapper row, helper payload.
- `config/mysql.js`: pool MySQL.
- `middleware/auth.js`: JWT authentication dan `adminOnly`.

## Database Model

Schema utama ada di `be/databases/schema.sql`.

Tabel:

- `admin`: user admin, password bcrypt, role.
- `pelanggan`: nama pelanggan, nomor meja, kode pelanggan.
- `menu`: menu jualan, kategori, stok, harga, modal, gambar, deskripsi.
- `pesanan`: item pesanan per baris menu, status, kode pesanan.
- `transaksi`: snapshot transaksi per item, menyimpan nama/harga/modal/subtotal/laba.

Relasi penting:

- `pesanan.id_pelanggan -> pelanggan.id_pelanggan`.
- `pesanan.id_menu -> menu.id_menu` dengan `ON DELETE RESTRICT`.
- `transaksi.id_pesanan -> pesanan.id_pesanan` dengan `ON DELETE SET NULL`.
- `transaksi.id_menu`, `id_pelanggan`, `id_user` juga `SET NULL`.

`transaksi` sengaja menyimpan snapshot `nama_menu`, `nama_pelanggan`, `harga`, dan `modal` agar laporan historis tidak rusak saat master data berubah.

## Coding Style

Backend:

- CommonJS (`require`, `module.exports`).
- Tidak memakai semicolon.
- Async/await untuk query.
- SQL parameterized dengan placeholder `?`.
- Error response sederhana: `{ error: '...' }`.
- Mapper mengembalikan alias ganda untuk kompatibilitas FE, misalnya `id` dan `id_menu`, `nama` dan `nama_menu`.

Frontend:

- Vue 2 Options API global component.
- Banyak class CSS domain-specific, bukan utility framework.
- Format uang dilakukan di komponen dengan `Intl.NumberFormat('id-ID')`.
- Icons memakai Material Design Icons melalui Vuetify/MDI.
- Chart memakai global `window.Chart`.

## Prinsip Perubahan

- Jika menambah endpoint, tambahkan route, controller method, model method, dan method facade di `Api`.
- Jika menambah field menu/pesanan/transaksi, update database schema, mapper BE, normalizer FE, fallback localStorage, dan UI form/table.
- Jika memperbaiki flow stok/transaksi, prioritaskan transaction database (`conn.beginTransaction`, `FOR UPDATE`, rollback).
- Jika menambah UI, ikuti class/token di `style.css` dan jangan membuat sistem desain paralel.


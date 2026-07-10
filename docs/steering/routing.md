# Routing Steering

## Frontend Routes

Frontend tidak memakai Vue Router. Routing dilakukan dengan file HTML, wrapper redirect, query string, dan state Vue lokal.

### Root Portal

```text
/index.html
/fe/index.html
```

Menampilkan pilihan:

- Admin: link ke `./admin/` pada root portal atau `./admin/` relatif dari `fe/`.
- Pelanggan: link ke `./pelanggan/`.

### Admin

Entry points:

```text
/admin/
/admin/index.html
/fe/admin.html
/fe/admin/
/fe/admin/index.html
```

Wrapper:

- `admin/index.html` redirect ke `../fe/admin.html`.
- `fe/admin/index.html` ada sebagai entry/wrapper folder untuk GitHub Pages atau path folder.

Admin app tidak memakai URL path untuk halaman internal. State halaman disimpan di:

```text
sip_admin_active_page
```

Halaman internal:

- `dashboard`
- `order`
- `transaction`
- `menu`
- `report`

### Pelanggan

Entry points:

```text
/pelanggan/
/pelanggan/index.html
/fe/pelanggan.html
/fe/pelanggan/
/fe/pelanggan/index.html
```

Wrapper:

- `pelanggan/index.html` redirect ke `../fe/pelanggan.html` sambil mempertahankan query string dan hash.

Query yang dikenali:

- `?meja=A1`
- `?no_meja=A1`
- `?table=A1`
- `?kode=PSN-000001`
- `?nama=Budi&meja=A1`

Halaman internal pelanggan:

- `scan`
- `customer-menu`
- `tracking`

State halaman pelanggan disimpan di:

```text
sip_customer_active_page
```

## Backend Routes

Root backend:

```text
GET /
GET /health
```

API version prefix:

```text
/v1
```

### Public API

Tidak membutuhkan JWT:

```text
POST /v1/auth/login
GET  /v1/menu/public
POST /v1/pesanan/public
GET  /v1/pesanan/tracking/:kode
```

### Protected API

Semua route setelah public route di `be/routes/v1/index.js` memakai middleware `authentication`.

Menu:

```text
GET    /v1/menu
POST   /v1/menu       adminOnly
PUT    /v1/menu/:id   adminOnly
DELETE /v1/menu/:id   adminOnly
```

Pesanan:

```text
GET    /v1/pesanan
PUT    /v1/pesanan/:id/status   adminOnly
DELETE /v1/pesanan/:id          adminOnly
```

Transaksi:

```text
GET  /v1/transaksi
POST /v1/transaksi/checkout
GET  /v1/transaksi/report
```

Catatan: `GET /v1/transaksi/report` ada di route/controller, tetapi facade FE saat ini memakai `GET /v1/laporan` untuk laporan.

Laporan:

```text
GET /v1/laporan
```

## Auth Routing

Header yang dibutuhkan untuk protected route:

```text
Authorization: Bearer <jwt>
```

JWT payload:

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "nama_user": "Administrator"
}
```

Middleware:

- `authentication`: validasi JWT, set `req.user`.
- `adminOnly`: lanjut hanya jika `req.user.role === 'admin'`.

## Proxy Routing via api.php

`api.php` membuat reverse proxy ke:

```text
http://localhost:3000
```

Format:

```text
/api.php?path=/v1/menu/public
/api.php?path=/v1/auth/login
```

Jika ada query tambahan:

```text
/api.php?path=/v1/laporan&from=2026-05-01&to=2026-05-31
```

FE otomatis memilih mode proxy bila hostname mengandung `ngrok` atau `loca.lt`.

## Routing Rules Untuk Perubahan

- Public pelanggan harus tetap tersedia tanpa token.
- Semua data admin selain login harus tetap protected.
- Tambahkan route public sebelum `router.use(authentication)` di `be/routes/v1/index.js`.
- Tambahkan route protected setelah `router.use(authentication)`.
- Jangan membuat route FE baru yang memutus wrapper existing kecuali semua entry point diperbarui.
- Bila menambah route backend, update `fe/js/services/api.js` dan dokumentasi ini.


# Deploy & Run Lokal

Project dipisah menjadi:

```text
fe/  # tampilan web
be/  # API dan database
```

## 1. Database

Buka phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Database yang dipakai:

```text
penjualan
```

Schema ada di:

```text
be/databases/schema.sql
```

## 2. BE

Dari folder `be`:

```bash
npm install
node migrate.js
node seed_dummy.js
npm run start
```

BE berjalan di:

```text
http://localhost:3000
```

## 3. FE

Jika Laragon masih mengarah ke root project `SIP`, akses:

```text
http://sip.test/fe/
http://sip.test/fe/admin.html
http://sip.test/fe/pelanggan.html
```

Jika Laragon virtual host diarahkan langsung ke `SIP/fe`, akses:

```text
http://sip.test/
http://sip.test/admin.html
http://sip.test/pelanggan.html
```

## 4. Login

```text
username: admin
password: admin
```

## 5. Catatan

FE memanggil BE melalui:

```js
window.API_BASE_URL = 'http://localhost:3000'
```

Endpoint utama menggunakan prefix `/v1`, misalnya `POST /v1/auth/login` dan `GET /v1/menu`.

Jika BE dipindah ke domain/port lain, ubah nilai `window.API_BASE_URL` di file HTML FE.

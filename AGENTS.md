# AGENTS.md

Panduan awal untuk AI/coding agent yang bekerja di repository `sip-web`.

## Wajib Dibaca Saat Memulai Session

Baca file memory dan steering berikut sebelum mengubah source code:

- [memory.md](memory.md) - memori lintas session berisi keputusan, ringkasan session, technical debt, dan pending task.
- [docs/steering/architecture.md](docs/steering/architecture.md) - peta arsitektur aplikasi, boundary FE/BE, struktur folder, dan pola data.
- [docs/steering/system-flow.md](docs/steering/system-flow.md) - alur bisnis admin, pelanggan, pesanan, transaksi, stok, laporan, dan session.
- [docs/steering/tech-stack.md](docs/steering/tech-stack.md) - teknologi, dependency, runtime, command lokal, database, deployment, dan tooling.
- [docs/steering/routing.md](docs/steering/routing.md) - route frontend, route backend, proteksi endpoint, proxy PHP, dan aturan URL.
- [docs/steering/design-system.md](docs/steering/design-system.md) - gaya UI, token warna, komponen, responsive behavior, dan pola interaksi.

## Protokol Memory

Gunakan [memory.md](memory.md) sebagai memori lintas session project.

- Saat memulai session, auto-load `memory.md` setelah membaca `AGENTS.md`, lalu gunakan catatan keputusan sebelumnya sebagai konteks kerja.
- Setiap kali menyelesaikan task penting, append ringkasan keputusan ke `memory.md` dengan format persis:

```text
[tanggal] — [task] — [keputusan] — [alasan]
```

- Setiap akhir session, append summary lengkap ke `memory.md` yang mencakup:
  - apa yang sudah dikerjakan,
  - keputusan penting,
  - technical debt,
  - pending task.
- Jika user mengetik `Close Session`, wajib append final summary ke `memory.md` sebelum memberi respons penutup.
- Jangan menghapus isi lama `memory.md`; tambahkan catatan baru secara append agar histori tetap utuh.
- Gunakan tanggal lokal session dalam format `YYYY-MM-DD`.

## Ringkasan Project

`sip-web` adalah Sistem Informasi Penjualan untuk Warung Bakso Tulus. Aplikasi terdiri dari:

- Frontend static di `fe/`, memakai Vue 2 global components, Vuetify 2, Chart.js, CSS custom di `fe/assets/css/style.css`, dan CDN assets.
- Backend API di `be/`, memakai Express 4, MySQL via `mysql2/promise`, JWT auth, bcrypt, dan struktur route/controller/model.
- Wrapper/redirect HTML di root, `admin/`, dan `pelanggan/` untuk memudahkan akses dari Laragon atau GitHub Pages.
- `api.php` sebagai reverse proxy sederhana ke backend Node port 3000 untuk skenario ngrok/localtunnel via port 80.

## Aturan Kerja

- Pertahankan pemisahan boundary: FE tidak mengakses database langsung; BE tidak mengurus tampilan.
- Ikuti pola file yang sudah ada: route tipis, controller untuk validasi/orchestration, model MySQL untuk query dan mapping.
- FE memakai komponen Vue global (`Vue.component`) dan satu facade `window.Api`; jangan memperkenalkan bundler atau framework baru tanpa kebutuhan eksplisit.
- Gunakan nama domain bisnis yang sudah ada: `menu`, `pelanggan`, `pesanan`, `transaksi`, `laporan`, `admin`.
- Jaga compatibility antara HTTP API dan fallback `localStorage` di `fe/js/services/api.js`.
- Untuk perubahan database, update `be/databases/schema.sql` dan pertimbangkan script optimasi/migrasi yang relevan.
- Jangan mengubah wrapper URL (`admin/`, `pelanggan/`, `fe/admin/`, `fe/pelanggan/`) tanpa mengecek GitHub Pages dan Laragon flow.

## Kondisi Repo Yang Perlu Diwaspadai

- `README.md` saat discan masih mengandung Git conflict marker (`<<<<<<< HEAD`, `=======`, `>>>>>>> feature/redesign`). Jangan jadikan README sebagai satu-satunya sumber kebenaran sampai conflict dibersihkan.
- Tidak terlihat test suite otomatis. Verifikasi perubahan dengan menjalankan server lokal, memanggil endpoint utama, dan mencoba flow UI secara manual.
- File CSS besar dan memiliki beberapa generasi style/token. Saat menambah style, cari class yang sudah ada dulu agar tidak menambah duplikasi.

## Command Umum

Backend:

```bash
cd be
npm install
npm run migrate
npm run seed
npm run start
```

Frontend static:

```text
http://sip-web.test/fe/
http://sip-web.test/fe/admin.html
http://sip-web.test/fe/pelanggan.html
```

Backend API default:

```text
http://localhost:3000
```

# Sistem Informasi Penjualan

Sistem Informasi Penjualan Berbasis Web adalah aplikasi berbasis web yang digunakan untuk membantu pengelolaan penjualan pada Warung Bakso Tulus secara terstruktur dan real-time. Aplikasi ini memungkinkan admin untuk mengelola menu, pesanan, transaksi, stok, dan laporan penjualan. Pelanggan dapat membuka menu digital, membuat pesanan, serta melakukan tracking pesanan.

## Fitur Utama

### Admin

- Dashboard
  - Ringkasan penjualan
  - Grafik penjualan
  - Informasi menu terlaris
  - Ringkasan transaksi dan item terjual

- Manajemen Menu
  - Tambah, edit, hapus menu
  - Kategori menu
  - Manajemen stok
  - Harga jual, modal/HPP, gambar, dan deskripsi menu

- Manajemen Pesanan
  - Melihat pesanan pelanggan
  - Mengubah status pesanan: `baru`, `diproses`, `selesai`, `dibatalkan`
  - Pesanan selesai otomatis masuk ke data transaksi

- Transaksi Penjualan
  - Input transaksi kasir sederhana
  - Keranjang belanja/cart
  - Perhitungan total otomatis
  - Pengurangan stok otomatis
  - Cetak struk pembayaran

- Laporan
  - Laporan penjualan berdasarkan periode
  - Pencarian laporan berdasarkan menu, pelanggan, atau kode transaksi
  - Rekap omzet, modal, laba/rugi, dan item terjual
  - Export CSV/Excel
  - Cetak PDF melalui fitur print browser

- Manajemen User
  - Login dan logout admin
  - Role admin

### Customer

- Menu Digital
  - Akses pelanggan terpisah dari admin
  - Input nama pelanggan dan nomor meja
  - Lihat daftar menu
  - Melihat harga, stok, dan deskripsi menu

- Pemesanan
  - Tambah menu ke keranjang
  - Mengatur jumlah pesanan
  - Mengirim pesanan ke admin
  - Mendapatkan kode pesanan

- Tracking Pesanan
  - Cek status pesanan berdasarkan kode pesanan
  - Melihat status `baru`, `diproses`, `selesai`, atau `dibatalkan`
  - Pelanggan tidak perlu login admin

## Cara Pakai

1. Jalankan BE dari folder `be`.

```bash
cd be
npm install
node migrate.js
node seed_dummy.js
npm run start
```

2. Buka halaman pilihan admin/customer.

Jika Laragon masih mengarah ke root project `sip-web`:

```text
http://sip-web.test/fe/
```

3. Buka halaman admin.

Jika Laragon masih mengarah ke root project `sip-web`:

```text
http://sip-web.test/fe/admin.html
```

Jika Laragon diarahkan langsung ke folder `sip-web/fe`:

```text
http://sip-web.test/admin.html
```

4. Login admin.

```text
username: admin
password: admin
```

5. Buka halaman pelanggan.

Jika Laragon masih mengarah ke root project `sip-web`:

```text
http://sip-web.test/fe/pelanggan.html
```

Jika Laragon diarahkan langsung ke folder `sip-web/fe`:

```text
http://sip-web.test/pelanggan.html
```

6. Gunakan menu `Dashboard`, `Pesanan`, `Transaksi`, `Menu`, dan `Laporan` pada halaman admin.

7. Pada halaman pelanggan, isi nama dan nomor meja untuk melihat menu digital dan membuat pesanan.

## Catatan Teknis

- Folder FE ada di `fe`.
- Folder BE ada di `be` dengan struktur Express seperti `juggernaut-be`: `app.js`, `bin/www`, `routes/v1`, `controllers`, `models`, `config`, `middleware`, `exceptions`, dan `databases`.
- BE API berjalan di `http://localhost:3000`.
- Database disimpan di MySQL dengan nama database `penjualan`.
- Schema database ada di `be/databases/schema.sql`.
- API memakai prefix `/v1`: `auth`, `menu`, `pesanan`, `transaksi`, dan `laporan`.
- Struktur utama database menggunakan tabel `admin`, `pelanggan`, `menu`, `pesanan`, dan `transaksi`.
- Data dummy dapat dibuat ulang dengan menjalankan `node seed_dummy.js` dari folder `be`.
- phpMyAdmin dapat diakses melalui `http://localhost/phpmyadmin`.

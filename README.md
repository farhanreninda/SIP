# Sistem Informasi Penjualan

Sistem Informasi Penjualan Berbasis Web adalah aplikasi berbasis web yang digunakan untuk membantu pengelolaan penjualan secara terstruktur dan real-time. Aplikasi ini memungkinkan pengguna untuk mengelola data produk, melakukan transaksi penjualan, serta melihat laporan penjualan secara otomatis melalui dashboard yang interaktif.

🚀 Fitur Utama
- Dashboard
  - Ringkasan penjualan
  - Grafik penjualan
  - Informasi produk terlaris
- Manajemen Produk
  - Tambah, edit, hapus produk
  - Kategori produk
  - Manajemen stok
- Transaksi Penjualan
  - Input transaksi (kasir sederhana)
  - Keranjang belanja (cart)
  - Perhitungan total otomatis
- Manajemen User
  - Login & logout
  - Role (admin & kasir)
- Laporan
  - Laporan penjualan harian & bulanan
  - Rekap produk terlaris
 
Cara pakai:
1. Buka file `index.html` di browser (cukup double-click atau buka via live server).
2. Login menggunakan akun `admin/admin` atau `kasir/kasir`.
3. Gunakan menu `Produk` untuk mengelola produk.
4. Gunakan menu `Transaksi` untuk melakukan penjualan.
5. Lihat ringkasan dan grafik pada `Dashboard`.

Catatan teknis:
- Data disimpan di `localStorage` pada key `penjualan_v1`.
- User yang login disimpan pada `currentUser` di `localStorage`.
- Untuk reset data, hapus `penjualan_v1` di Storage browser.

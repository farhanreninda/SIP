# Sistem Informasi Penjualan (Frontend)

Aplikasi SPA sederhana untuk keperluan pencatatan penjualan. Dibangun menggunakan Vue 2, Chart.js, dan localStorage sehingga dapat dijalankan tanpa backend.

Fitur:
- Manajemen produk: tambah / edit / hapus, kategori, stok
- Transaksi: kasir sederhana, cart, checkout, stok otomatis berkurang
- Login: user default `admin/admin` dan `kasir/kasir` dengan role sederhana
- Dashboard: ringkasan penjualan hari ini, grafik penjualan 6 bulan, produk terlaris

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

Jika mau, saya bisa menambahkan export CSV laporan, atau integrasi backend sederhana (Node/Express).
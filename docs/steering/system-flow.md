# System Flow Steering

## Aktor

- Admin: login, melihat dashboard, mengelola pesanan, membuat transaksi kasir, mengelola menu, melihat laporan.
- Pelanggan: membuka menu digital, mengisi nama/nomor meja, membuat pesanan, tracking status pesanan.

## Flow Admin Login

1. Admin membuka `fe/admin.html` atau wrapper `admin/`.
2. Root Vue app mengecek `localStorage.currentUser` dan `Api.hasValidAdminSession()`.
3. Jika belum valid, tampil `login-page`.
4. `login-page` memanggil `Api.login({ username, password })`.
5. API HTTP mengarah ke `POST /v1/auth/login`.
6. Backend mencari user di tabel `admin`, membandingkan password bcrypt, lalu membuat JWT 8 jam.
7. FE menyimpan `token`, `sip_admin_session_expires_at`, dan `currentUser`.
8. Jika HTTP gagal dan local fallback valid, FE memakai `token = local-session`.

Session admin harus dianggap tidak valid bila token/expiry/currentUser hilang atau expired. Saat API mengembalikan 401/403, `Api` menghapus session dan dispatch event `sip:auth-expired`.

## Flow Pelanggan Membuat Pesanan

1. Pelanggan membuka `fe/pelanggan.html` atau wrapper `pelanggan/`.
2. Query parameter bisa mengatur meja/kode:
   - `?meja=A1`, `?no_meja=A1`, atau `?table=A1` mengisi nomor meja.
   - `?kode=PSN-000001` langsung membuka tracking.
   - `?nama=...&meja=...` langsung membuat session pelanggan.
3. `customer-scan-page` menerima nama dan nomor meja.
4. `customer-menu-page` mengambil menu public melalui `Api.getPublicMenu()`.
5. Pelanggan menambahkan item ke cart, mengatur qty, dan catatan.
6. `sendOrder()` memanggil `Api.createPublicOrder()`.
7. Backend `POST /v1/pesanan/public` membuat satu pelanggan baru dan satu atau lebih baris `pesanan`.
8. Semua item dalam satu request memakai `kode_pesanan` yang sama.
9. Response mengembalikan `kode_pesanan`, `kode_pelanggan`, dan daftar baris pesanan.
10. FE menyimpan kode ke session pelanggan dan membuka tracking.

Catatan pesanan:

- Backend menggabungkan catatan item dan catatan umum dalam `keterangan`.
- Jika ada catatan umum, nilai disimpan sebagai JSON string `{ item, umum }`.
- Model pesanan memecah ulang menjadi `keterangan`, `catatan_produk`, dan `catatan_umum`.

## Flow Tracking Pesanan

1. Pelanggan membuka tracking dari UI atau URL `?kode=...`.
2. FE memanggil `GET /v1/pesanan/tracking/:kode`.
3. Backend mengambil semua baris pesanan dengan kode tersebut.
4. FE menghitung status gabungan:
   - Semua `selesai` berarti selesai.
   - Semua `dibatalkan` berarti dibatalkan.
   - Ada `diproses` berarti proses.
   - Selain itu menunggu/baru.
5. Tracking menampilkan progress step dan detail item.

## Flow Admin Kelola Pesanan

1. Admin membuka halaman `order`.
2. `order-page` memanggil `Api.getPesanan()` dengan filter opsional.
3. Backend `GET /v1/pesanan` menerima query `status`, `from`, dan `to`.
4. Data pesanan digrouping di FE berdasarkan `kode_pesanan`.
5. Admin bisa mengubah status group/item ke:
   - `baru`
   - `diproses`
   - `selesai`
   - `dibatalkan`
6. `PUT /v1/pesanan/:id/status` hanya untuk admin.
7. Jika status menjadi `selesai`, backend memanggil `insertTransaksiForPesanan`.
8. Backend mengurangi stok dan membuat baris transaksi jika transaksi untuk pesanan tersebut belum ada.

Hal penting:

- Status `selesai` otomatis menghasilkan transaksi.
- Stok dikurangi saat pesanan selesai.
- Jika stok tidak cukup, update status gagal dan transaction rollback.
- Delete pesanan hanya menghapus baris yang statusnya bukan `selesai`.

## Flow Transaksi Kasir

1. Admin membuka halaman `transaction`.
2. FE mengambil menu dan transaksi.
3. Admin memilih menu, qty, pelanggan/no meja opsional, lalu checkout.
4. `Api.checkout()` memanggil `POST /v1/transaksi/checkout`.
5. Backend membuat pelanggan baru, pesanan dengan status `selesai`, mengurangi stok, dan membuat transaksi.
6. Satu checkout bisa menghasilkan beberapa baris pesanan dan transaksi dengan kode transaksi sama.
7. Response digrouping lewat `MySqlTransaksi.groupRows()`.

Kode:

- Pelanggan: `PLG-0001`.
- Pesanan: `PSN-000001`.
- Transaksi kasir: kode dibuat dari kode pesanan dengan prefix `TRX-`.

## Flow Menu

1. Admin membuka halaman `menu`.
2. FE mengambil `GET /v1/menu`.
3. Admin bisa tambah/edit/hapus menu.
4. Backend menerima payload normal:
   - `nama_menu` atau `nama`
   - `kategori`
   - `harga`
   - `modal`
   - `stok`
   - `gambar`
   - `deskripsi`
5. Model mengembalikan alias untuk FE lama dan baru.

Hapus menu bisa gagal bila menu sudah dipakai di pesanan/transaksi karena foreign key `ON DELETE RESTRICT` pada `pesanan.id_menu`.

## Flow Laporan

1. Admin membuka halaman `report`.
2. FE menentukan periode dan pencarian.
3. `Api.getReport()` memanggil `GET /v1/laporan`.
4. Backend `laporan` menerima query:
   - `from`
   - `to`
   - `q`
5. Query mengambil baris dari `transaksi`, menghitung summary omzet, modal, laba, qty, dan jumlah baris transaksi.
6. FE menampilkan summary, chart, kategori, tabel, export/print.

Perhitungan:

- `omzet = SUM(subtotal)`.
- `modal = SUM(modal * qty)`.
- `laba = SUM(laba)`.
- `qty = SUM(qty)`.

## State dan Persistence

Admin:

- Active page: `sip_admin_active_page`.
- User: `currentUser`.
- Token: `token`.
- Expiry: `sip_admin_session_expires_at`.
- Saved login fields: `savedUsername`, `savedPassword`.

Pelanggan:

- Active page: `sip_customer_active_page`.
- Customer data: `sip_customer_data`.
- Last order: `sip_customer_last_order_code`.
- Order list: `sip_customer_order_codes`.
- Table: `sip_customer_table`.
- Expiry: `sip_customer_session_expires_at`.
- Cart: `sip_customer_cart_state`.

Customer session TTL adalah 8 jam. Admin JWT juga 8 jam.

## Error Handling

- Backend memakai status 400 untuk input/business error, 401 untuk auth, 403 untuk admin-only, 404 untuk not found, 500 untuk server error.
- FE menampilkan inline feedback untuk form, snackbar global untuk notifikasi, dan dialog global untuk konfirmasi.
- HTTP API yang gagal karena network bisa fallback ke `localStorage`, kecuali mutasi admin dengan session HTTP yang sudah auth.


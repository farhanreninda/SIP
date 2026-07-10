# Design System Steering

## Karakter Visual

UI saat ini adalah aplikasi operasional untuk warung makan, bukan landing page. Gaya dominan:

- Bersih, padat, dan dashboard-oriented.
- Warna dasar terang: putih, abu sangat muda, slate text.
- Aksen brand merah bakso (`#c2372f`) pada versi redesign.
- Masih ada token biru lama (`#2563eb`, `#1e3a8a`) yang dipakai beberapa komponen/charts.
- Border halus, shadow ringan, radius umum 8-12px pada komponen baru.

Saat menambah UI, ikuti pola redesign yang dimulai sekitar token `--doc-*` di `style.css`, bukan gaya lama yang sangat biru kecuali area existing memang masih memakai itu.

## CSS Token Utama

Token awal lama:

```css
--bg: #f8fafc;
--card: #ffffff;
--accent: #1e3a8a;
--accent-2: #3b82f6;
--muted: #64748b;
--success: #10b981;
--danger: #ef4444;
--primary-gradient: linear-gradient(135deg, #3b82f6, #2563eb);
```

Token redesign:

```css
--doc-bg: #f5f5f5;
--doc-panel: #ffffff;
--doc-text: #1f2937;
--doc-muted: #9ca3af;
--doc-border: #e7e7e7;
--doc-red: #c2372f;
--doc-red-dark: #a82d27;
--doc-red-soft: #fde8e7;
--doc-green: #10b981;
--doc-yellow: #f59e0b;
--doc-blue: #2563eb;
--primary-gradient: linear-gradient(135deg, #e85d4f, #c2372f);
```

Gunakan `--doc-*` untuk komponen admin/pelanggan baru.

## Typography

- Font utama: Inter, fallback Segoe UI/Arial/sans-serif.
- Heading admin ringkas, bold/extra-bold.
- Label kecil sering uppercase dengan letter spacing ringan.
- Body text memakai slate/muted.
- Hindari text instruksional berlebihan di UI; komponen existing sudah cukup task-oriented.

## Layout Admin

Admin memakai shell dua kolom:

- Sidebar fixed width sekitar 260px.
- Main content scrollable.
- Topbar admin di atas konten dengan breadcrumb, judul halaman, tanggal/jam/user.
- Halaman internal memakai `.admin-page`, `.ui-card`, `.summary-card`, `.panel-head`, `.doc-table`.

Navigasi sidebar:

- Class `.admin-sidebar`, `.menu-item`, `.menu-header`.
- Active item memakai background `--doc-red-soft`, text/icon `--doc-red`.
- Icon memakai MDI/Vuetify `v-icon`.

Cards:

- Gunakan `.ui-card` atau `.summary-card` untuk panel admin.
- Border 1px `--doc-border`, background putih, shadow halus.
- Jangan membuat card bertumpuk tanpa kebutuhan.

Tables:

- Gunakan `.doc-table` atau `.doc-data-table` untuk tabel custom/Vuetify.
- Header uppercase kecil.
- Empty state memakai `.empty-cell` atau `.empty-box`.

## Layout Pelanggan

Pelanggan dirancang mobile-first dengan phone-like stage:

- `.customer-stage`
- `.scan-screen`
- `.mobile-app-screen`
- `.mobile-bottom-nav`
- `.mobile-menu-grid`
- `.mobile-menu-card`
- `.mobile-cart-view`
- `.tracking-screen`

Flow pelanggan harus nyaman di layar kecil:

- Bottom nav untuk menu/cart/tracking.
- CTA utama full width pada mobile.
- Cart disimpan di `sip_customer_cart_state`.
- Tracking memakai warna status dinamis via CSS variables `--track-*`.

## Buttons dan Controls

Gunakan pola:

- Primary action: `.btn-primary` atau class spesifik halaman, warna merah.
- Secondary action: `.soft-button`.
- Dangerous action: `.delete-button` atau `.danger-icon-btn`.
- Status/filter tabs: `.order-tabs`, `.report-period-bar`, `.menu-category-row`, `.mobile-category-scroll`.
- Confirm destructive action memakai `window.Confirm.show(...)`.
- Feedback inline memakai `inline-feedback`.
- Snackbar global memakai `window.notify(...)`.

Vuetify controls yang lazim:

- `v-btn`
- `v-icon`
- `v-text-field`
- `v-select`
- `v-data-table`
- `v-dialog`
- `v-card`
- `v-chip`
- `v-avatar`
- `v-progress-linear`

## Icons

Icon source:

- Material Design Icons via Vuetify/MDI.

Domain icon yang sudah dipakai:

- Brand/menu makanan: `mdi-noodles`, `mdi-silverware-fork-knife`.
- Dashboard: `mdi-view-dashboard`.
- Pesanan: `mdi-clipboard-list`.
- Transaksi: `mdi-cash-register`.
- Laporan: `mdi-file-chart`.
- Auth: `mdi-account`, `mdi-lock`, `mdi-eye-outline`.
- Status/feedback: `mdi-check-circle-outline`, `mdi-alert-circle-outline`, `mdi-information-outline`.

Tambahkan icon dengan gaya yang sama. Jangan menggambar SVG manual untuk icon UI umum.

## Responsive dan Print

Responsive:

- Banyak breakpoint memakai `@media (max-width: 1180px)`, `960px`, `640px`, `600px`.
- Admin table/filter harus tetap muat di mobile.
- Pelanggan harus tetap mobile-first dan tidak bergantung pada hover.

Print:

- `@media print` sudah mengatur dashboard, transaksi, dan laporan.
- Elemen nav/sidebar/topbar disembunyikan saat print.
- Print report head memakai `.print-report-head`.
- Jangan mengubah class print tanpa mengetes print preview.

## Pola Visual Yang Harus Dipertahankan

- Radius komponen baru sekitar 8px untuk kartu/menu/button operasional.
- Warna brand utama merah `#c2372f`.
- Background halaman `#f5f5f5`.
- Panel utama putih dengan border tipis.
- Status memakai warna konvensional:
  - Baru/menunggu: kuning/oranye.
  - Diproses: biru.
  - Selesai: hijau.
  - Dibatalkan/error: merah.

## Anti-Patterns

- Jangan menambah framework CSS baru.
- Jangan membuat build step hanya untuk satu perubahan UI.
- Jangan membuat style global generik yang menabrak Vuetify tanpa scope class halaman.
- Jangan menghapus fallback localStorage dari UI tanpa keputusan produk.
- Jangan mengandalkan warna biru lama untuk komponen baru jika halaman sudah memakai redesign merah.
- Jangan menaruh logic bisnis stok/laporan di CSS/DOM; tetap lewat API/model.


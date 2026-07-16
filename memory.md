# Project Memory

Memori lintas session untuk project `sip-web`. Agent wajib membaca file ini di awal session dan menambahkan catatan baru setelah task penting atau saat session ditutup.

## Format Decision Log

```text
[tanggal] — [task] — [keputusan] — [alasan]
```

## Decision Log

[2026-07-10] — Steering documentation — Membuat `AGENTS.md` dan steering files di `docs/steering/` untuk arsitektur, system flow, tech stack, routing, dan design system — Project membutuhkan konteks permanen agar agent berikutnya memahami struktur FE static Vue 2, BE Express/MySQL, flow bisnis, route, dan gaya UI sebelum mengubah kode.

[2026-07-10] — Memory mechanism — Menjadikan `memory.md` sebagai memori lintas session dan mereferensikannya dari `AGENTS.md` sebagai file wajib baca — Agent tidak memiliki persistent memory otomatis di repo kecuali diarahkan lewat file project yang selalu di-load di awal session.

## Session Summaries

### 2026-07-10 — Steering Documentation

Sudah dikerjakan:
- Scan struktur repository `sip-web`.
- Mengidentifikasi frontend static Vue 2/Vuetify/Chart.js di `fe/`.
- Mengidentifikasi backend Express/MySQL/JWT di `be/`.
- Membuat `AGENTS.md`.
- Membuat `docs/steering/architecture.md`.
- Membuat `docs/steering/system-flow.md`.
- Membuat `docs/steering/tech-stack.md`.
- Membuat `docs/steering/routing.md`.
- Membuat `docs/steering/design-system.md`.

Keputusan penting:
- `AGENTS.md` menjadi entrypoint instruksi agent.
- Steering docs dipisah berdasarkan domain: architecture, system flow, tech stack, routing, design system.
- Dokumentasi menekankan boundary FE/BE, fallback `localStorage`, wrapper URL, dan pola Vue global component.

Technical debt:
- `README.md` masih mengandung Git conflict marker.
- Belum ditemukan test suite otomatis.
- `fe/assets/css/style.css` besar dan berisi beberapa generasi style/token.

Pending task:
- Bersihkan conflict marker di `README.md`.
- Pertimbangkan test smoke sederhana untuk endpoint backend utama.
- Pertimbangkan dokumentasi `.env.example` jika belum tersedia.

### 2026-07-10 — Memory Mechanism

Sudah dikerjakan:
- Membuat `memory.md` di root project.
- Menambahkan protokol memory ke `AGENTS.md`.
- Menambahkan `memory.md` ke daftar file wajib baca saat memulai session.

Keputusan penting:
- Memory ditulis sebagai append-only markdown log.
- Decision log memakai format `[tanggal] — [task] — [keputusan] — [alasan]`.
- Final summary wajib ditulis saat user mengetik `Close Session`.

Technical debt:
- Auto-load/auto-write bergantung pada kepatuhan agent terhadap `AGENTS.md`; tidak ada hook runtime yang memaksa update otomatis.

Pending task:
- Pada session berikutnya, agent harus membaca `memory.md` sebelum mulai bekerja.
- Setelah setiap task penting berikutnya, agent harus append decision log dan/atau session summary.

## Additional Session Notes

[2026-07-10] — Landing page customer — Mengubah `fe/index.html` dan root `index.html` menjadi landing page sales-oriented dengan CTA `Akses Pelanggan` dan `Masuk Admin`, serta menambahkan `fe/assets/img/landing-hero.png` sebagai hero visual — URL produksi `/SIP/` mem-publish folder `fe`, sehingga landing page utama harus menjual manfaat sistem sebelum user masuk ke area pelanggan atau admin.

### 2026-07-10 — Landing Page Customer

Sudah dikerjakan:
- Mengubah `fe/index.html` menjadi landing page utama untuk URL `/SIP/`.
- Menyamakan root `index.html` sebagai fallback lokal dengan path aset `./fe/assets/img/landing-hero.png`.
- Menambahkan hero background visual di `fe/assets/img/landing-hero.png`.
- Menambahkan CTA utama `Buka Menu Pelanggan` dan `Masuk Admin` di hero, section akses, CTA bawah, dan footer.
- Menambahkan section manfaat, fitur utama, alur pesanan, dan pilihan akses.

Keputusan penting:
- `fe/index.html` tetap menjadi source of truth untuk deployment GitHub Pages karena workflow mem-publish folder `fe`.
- Link tetap relatif `./pelanggan/` dan `./admin/` agar kompatibel dengan deployment `/SIP/`.
- Visual hero memakai generated bitmap yang relevan dengan dashboard penjualan, QR menu, dan warung bakso.

Technical debt:
- Root `index.html` dan `fe/index.html` berisi markup duplikat dengan perbedaan path aset; perubahan landing page berikutnya perlu disinkronkan di dua file.
- Hero image adalah aset generated, bukan screenshot aplikasi asli.

Pending task:
- Jika ingin lebih akurat, ganti hero image dengan screenshot asli aplikasi setelah UI final.
- Pertimbangkan menambah social preview image khusus untuk link unfurl.

[2026-07-10] — Landing page no-image revision — Mengganti landing page menjadi desain SaaS/data dashboard tanpa background gambar, menghapus `fe/assets/img/landing-hero.png`, dan memakai mockup dashboard/phone/status pesanan berbasis HTML/CSS — User menilai background gambar tidak natural dan bukan tampilan web sistem, sehingga visual harus lebih dekat dengan UI aplikasi penjualan yang sebenarnya.

### 2026-07-10 — Landing Page No-Image Revision

Sudah dikerjakan:
- Menghapus pemakaian background gambar pada `fe/index.html`.
- Menghapus aset generated `fe/assets/img/landing-hero.png`.
- Membuat hero baru dengan mockup dashboard admin, phone menu digital, status pesanan, chart animasi, dan QR scan effect berbasis HTML/CSS.
- Membuat struktur ala SaaS landing page: hero, data bento, fitur sistem, alur kerja, akses pelanggan/admin, dan CTA akhir.
- Menambahkan micro animation: reveal on scroll, floating mockup, live dot pulse, scan line, animated chart bars, dan hover card.
- Mengubah root `index.html` menjadi redirect ke `./fe/` agar landing page utama tetap satu sumber di `fe/index.html`.

Keputusan penting:
- Landing page produksi tetap `fe/index.html` karena URL `/SIP/` mem-publish folder `fe`.
- Tidak memakai image background; visual utama memakai komponen UI yang mencerminkan sistem SIP.
- Style mengikuti inspirasi landing page SaaS/Dribbble: clean, rounded, bento, dashboard mockup, dan data-focused copy.

Technical debt:
- Root `index.html` sekarang redirect ke `./fe/`; jika deployment berubah dan root ikut dipublish, behavior tetap mengarah ke landing page FE.
- Mockup dashboard di landing page masih representasi HTML/CSS, bukan screenshot live dari aplikasi admin.

Pending task:
- Jika UI admin sudah final, pertimbangkan membuat preview mockup yang lebih dekat lagi dengan screenshot aktual.
- Pertimbangkan menambahkan Open Graph image khusus tanpa memakai background foto.

[2026-07-10] — Root package.json — Menambahkan `package.json` root dengan script `postinstall`, `setup`, `predev`, `dev`, `start`, `migrate`, `seed`, dan `create-admin` yang menjalankan command di folder `be` — User perlu bisa menjalankan `npm i` dan `npm run dev` dari root project tanpa masuk manual ke folder backend.

### 2026-07-10 — Root Package Json

Sudah dikerjakan:
- Membuat `package.json` di root project.
- Memperbarui `package-lock.json` root agar cocok dengan metadata package root.
- Menambahkan `.gitignore` minimal untuk `node_modules`, `.env`, dan log npm/yarn.
- Menambahkan `postinstall` agar `npm install` root otomatis menjalankan `npm install` di folder `be`.
- Menambahkan `predev` agar `npm run dev` root mengecek dependency backend sebelum menjalankan server.
- Menambahkan script root untuk dev/start/migrate/seed/create-admin.
- Memvalidasi `npm install` dari root berhasil.
- Memvalidasi dependency backend `nodemon` tersedia setelah install.

Keputusan penting:
- Root package hanya menjadi delegator; dependency backend tetap berada di `be/package.json`.
- `npm run dev` dari root menjalankan `cd be && npm run dev`.

Technical debt:
- `npm audit` backend masih melaporkan 9 vulnerability (3 moderate, 6 high) dari dependency backend lama.

Pending task:
- Jalankan `npm run dev` normal saat ingin menyalakan backend; command tersebut long-running karena menjalankan nodemon.
- Tinjau vulnerability backend secara terpisah dengan hati-hati.

[2026-07-14] — Landing page interaction refinement — Merapikan `fe/index.html` dengan header floating rounded, tombol navigasi section yang lebih tegas, dark/light mode persist di `localStorage`, CTA akses yang dipusatkan di hero, dan penggantian teks brand menjadi `Sistem Informasi Penjualan` — User meminta landing page terlihat lebih menarik, padat, interaktif, dan tidak terlalu banyak tombol akses yang berulang.

### 2026-07-14 — Landing Page Interaction Refinement

Sudah dikerjakan:
- Mengubah header landing page menjadi floating/sticky rounded dengan shadow dan backdrop blur.
- Membuat link navigasi `Data`, `Fitur`, `Alur`, dan `Akses` terlihat seperti tombol section yang jelas bisa diklik.
- Menambahkan toggle dark/light mode dengan animasi, icon berubah, dan preferensi tersimpan di `localStorage`.
- Memadatkan gap awal hero agar konten pertama lebih dekat dengan header.
- Memusatkan CTA utama hanya di hero: `Buka Menu Pelanggan` dan `Masuk Panel Admin`.
- Menghapus CTA akses duplikat dari section akses, final CTA, dan link footer.
- Mengganti teks `Warung Bakso Tulus`/`SIP Bakso Tulus` menjadi konteks umum `Sistem Informasi Penjualan`.
- Menambahkan micro animation tambahan pada header, tombol utama, metric pill, feature card, dan access card.
- Mengupdate root `index.html` agar teks fallback redirect memakai `Sistem Informasi Penjualan`.

Keputusan penting:
- Landing page tetap satu sumber di `fe/index.html`; root `index.html` hanya redirect ke `./fe/`.
- Akses pelanggan/admin dibuat terpusat di hero supaya halaman tidak terasa penuh tombol berulang.
- Dark mode dibuat tanpa dependency baru agar tetap cocok dengan frontend static CDN.

Technical debt:
- Belum ada visual regression test otomatis untuk landing page.
- Mockup dashboard/phone masih representasi HTML/CSS, bukan screenshot live aplikasi.

Pending task:
- Uji manual di browser desktop dan mobile untuk memastikan spacing header floating sesuai harapan desain.
- Jika UI admin/pelanggan berubah besar, sesuaikan kembali mockup landing page agar tetap representatif.

[2026-07-14] — Landing page soft UI refinement — Menghaluskan dark mode, menyeragamkan radius komponen, mengurangi agresivitas tombol header, memperbaiki offset scroll section, memusatkan icon fitur, dan mengganti nomor alur menjadi icon — User meminta tampilan lebih dekat ke referensi Dribbble, lebih lembut dilihat, dan section tidak tertutup/terasa janggal saat diklik dari header.

### 2026-07-14 — Landing Page Soft UI Refinement

Sudah dikerjakan:
- Menyesuaikan palette dark mode agar lebih soft dan tidak terlalu kontras/tajam.
- Menyeragamkan radius komponen utama lewat token radius baru.
- Mengubah nav header menjadi pill yang lebih halus, bukan tombol merah/outline yang terasa memaksa.
- Menambahkan `scroll-padding-top` dan `scroll-margin-top` agar klik section dari header tidak tertutup navbar floating.
- Mengurangi vertical padding section agar spacing antar-section lebih rapi.
- Membuat feature card center-aligned dengan icon lebih besar.
- Menghapus nomor `01-04` pada alur dan menggantinya dengan icon flow.
- Menyesuaikan kartu bento/dark panel agar tidak muncul terlalu terang di dark mode.

Keputusan penting:
- Header tetap floating, tetapi nav item dibuat lebih subtle agar sesuai gaya SaaS/Dribbble.
- Alur memakai icon bisnis, bukan angka, agar visual lebih clean.

Technical debt:
- Belum dilakukan visual QA otomatis/screenshot lintas viewport.

Pending task:
- Review manual di browser untuk memastikan posisi scroll anchor sudah pas di semua viewport.

[2026-07-14] — Landing page density and anchor refinement — Mengecilkan navbar, menghapus wrapper kotak CTA hero, memperbaiki scroll navbar dengan offset JavaScript, merapikan feature cards, redesign access cards tanpa contoh menu spesifik, mengganti final CTA/footer dengan komposisi brand-copyright-back-to-top — User menandai navbar terlalu besar, gap hero terlalu jauh, anchor section tidak pas, kartu fitur terlalu kosong, area akses kurang padat, serta footer/CTA bawah kurang menarik.

### 2026-07-14 — Landing Page Density and Anchor Refinement

Sudah dikerjakan:
- Navbar dibuat lebih ringkas seperti referensi pill navbar.
- Gap hero setelah navbar dipadatkan.
- Wrapper luar pada tombol hero dihapus agar CTA tidak terlihat kotak bertumpuk.
- Scroll section dari navbar diganti memakai offset JavaScript dan active state halus.
- Feature card dibuat lebih compact, simetris, dan icon tidak terlalu kecil.
- Semua teks contoh `Bakso Urat`, `Mie Ayam`, dan `Es Jeruk` di landing page diganti dengan istilah menu netral.
- Section akses diredesign menjadi role summary yang lebih padat dengan flow chips.
- Final CTA ditulis ulang untuk menjelaskan fungsi project secara lebih jelas.
- Footer diganti menjadi brand, copyright, dan tombol kembali ke atas.

Keputusan penting:
- Landing page tidak menampilkan contoh menu spesifik agar tetap netral untuk Sistem Informasi Penjualan.
- Navigasi section memakai JavaScript offset karena CSS `scroll-padding` saja belum presisi dengan navbar floating/sticky.

Technical debt:
- Belum ada visual QA otomatis; perlu cek manual desktop/mobile untuk memastikan hasil sesuai screenshot terbaru.

Pending task:
- Jika masih terasa kurang padat setelah dilihat di browser, pertimbangkan mengurangi ukuran mockup hero atau jumlah kartu fitur.

[2026-07-14] — Landing page navbar and full-section refinement — Menyederhanakan navbar, menghapus switch dark mode bertumpuk, memperbaiki active state default, membuat section lebih full-screen, memperbesar icon fitur, merapikan final CTA, dan memindahkan tombol back-to-top menjadi floating setelah scroll — User menandai navbar terlihat double-line, `Data` aktif saat default, anchor section belum nyaman, icon fitur terlalu kecil, CTA bawah tidak simetris, dan tombol back-to-top sebaiknya mengambang.

### 2026-07-14 — Landing Page Navbar and Full-Section Refinement

Sudah dikerjakan:
- Menghapus border tambahan pada group navbar agar tidak terlihat bertumpuk.
- Mengubah toggle dark/light mode dari switch bertingkat menjadi satu icon sederhana.
- Mengganti scroll-spy IntersectionObserver dengan kalkulasi scroll deterministik supaya `Data` tidak aktif saat masih di hero.
- Menambahkan active state hanya saat section benar-benar sudah terlewati/terpilih.
- Membuat section utama memakai tinggi minimal viewport agar tampil lebih utuh per layar.
- Memperbesar icon di feature card agar proporsional dengan ukuran kartu.
- Memperbaiki selector CTA bawah agar item ringkasan tidak saling override dan tidak menimpa.
- Memindahkan tombol kembali ke atas menjadi floating fixed button yang muncul setelah user scroll.
- Footer disederhanakan menjadi brand dan copyright.

Keputusan penting:
- Back-to-top tidak lagi menjadi bagian layout footer, tetapi kontrol floating.
- Active navbar tidak memiliki default section saat posisi halaman masih di hero.

Technical debt:
- Tetap perlu visual QA manual di browser karena perubahan ini banyak terkait spacing dan viewport.

Pending task:
- Cek ulang di viewport desktop 1366/1920 dan mobile setelah refresh cache browser.

[2026-07-14] — Landing page hero/nav visibility and CTA polish — Menjadikan navbar fixed tersembunyi saat hero lalu muncul setelah scroll, mengubah anchor click ke awal section, menyembunyikan metric hero pada layar pendek, membuat feature card horizontal compact, dan menulis ulang CTA bawah tanpa copy “landing page ini” — User meminta hero tidak terlihat terpotong, navbar lebih simetris, setiap section tampil penuh saat diklik, icon fitur tidak pecah/kecil, dan CTA bawah lebih menarik.

### 2026-07-14 — Landing Page Hero/Nav Visibility and CTA Polish

Sudah dikerjakan:
- Navbar tidak tampil di posisi hero awal agar tidak terlihat memotong area pertama.
- Navbar muncul setelah user scroll, tetap floating/fixed.
- Isi navbar disederhanakan: group nav tanpa border tambahan, dark-mode button hanya icon.
- Klik nav diarahkan ke `offsetTop` section agar section sebelumnya tidak muncul di atas.
- Hero metrics disembunyikan pada viewport desktop yang pendek agar tidak terpotong.
- Feature card dibuat horizontal compact antara icon dan teks.
- CTA bawah ditulis ulang: fokus pada manfaat sistem, bukan menjelaskan “landing page”.
- CTA summary dibuat grid tiga kolom yang lebih seimbang.

Keputusan penting:
- Navbar tidak menjadi elemen default di hero, melainkan contextual navigation setelah scroll.
- Section anchor mengutamakan awal section bersih, bukan offset di bawah navbar.

Technical debt:
- Perlu visual QA manual karena navbar fixed dan anchor scroll sangat tergantung tinggi viewport.

Pending task:
- Jika user ingin navbar tetap terlihat di hero, buat varian translucent tanpa menumpuk area hero.

[2026-07-14] — Landing page navbar always visible — Mengembalikan navbar agar selalu tampil sejak hero dan menghapus logic hide/show khusus navbar — User menegaskan navbar tidak boleh disembunyikan, tetapi tetap harus tampil rapi sebagai navigasi utama.

[2026-07-14] — Landing page feature section restore — Mengembalikan card fitur ke layout vertikal-center dengan selector teks spesifik dan icon proporsional — User menilai layout horizontal baru membuat section fitur terlihat jelek karena teks menyempit dan tidak serapi versi sebelumnya.

[2026-07-14] — Landing page access section full height — Mengubah tinggi section utama dan final CTA menjadi `100vh` penuh — User menandai section akses masih memperlihatkan section berikutnya di bawah saat dibuka dari navbar.

[2026-07-14] — Landing page navbar width alignment — Menyamakan lebar `.site-nav` dengan `.shell` konten menjadi `1180px` — User meminta panjang navbar selaras dengan konten hero di bawahnya agar ujung kiri dan kanan terlihat rapi.

[2026-07-15] — Landing page hero spacing — Mengubah padding section hero home di `fe/index.html` menjadi top-heavy dan bottom-compact, termasuk override mobile — User menandai jarak hero ke navbar terlalu rapat sementara ruang kosong bawah terlalu besar.

[2026-07-15] — Landing page navbar anchor offset — Mengubah scroll klik navbar agar mengurangi tinggi navbar dan menambahkan `scroll-margin-top` pada section — User menandai bagian atas section Data terpotong saat diklik dari navbar fixed.

[2026-07-15] — Landing page clean section anchors — Mengembalikan klik navbar ke awal section (`target.offsetTop`), menjadikan offset eksternal nol, dan memindahkan ruang aman ke padding internal section — User menandai section sebelumnya masih terlihat di atas saat klik Data.

[2026-07-15] — Landing page copy cleanup — Mengganti sisa kata `warung` di `fe/index.html` menjadi `usaha` — User meminta semua kata warung di landing page dihilangkan agar copy lebih umum.

[2026-07-15] — Landing page navbar menu style — Mengubah menu navbar menjadi satu kapsul `nav-menu` dengan item aktif yang menyala dan tombol theme terpisah — User meminta navbar terutama bagian menu disamakan dengan referensi pill-menu.

[2026-07-15] — Landing page navbar awal menu — Menambahkan link `Awal` ke menu navbar yang mengarah ke `#top` — User meminta halaman paling awal juga tersedia di menu navbar.

[2026-07-15] — Landing page navbar home label and height — Mengganti label menu `Awal` menjadi `Beranda` dan menetapkan tinggi navbar desktop 70px serta mobile 60px — User meminta teks menu bukan `Awal` dan tinggi navbar disamakan dengan referensi kedua.

[2026-07-15] — Landing page navbar compact height — Mengecilkan navbar desktop menjadi 58px, mobile 54px, logo 32px, menu item 32px, dan theme button 38px — User menandai navbar sebelumnya justru makin tinggi dari referensi.

[2026-07-15] — Landing page navbar brand typography — Menaikkan font brand `SIP` menjadi 14px dan subtitle menjadi 10.5px dengan line-height rapat — User menilai ukuran navbar sudah bagus tetapi teks `Sistem informasi penjualan` terlalu kecil.

[2026-07-15] — Landing page light mode contrast refinement — Menambahkan token light/dark untuk menu navbar, active nav button, final CTA, dan footer; light mode memakai nav-menu lebih jelas serta area bawah terang lembut — User menandai button navbar light mode terlalu samar dan bagian bawah terlalu hitam/kontras saat light mode.

[2026-07-15] — Landing page footer separation — Menambahkan background footer yang lebih putih, top border, shadow halus, dan garis aksen gradient di atas footer — User meminta pembeda visual antara isi final CTA dan footer pada light mode.

[2026-07-15] — Landing page access copy cleanup — Mengganti copy `Landing page ini...` menjadi kalimat akses peran yang lebih natural — User meminta kata `landing page` dihilangkan dan diganti copy yang lebih bagus.

### 2026-07-15 — Landing Page Hero Spacing

Sudah dikerjakan:
- Menyesuaikan padding `.hero` desktop dari nilai fixed kecil menjadi `clamp(86px, 9vh, 110px) 0 clamp(20px, 3vh, 30px)`.
- Menyesuaikan padding `.hero` mobile menjadi `96px 0 30px` agar navbar fixed tetap punya ruang.
- Menjaga struktur HTML, link pelanggan/admin, navbar, dan section lain tetap sama.

Keputusan penting:
- Hero tetap `min-height: 100vh`, tetapi balance padding dibuat lebih berat ke atas agar konten turun sedikit dan ruang kosong bawah berkurang.

Technical debt:
- Belum ada visual regression test otomatis untuk landing page.

Pending task:
- Review manual di browser setelah refresh cache untuk memastikan jarak atas/bawah sudah sesuai selera desain.

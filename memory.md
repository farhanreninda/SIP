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

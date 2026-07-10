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

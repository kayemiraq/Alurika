# Alurika

Buka `index.html` langsung di browser (tidak perlu server). Perlu internet untuk Tailwind, font, dan ikon (CDN).

## Struktur
- `index.html` – kerangka halaman: nav, hero (template `tpl-hero`), footer, status bar, modal
- `css/style.css` – gaya kustom (gradient, glass, animasi)
- `js/tailwind-config.js` – warna & font Tailwind
- `data/modulTree.js`, `data/lkpdTree.js` – isi materi, soal, dan LKPD (ganti di sini untuk mengubah materi)
- `js/parser.js` – mengubah data menjadi sections, TP, soal diagnostik/formatif
- `js/state.js` – konfigurasi (kunci jawaban diagnostik `DIAG_KEY`), state, localStorage
- `js/tree.js` – gambar pohon SVG dan figur
- `js/blocks.js` – render blok materi ke HTML
- `js/widgets.js` – aktivitas interaktif di materi
- `js/ui.js` – komponen kecil + hitung progres
- `js/views-asesmen.js` – Diagnostik, Tantangan, hasil, Materi, LKPD
- `js/events.js` – modal, aksi klik, listener input
- `js/shell.js` – daftar tab, navigasi, render halaman
- `js/kurikulum.js` – halaman Kurikulum (judul singkat TP ada di `TT`)
- `js/visualizer.js` – halaman Visualizer Tree
- `js/main.js` – listener global dan `boot()`

Urutan `<script>` di `index.html` penting; jangan ditukar.

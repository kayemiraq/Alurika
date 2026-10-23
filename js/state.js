/* Konfigurasi, state belajar, dan penyimpanan localStorage. */
/* ===== KONFIGURASI =====
   modulTree.json TIDAK memuat kunci jawaban asesmen diagnostik. Isi jika guru ingin skor, mis. { 1: 'c' }.
   Selama kosong, diagnostik hanya menampilkan jawaban siswa (tanpa skor). */
const DIAG_KEY = { 1: 'c', 2: 'c', 3: 'c', 4: 'b', 5: 'b' };
const STORE = 'quizy-tree-v1';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let D, S, W = {}, R = {}, tab = (location.hash || '').slice(1) || 'beranda', confirmCb = null;
const rj = id => (window.APIK_DATA && APIK_DATA[id]) || null;
const fresh = () => ({ name: '', diag: { a: {}, cur: 0, done: false }, form: { a: {}, self: {}, cur: 0, done: false }, mat: { seen: {}, cur: 0 }, lk: {}, lkDone: false, build: {} });
function load() { try { const r = JSON.parse(localStorage.getItem(STORE)); if (r && r.diag && r.form && r.mat) return Object.assign(fresh(), r); } catch (e) { } return fresh(); }
let _t; function save() { clearTimeout(_t); _t = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { } flash(); }, 150); }
function flash() { const e = $('saved'); if (!e) return; e.classList.remove('hidden'); clearTimeout(flash.t); flash.t = setTimeout(() => e.classList.add('hidden'), 1400); }

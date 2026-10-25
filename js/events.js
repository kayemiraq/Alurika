/* Modal, aksi klik (ACT), dan listener input/change. */
const locked = t => (t === 'materi' || t === 'lkpd' || t === 'formatif') && !S.diag.done ? 'Selesaikan dan kumpulkan <b>Asesmen Diagnostik</b> terlebih dahulu untuk membuka bagian ini.' : t === 'formatif' && !S.lkDone ? 'Kerjakan <b>LKPD</b> dan tandai selesai terlebih dahulu untuk membuka Asesmen Formatif.' : '';
function toggleProgressModal() {
  const p = pct(), m = $('progress-modal'); m.classList.toggle('hidden');
  if (!m.classList.contains('hidden')) $('pm-body').innerHTML = `<label class="text-xs font-bold text-slate-500">Nama (opsional, tersimpan lokal)</label><input data-k="__name" value="${esc(S.name)}" placeholder="Nama siswa" class="w-full mb-3 rounded-xl border-2 border-slate-200 p-2 text-sm"><div class="space-y-2 text-sm font-bold text-slate-700"><div class="flex justify-between"><span>Asesmen Diagnostik</span><span class="text-purple-600">${S.diag.done ? 'Terkumpul' : p.d + '%'}</span></div><div class="flex justify-between"><span>Materi</span><span class="text-amber-600">${cnt(S.mat.seen)}/${D.sections.length} bagian</span></div><div class="flex justify-between"><span>LKPD</span><span class="text-pink-600">${Object.values(S.lk).filter(Boolean).length} kolom terisi</span></div><div class="flex justify-between"><span>Asesmen Formatif</span><span class="text-emerald-600">${S.form.done ? 'Nilai ' + Math.round((pgScore() + selfScore()) / (D.form.items.reduce((s, i) => s + i.skor, 0) || 100) * 100) : p.f + '%'}</span></div></div><button data-act="resetall" class="mt-4 text-xs text-rose-600 underline">Hapus semua data tersimpan</button>`;
}
function ask(msg, cb, info) { confirmCb = cb; $('cf-no').classList.toggle('hidden', !!info); $('cf-ok').textContent = info ? 'Mengerti' : 'Ya, lanjutkan'; $('cf-msg').innerHTML = msg; $('confirm-modal').classList.remove('hidden'); }

/* Jawaban Tantangan Terminologi Komponen: klik node (isNode) atau pilih angka */
function kmpAnswer(v, isNode) {
  const st = W.kmp, q = KMP[st.i], T = mkTree(D.tree); if (!q || st.fb || !!q.node !== isNode) return;
  const ok = isNode ? q.node(T).includes(v) : v === q.num(T); st.fb = { ok }; if (ok) st.sc++; rw('kmp');
}

/* ===== EVENT ===== */
const ACT = {
  go: e => switchTab(e.dataset.t), goq: e => { S[e.dataset.k].cur = Math.max(0, +e.dataset.i); render(); }, sec: e => { S.mat.cur = Math.max(0, +e.dataset.i); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  opensec: e => { if (locked('materi')) return switchTab('materi'); S.mat.cur = +e.dataset.i; tab = 'materi'; render(); window.scrollTo({ top: 0 }); },
  submit: e => { const k = e.dataset.k, n = (k === 'diag' ? D.diag.items : D.form.items).length - cnt(S[k].a); ask(n ? `Masih ada <b>${n} soal</b> belum dijawab. Kumpulkan sekarang?` : 'Kumpulkan jawabanmu sekarang?', () => { S[k].done = true; render(); window.scrollTo({ top: 0 }); }); },
  again: e => ask('Jawabanmu akan dihapus dan kamu mulai dari awal. Lanjutkan?', () => { S[e.dataset.k] = e.dataset.k === 'diag' ? fresh().diag : fresh().form; render(); }),
  lkdone: () => { const f = Object.values(S.lk).filter(Boolean).length; ask(f ? 'Tandai LKPD sebagai selesai? Asesmen Formatif akan terbuka.' : 'Belum ada kolom LKPD yang terisi. Tetap tandai selesai?', () => { S.lkDone = true; render(); }); },
  clearlk: () => ask('Semua isian LKPD akan dihapus (status selesai juga direset). Lanjutkan?', () => { S.lk = {}; S.lkDone = false; S.build['b-lk'] = { p: {} }; render(); }),
  resetall: () => ask('Semua jawaban & progres di perangkat ini akan dihapus. Lanjutkan?', () => { S = fresh(); $('progress-modal').classList.add('hidden'); render(); }),
  node: e => { if (e.dataset.w === 'kmp') return kmpAnswer(e.dataset.n, true); if (e.dataset.w === 'viz') { V.sel = e.dataset.n; return rw('viz'); } const id = e.dataset.w, st = W[id], n = e.dataset.n, T = mkTree(D.tree); if (st.q && st.q.node && !st.fb) { const ok = st.q.node.includes(n); st.fb = { ok, exp: st.q.exp }; st.tot++; if (ok) st.sc++; } else st.sel = n; rw(id); },
  qnew: e => { const st = W[e.dataset.w]; if (st.tot >= EXP_LIMIT) return; st.q = genQ(mkTree(D.tree)); st.fb = null; rw(e.dataset.w); },
  qnum: e => { const st = W[e.dataset.w]; if (st.fb) return; const ok = +e.dataset.v === st.q.num; st.fb = { ok, exp: st.q.exp }; st.tot++; if (ok) st.sc++; rw(e.dataset.w); },
  lkpick: e => { const k = e.dataset.k, v = e.dataset.v, y = window.scrollY; S.lk[k] = S.lk[k] === v ? '' : v; save(); render(); window.scrollTo(0, y); },
  kmpnum: e => kmpAnswer(+e.dataset.v, false),
  kmpnext: () => { W.kmp.i++; W.kmp.fb = null; rw('kmp'); },
  kmpreset: () => { W.kmp = { i: 0, fb: null, sc: 0 }; render(); },
  qreset: e => { const st = W[e.dataset.w]; Object.assign(st, { q: null, fb: null, sel: null, sc: 0, tot: 0 }); rw(e.dataset.w); },
  term: e => { W.cls.sel = e.dataset.t; rw('cls'); },
  grp: e => { const st = W.cls, t = st.sel; if (!t) { st.msg = 'Pilih istilah dulu.'; return rw('cls'); } if (D.groups[e.dataset.g].includes(t)) { st.placed[t] = e.dataset.g; st.msg = `✅ ${t} termasuk ${e.dataset.g}.`; st.sel = null; } else st.msg = `❌ ${t} bukan termasuk ${e.dataset.g}. Coba kelompok lain.`; rw('cls'); },
  ton: e => { W.ton[e.dataset.n] = e.dataset.v; rw('ton'); }
};
document.addEventListener('click', ev => {
  const e = ev.target.closest('[data-act]'); if (e && ACT[e.dataset.act]) { ACT[e.dataset.act](e); return; }
  if (ev.target.id === 'cf-ok') { $('confirm-modal').classList.add('hidden'); const f = confirmCb; confirmCb = null; f && f(); }
  if (ev.target.id === 'cf-no') $('confirm-modal').classList.add('hidden');
});
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.dataset.k === '__name') { S.name = t.value; return save(); }
  if (t.dataset.k) { if (t.type === 'checkbox') S.lk[t.dataset.k] = t.checked; else S.lk[t.dataset.k] = t.value; return save(); }
  if (t.dataset.ans && t.tagName === 'TEXTAREA') { S[t.dataset.ans].a[t.dataset.no] = t.value; return save(); }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.ans && t.type === 'radio') { S[t.dataset.ans].a[t.dataset.no] = t.value; save(); render(); }
  else if (t.dataset.bsel) { const st = S.build[t.dataset.bsel] = S.build[t.dataset.bsel] || { p: {} }; st.p[t.dataset.n] = t.value; save(); rw(t.dataset.bsel); updateProgress(); }
  else if (t.dataset.self) { const a = S.form.self[t.dataset.self] = S.form.self[t.dataset.self] || []; a[+t.dataset.j] = t.checked; save(); render(); }
});
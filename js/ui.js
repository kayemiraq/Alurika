/* Komponen UI kecil dan penghitung progres. */
/* ===== TAMPILAN ===== */
const glass = (inner, cls = '') => `<div class="glass-card rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/60 text-slate-700 ${cls}">${inner}</div>`;
const pill = (t, cls = 'bg-purple-500/30 text-purple-100 border-purple-300/30') => `<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${cls}">${t}</div>`;
const nav = (a, i, t, cls = 'bg-white') => `<button data-act="${a}" ${i} class="px-4 py-2.5 rounded-xl font-bold text-sm transition ${cls}">${t}</button>`;
const cnt = o => Object.values(o).filter(v => v !== '' && v != null).length;
const pct = () => {
  const dn = D.diag.items.length, fn = D.form.items.length, ds = D.sections.length;
  const d = dn ? (S.diag.done ? 100 : cnt(S.diag.a) / dn * 100) : 0, f = fn ? (S.form.done ? 100 : cnt(S.form.a) / fn * 100) : 0, m = ds ? cnt(S.mat.seen) / ds * 100 : 0;
  return { d: Math.round(d), m: Math.round(m), f: Math.round(f), all: Math.round((d + m + f) / 3) };
};

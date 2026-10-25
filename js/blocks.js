/* ===== RENDER BLOK PANDOC → HTML ===== */
function inlHtml(x, o) {
  if (!x) return ''; if (Array.isArray(x)) return x.map(i => inlHtml(i, o)).join('');
  switch (x.t) {
    case 'Str': return esc(x.c); case 'Space': case 'SoftBreak': return ' '; case 'LineBreak': return '<br>';
    case 'Strong': return `<strong>${inlHtml(x.c, o)}</strong>`; case 'Emph': return `<em>${inlHtml(x.c, o)}</em>`;
    case 'Code': case 'Math': return `<code>${esc(x.c[1])}</code>`; case 'Image': return `</p>${figHtml(x.c[2][0], o.src)}<p>`;
    case 'Link': case 'Span': return inlHtml(x.c[1], o); case 'Quoted': return '“' + inlHtml(x.c[1], o) + '”';
    case 'Superscript': return `<sup>${inlHtml(x.c, o)}</sup>`; case 'Subscript': return `<sub>${inlHtml(x.c, o)}</sub>`;
    default: return '';
  }
}
const fld = (k, cls, ph) => `<input data-k="${k}" value="${esc(S.lk[k] || '')}" placeholder="${ph || ''}" class="${cls}">`;
/* Tombol pilihan di dalam tabel LKPD. Nilai disimpan di S.lk[k]: 'y'/'n' (mode yn) atau 's'/'p' (mode pick). */
function lkChoice(mode, k, ci) {
  const v = S.lk[k], bt = (val, on, onCls, txt, label) => `<button type="button" data-act="lkpick" data-k="${k}" data-v="${val}" aria-pressed="${on}" aria-label="${label}" class="min-w-[44px] h-9 px-3 rounded-lg border-2 font-extrabold text-base transition ${on ? onCls : 'bg-white border-slate-200 text-slate-300 hover:border-indigo-400'}">${txt}</button>`;
  if (mode === 'yn') return `<div class="flex gap-2">${bt('y', v === 'y', 'bg-emerald-500 border-emerald-500 text-white', '✓', 'Tree')}${bt('n', v === 'n', 'bg-rose-500 border-rose-500 text-white', '✗', 'Bukan tree')}</div>`;
  const val = ci === 1 ? 's' : 'p';
  return `<div class="flex justify-center">${bt(val, v === val, 'bg-indigo-600 border-indigo-600 text-white', v === val ? '✓' : '', ci === 1 ? 'Sudah' : 'Perlu latihan')}</div>`;
}
function blk(b, o) {
  switch (b.t) {
    case 'Para': case 'Plain': {
      const c = b.c; if (!c.length) return '';
      if (c.length === 1 && c[0].t === 'Image') return figHtml(c[0].c[2][0], o.src);
      const strongOnly = c.every(i => i.t === 'Strong' || i.t === 'Space'), t = inlTxt(c).trim();
      if (strongOnly && o.inputs) return /^KEGIATAN/.test(t) ? `<h3 class="mt-8 mb-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-extrabold font-display text-base sm:text-lg">${esc(t)}</h3>` : `<h4 class="mt-5 mb-1 font-bold text-indigo-700">${esc(t)}</h4>`;
      if (c.every(i => i.t === 'Emph' || i.t === 'Space') && o.inputs) return `<p class="text-xs text-center text-slate-500 -mt-1 mb-2">${inlHtml(c, o)}</p>`;
      let h = inlHtml(c, o);
      if (o.inputs) { h = h.replace(/\[ \]/g, () => { const k = o.pre + 'c' + (o.n++); return `<input type="checkbox" data-k="${k}" ${S.lk[k] ? 'checked' : ''} class="w-4 h-4 align-middle accent-indigo-600">`; }).replace(/\.{8,}/g, () => fld(o.pre + 'd' + (o.n++), 'mx-1 w-32 border-b-2 border-indigo-300 bg-indigo-50/50 px-1 text-sm focus:outline-none focus:border-indigo-600')); }
      return `<p class="leading-relaxed">${h}</p>`.replace('<p class="leading-relaxed"></p>', '');
    }
    case 'Header': return `<h4 class="font-bold mt-3">${inlHtml(b.c[2], o)}</h4>`;
    case 'OrderedList': { const st = o.olStart; o.olStart = null; return `<ol class="list-decimal pl-6 space-y-1.5 my-2" start="${st || b.c[0][0] || 1}">${b.c[1].map(it => `<li>${it.map(x => blk(x, o)).join('')}</li>`).join('')}</ol>`; }
    case 'BulletList': return `<ul class="list-disc pl-6 space-y-1.5 my-2">${b.c.map(it => `<li>${it.map(x => blk(x, o)).join('')}</li>`).join('')}</ul>`;
    case 'BlockQuote': return `<div class="space-y-2">${b.c.map(x => blk(x, o)).join('')}</div>`;
    case 'Table': {
      const t = tbl(b), hd = t.head ? t.rows[0].map(c => bTxt(c).trim()) : [];
      /* Mode khusus tabel LKPD: 'yn' = pilih ✓/✗ (kolom "Tree atau bukan?"), 'pick' = pilih Sudah / Perlu latihan (satu saja) */
      const mode = !o.inputs ? '' : hd[1] === 'Tree atau bukan?' ? 'yn' : (hd[1] === 'Sudah' && hd[2] === 'Perlu latihan') ? 'pick' : '';
      const fixed = hd.join('|') === 'Pertanyaan|Jawaban kelompok'; /* lebar kolom 50:50 */
      const rows = t.rows.map((r, ri) => `<tr class="${ri === 0 && t.head ? 'bg-indigo-50 font-bold' : ''}">${r.map((cell, ci) => {
        const empty = !bTxt(cell); const tag = ri === 0 && t.head ? 'th' : 'td';
        const sp = empty && ri > 0 && ((mode === 'yn' && ci === 1) || (mode === 'pick' && ci >= 1)) ? lkChoice(mode, o.pre + 'q' + ri, ci) : null;
        const inner = sp ? sp : empty ? (o.inputs ? `<textarea data-k="${o.pre}t${o.n++}" rows="${t.rows.length === 1 && r.length === 1 ? 4 : 2}" class="w-full min-w-[90px] rounded-lg border border-slate-200 bg-white p-1.5 text-sm focus:outline-none focus:border-indigo-500">${esc(S.lk[o.pre + 't' + (o.n - 1)] || '')}</textarea>` : '') : cell.map(x => blk(x, o)).join('');
        return `<${tag} class="border border-slate-200 px-2.5 py-1.5 align-top text-left">${inner}</${tag}>`;
      }).join('')}</tr>`).join('');
      return `<div class="overflow-x-auto my-3 rounded-xl"><table class="w-full text-sm border-collapse bg-white${fixed ? ' table-fixed' : ''}">${fixed ? '<colgroup><col style="width:50%"><col style="width:50%"></colgroup>' : ''}${rows}</table></div>`;
    }
    default: return '';
  }
}
/* Daftar bernomor yang berurutan (tiap blok berisi 1 butir) dilanjutkan nomornya: 1., 2., 3. */
const blocksHtml = (bl, src, inputs, pre) => { const o = { src, inputs, pre: pre || 'x', n: 0 }; let nx = 1; return bl.map((b, i) => { o.pre = (pre || 'x') + i + '_'; o.n = 0; if (b.t === 'OrderedList') { o.olStart = bl[i - 1] && bl[i - 1].t === 'OrderedList' ? nx : (b.c[0][0] || 1); nx = o.olStart + b.c[1].length; } return blk(b, o); }).join(''); };
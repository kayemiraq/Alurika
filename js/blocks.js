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
      const t = tbl(b);
      const rows = t.rows.map((r, ri) => `<tr class="${ri === 0 && t.head ? 'bg-indigo-50 font-bold' : ''}">${r.map((cell, ci) => {
        const empty = !bTxt(cell); const tag = ri === 0 && t.head ? 'th' : 'td';
        const inner = empty ? (o.inputs ? `<textarea data-k="${o.pre}t${o.n++}" rows="${t.rows.length === 1 && r.length === 1 ? 4 : 2}" class="w-full min-w-[90px] rounded-lg border border-slate-200 bg-white p-1.5 text-sm focus:outline-none focus:border-indigo-500">${esc(S.lk[o.pre + 't' + (o.n - 1)] || '')}</textarea>` : '') : cell.map(x => blk(x, o)).join('');
        return `<${tag} class="border border-slate-200 px-2.5 py-1.5 align-top text-left">${inner}</${tag}>`;
      }).join('')}</tr>`).join('');
      return `<div class="overflow-x-auto my-3 rounded-xl"><table class="w-full text-sm border-collapse bg-white">${rows}</table></div>`;
    }
    default: return '';
  }
}
/* Daftar bernomor yang berurutan (tiap blok berisi 1 butir) dilanjutkan nomornya: 1., 2., 3. */
const blocksHtml = (bl, src, inputs, pre) => { const o = { src, inputs, pre: pre || 'x', n: 0 }; let nx = 1; return bl.map((b, i) => { o.pre = (pre || 'x') + i + '_'; o.n = 0; if (b.t === 'OrderedList') { o.olStart = bl[i - 1] && bl[i - 1].t === 'OrderedList' ? nx : (b.c[0][0] || 1); nx = o.olStart + b.c[1].length; } return blk(b, o); }).join(''); };

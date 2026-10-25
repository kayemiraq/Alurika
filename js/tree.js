/* ===== POHON ===== */
function mkTree(t) {
  const kids = {}; t.nodes.forEach(n => kids[n] = []); t.nodes.forEach(n => { const p = t.parent[n]; if (p && kids[p]) kids[p].push(n); });
  const depth = n => t.parent[n] ? 1 + depth(t.parent[n]) : 0, height = n => kids[n].length ? 1 + Math.max(...kids[n].map(height)) : 0;
  return { ...t, kids, root: t.nodes.find(n => !t.parent[n]), depth, height, sibs: n => t.parent[n] ? kids[t.parent[n]].filter(x => x !== n) : [], leaves: t.nodes.filter(n => !kids[n].length) };
}
function layout(kids, roots) { const pos = {}; let lx = 0; const go = (n, d) => { const k = kids[n] || []; let x; if (!k.length) x = lx++; else { const xs = k.map(c => go(c, d + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; } pos[n] = { x, y: d }; return x; }; roots.forEach(r => go(r, 0)); return { pos, w: lx }; }
function svgTree(kids, roots, o = {}) {
  const { pos, w } = layout(kids, roots), dx = 64, dy = o.labels ? 76 : 64, r = 19, ids = Object.keys(pos), md = Math.max(0, ...ids.map(i => pos[i].y));
  const W_ = Math.max(1, w) * dx + 16, H = (md + 1) * dy + 8, X = n => 8 + dx / 2 + pos[n].x * dx, Y = n => r + 6 + pos[n].y * dy;
  let e = '', v = '';
  ids.forEach(n => (kids[n] || []).forEach(c => { e += `<line x1="${X(n)}" y1="${Y(n)}" x2="${X(c)}" y2="${Y(c)}" stroke="#C4B5FD" stroke-width="2.5"/>`; }));
  ids.forEach(n => {
    const isRoot = (o.rootSet || []).includes(n), hl = (o.hl || []).includes(n), sel = o.sel === n;
    const fill = hl ? '#0D9488' : isRoot ? '#D9536F' : '#7C3AED';
    v += `<g ${o.id ? `data-act="node" data-w="${o.id}" data-n="${n}" style="cursor:pointer"` : ''}><circle cx="${X(n)}" cy="${Y(n)}" r="${r}" fill="${fill}" stroke="${sel ? '#f43f5e' : '#fff'}" stroke-width="${sel ? 4 : 2.5}"/><text x="${X(n)}" y="${Y(n) + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${esc(n)}</text>${o.labels && o.labels[n] ? `<text x="${X(n)}" y="${Y(n) + r + 14}" text-anchor="middle" font-size="10" font-weight="600" fill="#475569">${esc(o.labels[n])}</text>` : ''}</g>`;
  });
  return `<div class="overflow-x-auto"><svg viewBox="0 0 ${W_} ${H}" width="${W_}" height="${H}" style="max-width:100%;height:auto;margin:auto;display:block" role="img" aria-label="Diagram tree">${e}${v}</svg></div>`;
}
const fig2 = (o = {}) => D.tree ? svgTree(mkTree(D.tree).kids, [mkTree(D.tree).root], { rootSet: [mkTree(D.tree).root], ...o }) : '';
function fig3() {
  const c = (x, y, t) => `<circle cx="${x}" cy="${y}" r="16" fill="#6366f1" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${t}</text>`;
  const l = (a, b, c_, d) => `<line x1="${a}" y1="${b}" x2="${c_}" y2="${d}" stroke="#C4B5FD" stroke-width="2.5"/>`;
  const p = [
    ['(a)', l(70, 30, 35, 85) + l(70, 30, 105, 85) + l(35, 85, 35, 140) + c(70, 30, 'P') + c(35, 85, 'Q') + c(105, 85, 'R') + c(35, 140, 'S')],
    ['(b)', l(70, 40, 30, 110) + l(70, 40, 110, 110) + l(30, 110, 110, 110) + c(70, 40, 'X') + c(30, 110, 'Y') + c(110, 110, 'Z')],
    ['(c)', l(30, 35, 70, 105) + l(110, 35, 70, 105) + c(30, 35, 'M') + c(110, 35, 'N') + c(70, 105, 'O')]];
  return `<div class="flex flex-wrap justify-center gap-4 my-3">${p.map(([t, s]) => `<div class="text-center"><svg viewBox="0 0 140 160" width="140" height="160" role="img" aria-label="Struktur ${t}">${s}</svg><div class="text-xs font-bold text-slate-600">${t}</div></div>`).join('')}</div><p class="text-[11px] text-slate-400 text-center">Digambar ulang dari keterangan gambar pada modul (berkas gambar asli tidak terunggah).</p>`;
}
const FIG = { modul: { 'media/image6.gif': 'g2', 'media/image4.gif': 'g1', 'media/image3.gif': 'g3' }, lkpd: { 'media/image3.gif': 'g2', 'media/image1.gif': 'g1', 'media/image2.gif': 'g3' } };
function figHtml(url, src) {
  const k = (FIG[src] || {})[url];
  if (k === 'g2' && D.tree) return `<div class="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">${fig2()}</div>`;
  if (k === 'g1' && D.tree && Object.keys(D.folder).length) return `<div class="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">${fig2({ labels: D.folder })}</div>`;
  if (k === 'g3') return `<div class="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">${fig3()}</div>`;
  /* Gambar dari berkas media/ ditampilkan bila ada; bila tidak ada, tidak muncul apa-apa (tanpa pesan). */
  return `<img src="${esc(url)}" alt="" onerror="this.remove()" class="my-3 mx-auto max-w-full">`;
}
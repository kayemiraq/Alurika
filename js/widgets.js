/* ===== WIDGET INTERAKTIF ===== */
const wrap = (id, fn) => { R[id] = fn; return `<div data-w="${id}">${fn()}</div>`; };
const rw = id => { const e = document.querySelector(`[data-w="${id}"]`); if (e && R[id]) e.innerHTML = R[id](); };
const card = (t, inner, cls = '') => `<div class="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-pink-50 border-2 border-indigo-100 ${cls}"><div class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-2">🎮 ${t}</div>${inner}</div>`;
const btn = (act, attrs, txt, cls = 'bg-white border-2 border-slate-200 hover:border-indigo-400') => `<button data-act="${act}" ${attrs} class="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 transition ${cls}">${txt}</button>`;

function explorer(id) {
  const T = mkTree(D.tree); const st = W[id] = W[id] || { sel: null, q: null, fb: null, sc: 0, tot: 0 };
  return wrap(id, () => {
    const x = st.sel, info = x ? `<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm"><b>Node ${x}</b><span class="text-slate-500">${x === T.root ? 'Root' : T.kids[x].length ? 'Internal' : 'Leaf'}</span>
      <span>Parent</span><b>${T.parent[x] || '-'}</b><span>Child</span><b>${T.kids[x].join(', ') || '-'}</b><span>Sibling</span><b>${T.sibs(x).join(', ') || '-'}</b><span>Depth</span><b>${T.depth(x)}</b><span>Height</span><b>${T.height(x)}</b></div>` : '<p class="text-sm text-slate-500">Klik sebuah node pada diagram untuk melihat perannya.</p>';
    const q = st.q;
    const quiz = !q ? `<div class="text-sm text-slate-600 mb-2">Uji pemahamanmu dengan soal acak dari diagram ini.</div>${btn('qnew', `data-w="${id}"`, '🎯 Mulai Tantangan', 'bg-indigo-600 text-white')}` :
      `<div class="text-sm font-semibold text-slate-800 mb-2">${q.t}</div>${q.num !== undefined ? `<div class="flex gap-2 flex-wrap">${[0, 1, 2, 3, 4].map(v => btn('qnum', `data-w="${id}" data-v="${v}"`, v)).join('')}</div>` : '<div class="text-xs text-slate-500">(klik node pada diagram)</div>'}
      ${st.fb ? `<div class="mt-3 p-3 rounded-xl text-sm ${st.fb.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${st.fb.ok ? '✅ Benar!' : '❌ Belum tepat.'} ${st.fb.exp}</div><div class="mt-2">${btn('qnew', `data-w="${id}"`, 'Soal berikutnya →', 'bg-indigo-600 text-white')}</div>` : ''}<div class="mt-2 text-xs text-slate-500">Skor tantangan: ${st.sc}/${st.tot}</div>`;
    return `<div class="grid md:grid-cols-2 gap-4"><div class="bg-white rounded-xl p-2">${svgTree(T.kids, [T.root], { rootSet: [T.root], sel: x, id, hl: q && st.fb && q.node ? q.node : [] })}</div><div class="space-y-3"><div class="bg-white rounded-xl p-3">${info}</div><div class="bg-white rounded-xl p-3">${quiz}</div></div></div>`;
  });
}
function genQ(T) {
  const pick = a => a[Math.random() * a.length | 0], nr = T.nodes.filter(n => T.parent[n]), ws = nr.filter(n => T.sibs(n).length);
  const k = pick(['parent', 'child', 'depth', 'height', 'sib', 'leaf']), x = k === 'sib' ? pick(ws) : k === 'parent' ? pick(nr) : pick(T.nodes);
  if (k === 'parent') return { t: `Klik <b>parent</b> dari node <b>${x}</b>.`, node: [T.parent[x]], exp: `Parent ${x} adalah ${T.parent[x]} (tepat satu tingkat di atas dan terhubung langsung).` };
  if (k === 'child') return { t: `Berapa jumlah <b>child</b> node <b>${x}</b>?`, num: T.kids[x].length, exp: `Child ${x}: ${T.kids[x].join(', ') || 'tidak ada'} → ${T.kids[x].length}.` };
  if (k === 'depth') return { t: `Berapa <b>depth</b> node <b>${x}</b>? (depth root = 0)`, num: T.depth(x), exp: `Depth = jumlah edge dari root ke ${x} = ${T.depth(x)}.` };
  if (k === 'height') return { t: `Berapa <b>height</b> node <b>${x}</b>? (height leaf = 0)`, num: T.height(x), exp: `Height = jumlah edge pada lintasan terpanjang dari ${x} ke leaf = ${T.height(x)}.` };
  if (k === 'sib') return { t: `Klik salah satu <b>sibling</b> dari node <b>${x}</b>.`, node: T.sibs(x), exp: `Sibling ${x}: ${T.sibs(x).join(', ')} (memiliki parent yang sama: ${T.parent[x]}).` };
  return { t: 'Klik sebuah <b>leaf</b> (node tanpa child).', node: T.leaves, exp: `Leaf: ${T.leaves.join(', ')}.` };
}
function classifier() {
  const G = D.groups, terms = Object.values(G).flat(), st = W.cls = W.cls || { sel: null, placed: {}, msg: '' };
  return wrap('cls', () => `<div class="flex flex-wrap gap-2 mb-3">${terms.filter(t => !st.placed[t]).map(t => btn('term', `data-t="${t}"`, t, st.sel === t ? 'bg-indigo-600 text-white border-2 border-indigo-600' : '')).join('') || '<span class="text-sm font-bold text-emerald-700">🎉 Semua istilah sudah dikelompokkan dengan benar!</span>'}</div>
    <div class="grid sm:grid-cols-3 gap-3">${Object.keys(G).map(g => `<button data-act="grp" data-g="${g}" class="text-left p-3 rounded-xl bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 min-h-[84px]"><div class="text-xs font-extrabold text-indigo-600 uppercase mb-1">${g}</div><div class="flex flex-wrap gap-1">${terms.filter(t => st.placed[t] === g).map(t => `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">${t}</span>`).join('')}</div></button>`).join('')}</div>
    <p class="mt-3 text-sm ${st.msg.startsWith('✅') ? 'text-emerald-700' : 'text-rose-700'}">${st.msg || 'Pilih satu istilah, lalu klik kelompok yang tepat.'}</p>`);
}
function treeOrNot() {
  const items = [['(a)', true, 'Memenuhi semua ciri: satu root, hierarkis, tanpa siklus, dan setiap node selain root punya satu parent.'], ['(b)', false, 'X-Y-Z membentuk siklus (jalur kembali ke node awal).'], ['(c)', false, 'Node O memiliki dua parent (M dan N).']];
  const st = W.ton = W.ton || {};
  return wrap('ton', () => `<div class="text-sm mb-2">Amati Gambar 3 di atas. Mana yang <b>tree</b>?</div>${items.map(([n, ok, why]) => `<div class="flex flex-wrap items-center gap-2 py-1.5"><b class="w-8">${n}</b>${btn('ton', `data-n="${n}" data-v="1"`, 'Tree', st[n] === '1' ? 'bg-indigo-600 text-white' : '')}${btn('ton', `data-n="${n}" data-v="0"`, 'Bukan tree', st[n] === '0' ? 'bg-indigo-600 text-white' : '')}${st[n] !== undefined ? `<span class="text-sm ${(st[n] === '1') === ok ? 'text-emerald-700' : 'text-rose-700'}">${(st[n] === '1') === ok ? '✅' : '❌ Coba lagi atau lihat:'} ${(st[n] === '1') === ok || true ? esc(why) : ''}</span>` : ''}</div>`).join('')}`);
}
function builder(id, spec, hint) {
  if (!spec) return '';
  const st = S.build[id] = S.build[id] || { p: {} }, ids = [spec.root, ...ALPHA.filter(c => c !== spec.root)].slice(0, spec.n);
  return wrap(id, () => {
    const par = {}; ids.forEach(n => { if (n !== spec.root && st.p[n] && ids.includes(st.p[n])) par[n] = st.p[n]; });
    const kids = {}; ids.forEach(n => kids[n] = []); Object.keys(par).forEach(n => kids[par[n]].push(n));
    const roots = ids.filter(n => !par[n]), { pos } = layout(kids, roots), cyc = ids.filter(n => !(n in pos)), orph = roots.filter(n => n !== spec.root);
    const valid = !cyc.length && !orph.length, leaf = ids.filter(n => !kids[n].length).length, ht = valid ? Math.max(...ids.map(n => pos[n].y)) : null, edges = Object.keys(par).length;
    const ck = [[valid, `Semua node terhubung ke root ${spec.root}, tanpa siklus${cyc.length ? ' (siklus: ' + cyc.join(',') + ')' : ''}${orph.length ? ' (belum punya parent: ' + orph.join(',') + ')' : ''}`], [valid && leaf === spec.leaf, `Jumlah leaf = ${spec.leaf} (sekarang ${valid ? leaf : '?'})`], [valid && ht === spec.height, `Height = ${spec.height} (sekarang ${valid ? ht : '?'})`], [valid && edges === spec.n - 1, `Jumlah edge = node − 1 = ${spec.n - 1} (sekarang ${edges})`]];
    return `<div class="text-sm mb-3">${hint || ''} Susun tree dengan <b>${spec.n} node</b>, root <b>${spec.root}</b>, <b>${spec.leaf} leaf</b>, dan <b>height ${spec.height}</b>. Pilih parent untuk setiap node.</div>
    <div class="grid md:grid-cols-2 gap-4"><div class="bg-white rounded-xl p-3 grid grid-cols-2 gap-2 content-start">${ids.filter(n => n !== spec.root).map(n => `<label class="text-sm font-bold flex items-center gap-2">${n} → parent <select data-bsel="${id}" data-n="${n}" class="border-2 border-slate-200 rounded-lg px-1 py-1 text-sm font-semibold"><option value="">–</option>${ids.filter(m => m !== n).map(m => `<option ${par[n] === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>`).join('')}</div>
    <div class="bg-white rounded-xl p-2">${svgTree(kids, roots, { rootSet: [spec.root] })}</div></div>
    <ul class="mt-3 space-y-1 text-sm">${ck.map(([ok, t]) => `<li class="${ok ? 'text-emerald-700' : 'text-slate-600'}">${ok ? '✅' : '⬜'} ${t}</li>`).join('')}</ul>${ck.every(c => c[0]) ? '<div class="mt-2 p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">🎉 Tree-mu memenuhi semua syarat!</div>' : ''}`;
  });
}
function activity(sec) {
  const tp = sec.tp && sec.tp[0];
  if (tp === 2) return card('Tree atau Bukan? (TP 2)', treeOrNot());
  if (tp === 3 && D.groups) return card('Kelompokkan Istilah (TP 3)', classifier());
  if ((tp === 4 || tp === 13) && D.tree) return card(tp === 4 ? 'Jelajahi Tree (TP 4–12)' : 'Tantangan Satu Diagram (TP 13)', explorer('exp' + tp));
  if (tp === 14 && D.specLkpd) return card('Susun Tree (TP 14)', builder('b-mat', D.specLkpd));
  return '';
}

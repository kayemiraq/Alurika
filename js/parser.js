/* Mengubah Pandoc AST (APIK_DATA) menjadi struktur siap tampil: sections, tps, diag, form, lkpd, tree. */
const $ = id => document.getElementById(id);
/* ===== DATA LAYER: membaca Pandoc AST asli (tanpa mengubah JSON) ===== */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const IMG = '\u0001';
function inlTxt(x) {
  if (!x) return '';
  if (Array.isArray(x)) return x.map(inlTxt).join('');
  switch (x.t) {
    case 'Str': return x.c;
    case 'Space': case 'SoftBreak': return ' ';
    case 'LineBreak': return '\n';
    case 'Image': return IMG + x.c[2][0] + IMG;
    case 'Code': case 'Math': return x.c[1];
    case 'Strong': case 'Emph': case 'Underline': case 'Strikeout': case 'Superscript': case 'Subscript': case 'SmallCaps': return inlTxt(x.c);
    case 'Link': case 'Span': return inlTxt(x.c[1]);
    case 'Quoted': return '"' + inlTxt(x.c[1]) + '"';
    default: return '';
  }
}
function tbl(b) {
  const c = b.c, rows = [], push = r => rows.push(r[1].map(cell => cell[4]));
  const hr = (c[3] && c[3][1]) || [];
  hr.forEach(push);
  (c[4] || []).forEach(bd => { (bd[2] || []).forEach(push); (bd[3] || []).forEach(push); });
  return { head: hr.length, rows };
}
function bTxt(b) {
  if (!b) return '';
  if (Array.isArray(b)) return b.map(bTxt).join(' ').replace(/\s+/g, ' ').trim();
  switch (b.t) {
    case 'Para': case 'Plain': return inlTxt(b.c);
    case 'Header': return inlTxt(b.c[2]);
    case 'BulletList': return b.c.map(bTxt).join(' ');
    case 'OrderedList': return b.c[1].map(bTxt).join(' ');
    case 'BlockQuote': return bTxt(b.c);
    case 'Div': return bTxt(b.c[1]);
    case 'Table': return tbl(b).rows.map(r => r.map(bTxt).join(' ')).join(' ');
    case 'CodeBlock': return b.c[1];
    default: return '';
  }
}
function allParas(bl, out = []) {
  (bl || []).forEach(b => {
    if (b.t === 'Para' || b.t === 'Plain') out.push(inlTxt(b.c).trim());
    else if (b.t === 'BulletList') b.c.forEach(i => allParas(i, out));
    else if (b.t === 'OrderedList') b.c[1].forEach(i => allParas(i, out));
    else if (b.t === 'BlockQuote') allParas(b.c, out);
    else if (b.t === 'Table') tbl(b).rows.forEach(r => r.forEach(c => allParas(c, out)));
  });
  return out;
}
/* pilihan ganda: cari "A. ... B. ..." berurutan di dalam teks soal */
function parseMC(t, letters) {
  const idx = []; let p = 0;
  for (const L of letters) {
    const re = new RegExp('(^|\\s)' + L + '\\.\\s', 'g'); re.lastIndex = p;
    const m = re.exec(t); if (!m) return null;
    idx.push([m.index + m[1].length, m.index + m[0].length]); p = m.index + m[0].length;
  }
  const opts = idx.map((s, i) => ({ id: letters[i].toLowerCase(), text: t.slice(s[1], idx[i + 1] ? idx[i + 1][0] : t.length).trim() }));
  return { stem: t.slice(0, idx[0][0]).trim(), opts };
}
const splitImgs = t => ({ imgs: [...t.matchAll(/\u0001([^\u0001]+)\u0001/g)].map(m => m[1]), text: t.replace(/\u0001[^\u0001]+\u0001/g, ' ').replace(/\s+/g, ' ').trim() });

function buildData(modul, lkpd) {
  const M = (modul && modul.blocks) || [], L = (lkpd && lkpd.blocks) || [];
  const D = { ok: M.length > 0, warn: [], sections: [], tps: [], topics: [], diag: { items: [], instr: '' }, form: { items: [], key: {}, pengayaan: '', remedial: '' }, tree: null, folder: {}, groups: null, lkpd: L, specLkpd: null };
  if (!M.length) D.warn.push('modulTree.json kosong atau tidak terbaca.');
  if (!L.length) D.warn.push('LKPDTree.json kosong atau tidak terbaca.');
  const find = (bl, re, type, from = 0) => { for (let i = from; i < bl.length; i++) if ((!type || bl[i].t === type) && re.test(bTxt(bl[i]))) return i; return -1; };
  const firstTable = (bl, from) => { for (let i = from; i < bl.length; i++) if (bl[i].t === 'Table') return tbl(bl[i]); return null; };
  try { // identitas & CP
    const ti = M.filter(b => b.t === 'Table').map(tbl);
    ti.forEach(t => t.rows.forEach(r => {
      const k = bTxt(r[0]), v = r[1];
      if (/^Elemen$/.test(k)) D.elemen = bTxt(v);
      if (/^Elemen CP$/.test(k)) D.cp = bTxt(v);
      if (/^Fase CP$/.test(k)) D.fase = bTxt(v);
      if (/^Mata Pelajaran$/.test(k)) D.mapel = bTxt(v);
      if (/^Materi Pembelajaran$/.test(k) && v) D.topics = (v.find(x => x.t === 'OrderedList') || { c: [0, []] }).c[1].map(bTxt);
      if (/^\*?\*?TP \d+\./.test(bTxt(r[0])) || /^TP \d+\./.test(k)) {
        D.tps.push(k);
        if (r.length >= 3 && r[1].length) { D.pemahaman = r[1]; D.pemantik = r[2]; }
      }
    }));
    D.topic = (D.elemen || '').split(':').pop().trim() || 'Pembelajaran';
  } catch (e) { D.warn.push('Identitas modul: ' + e.message); }
  try { // materi -> sections
    const iM = find(M, /^MATERI PEMBELAJARAN$/, 'OrderedList');
    const t = iM >= 0 ? firstTable(M, iM + 1) : null;
    const cell = t && t.rows[0] && t.rows[0][0] || [];
    const flat = bl => bl.flatMap(b => b.t === 'BlockQuote' ? flat(b.c) : [b]);
    const strongLead = b => b && (b.t === 'Para' || b.t === 'Plain') && b.c[0] && b.c[0].t === 'Strong';
    const lead = blocks => { // pisahkan judul (Strong pertama) dari isi
      const fb = flat(blocks), f = fb[0];
      if (!strongLead(f)) return { title: '', blocks: fb };
      let rest = f.c.slice(1); while (rest[0] && rest[0].t === 'Space') rest = rest.slice(1);
      return { title: inlTxt(f.c[0]).trim().replace(/\.$/, ''), blocks: (rest.length ? [{ t: 'Para', c: rest }] : []).concat(fb.slice(1)) };
    };
    const secs = [{ title: 'Pengantar', blocks: [] }];
    flat(cell).forEach((b, i) => {
      const cur = secs[secs.length - 1];
      if (b.t === 'OrderedList') {
        b.c[1].forEach(item => {
          const l = lead(item);
          if (/\(TP \d/.test(l.title)) secs.push(l); else cur.blocks.push({ t: 'OrderedList', c: [b.c[0], [item]] });
        });
      } else if (strongLead(b) && /^Ringkasan/.test(inlTxt(b.c[0]))) { secs.push(lead([b])); }
      else if (i === 0 && strongLead(b) && /^Pengantar/.test(inlTxt(b.c[0]))) { cur.blocks.push(...lead([b]).blocks); }
      else cur.blocks.push(b);
    });
    D.sections = secs.filter(s => s.blocks.length);
    D.sections.forEach(s => { const m = s.title.match(/\(TP (\d+)(?:-(\d+))?\)/); s.tp = m ? [+m[1], +(m[2] || m[1])] : null; });
    if (!D.sections.length) D.warn.push('Bagian materi tidak ditemukan.');
  } catch (e) { D.warn.push('Materi: ' + e.message); }
  try { // asesmen diagnostik
    const iD = find(M, /Asesmen Diagnostik/, 'OrderedList');
    if (iD >= 0) {
      const q = find(M, /Petunjuk/, 'BlockQuote', iD); if (q >= 0) D.diag.instr = bTxt(M[q]);
      const t = firstTable(M, iD);
      (t ? t.rows : []).forEach(r => {
        const txt = bTxt(r[0]); const m = txt.match(/^Soal\s*(\d+)\s*\/?\s*([\s\S]*)$/); if (!m) return;
        const { imgs, text } = splitImgs(m[2]); const mc = parseMC(text, ['A', 'B', 'C', 'D']);
        D.diag.items.push(mc ? { no: +m[1], type: 'PG', imgs, stem: mc.stem, opts: mc.opts } : { no: +m[1], type: 'ISIAN', imgs, stem: text, opts: [] });
      });
    }
  } catch (e) { D.warn.push('Diagnostik: ' + e.message); }
  try { // asesmen formatif + kunci
    const iF = find(M, /Asesmen Formatif/, 'OrderedList');
    if (iF >= 0) {
      const t = firstTable(M, iF);
      (t ? t.rows : []).forEach(r => {
        if (r.length < 6 || !/^\d+$/.test(bTxt(r[3]))) return;
        const { imgs, text } = splitImgs(bTxt(r[4])); const form = bTxt(r[2]);
        const it = { materi: bTxt(r[0]), tp: bTxt(r[1]), form, no: +bTxt(r[3]), imgs, skor: +bTxt(r[5]) || 0, stem: text, opts: [] };
        if (/^PG$/i.test(form)) { const mc = parseMC(text, ['a', 'b', 'c', 'd']); if (mc) { it.stem = mc.stem; it.opts = mc.opts; } }
        D.form.items.push(it);
      });
      const k = find(M, /Kunci Jawaban/, 'BlockQuote', iF);
      const kt = k >= 0 ? firstTable(M, k) : null;
      (kt ? kt.rows : []).forEach(r => { for (let i = 0; i + 2 < r.length; i += 3) { const no = +bTxt(r[i]); if (no && bTxt(r[i + 1])) D.form.key[no] = { v: bTxt(r[i + 1]), skor: +bTxt(r[i + 2]) || 0 }; } });
      D.form.items.forEach(it => { if (!it.opts.length) { const sp = (D.form.key[it.no] || {}).v || ''; const parts = sp.split(/\s*\((\d+) poin\)\.?\s*/); it.rubric = []; for (let i = 0; i + 1 < parts.length; i += 2) if (parts[i].trim()) it.rubric.push({ text: parts[i].trim().replace(/^Jawaban[^:]*\(skor \d+\):\s*/, ''), pts: +parts[i + 1] }); } });
    }
    const para = allParas(M.slice(Math.max(0, find(M, /Pengayaan dan Remedial/, 'OrderedList'))));
    D.form.pengayaan = para.find(p => /80 atau lebih/.test(p)) || ''; D.form.remedial = para.find(p => /kurang dari 80/.test(p)) || '';
  } catch (e) { D.warn.push('Formatif: ' + e.message); }
  try { // pohon (Gambar 2) dari tabel TP 13 di materi
    const sec = D.sections.find(s => s.tp && s.tp[0] === 13);
    const tb = sec && sec.blocks.find(b => b.t === 'Table');
    if (tb) {
      const t = tbl(tb), h = t.rows[0].map(bTxt), ip = h.findIndex(x => /Parent/i.test(x)), inode = h.findIndex(x => /Node/i.test(x));
      const parent = {}, nodes = [];
      t.rows.slice(1).forEach(r => { const n = bTxt(r[inode]), p = bTxt(r[ip]); if (n) { nodes.push(n); parent[n] = /^[-–]?$/.test(p) ? null : p; } });
      if (nodes.length) D.tree = { nodes, parent };
    }
    const all = bTxt(M); [...all.matchAll(/\b([A-Z]) = ([A-Za-z]+)/g)].forEach(m => D.folder[m[1]] = m[2]);
    const g = D.sections.find(s => s.tp && s.tp[0] === 3);
    if (g) { const gr = {}; allParas(g.blocks).forEach(p => { const m = p.match(/^(Komponen|Hubungan antar node|Ukuran)\s*:\s*([a-z, ]+?)\s*(\(|\.|$)/); if (m) gr[m[1]] = m[2].split(/,| dan /).map(s => s.trim()).filter(Boolean); }); if (Object.keys(gr).length) D.groups = gr; }
  } catch (e) { D.warn.push('Diagram: ' + e.message); }
  try { // spesifikasi menyusun tree dari LKPD 4B
    const m = bTxt(L).match(/(\d+) node, root (\w+), (\d+) leaf,? dan height (\d+)/i);
    if (m) D.specLkpd = { n: +m[1], root: m[2], leaf: +m[3], height: +m[4] };
  } catch (e) { /* abaikan */ }
  return D;
}

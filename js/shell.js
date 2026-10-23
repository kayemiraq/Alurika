/* Kerangka Alurika: daftar tab, navigasi, progres di nav/status bar, dan render halaman. */
const TABS = ['beranda','kurikulum','diagnostik','materi','lkpd','visualizer','formatif'];
const TAB_META = { beranda:['home','Beranda'], kurikulum:['book-open','Kurikulum'], diagnostik:['target','Diagnostik'], materi:['layers','Materi'], lkpd:['clipboard-list','LKPD'], visualizer:['git-branch','Visualizer'], formatif:['trophy','Tantangan'] };
const icons = () => { try { window.lucide && lucide.createIcons(); } catch (e) { } };
function switchTab(t) {
  const lk = locked(t); if (lk) return ask(lk, null, true);
  tab = t; try { if (location.hash !== '#' + t) history.pushState(null, '', '#' + t); } catch (e) { }
  render(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateProgress() {
  const p = pct(); $('sb-bar').style.width = p.all + '%'; $('sb-pct').textContent = p.all + '%';
  $('sb-sub').textContent = `Informatika Fase E · ${D.topic} · ${TAB_META[tab][1]}`;
  $('profile-name').textContent = S.name || 'Siswa';
  TABS.forEach(t => {
    const b = $('nav-' + t), lk = !!locked(t); if (!b) return;
    b.className = 'nav-tab px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ' + (t === tab ? 'active text-white' : lk ? 'text-white/40' : 'text-white/70');
    b.setAttribute('aria-disabled', lk ? 'true' : 'false');
    if (b.dataset.lk !== String(lk)) { b.dataset.lk = lk; b.querySelector('.ni').innerHTML = `<i data-lucide="${lk ? 'lock' : TAB_META[t][0]}" class="w-4 h-4"></i>`; }
  });
}
const tpl = id => document.getElementById(id).content.cloneNode(true);
function render() {
  R = {}; clearTimeout(V.tm); const home = tab === 'beranda';
  if (home) $('view').replaceChildren(tpl('tpl-hero'));
  else {
    const v = tab === 'kurikulum' ? vKur() : tab === 'visualizer' ? vViz() : tab === 'diagnostik' ? vQuiz('diag') : tab === 'materi' ? vMateri() : tab === 'lkpd' ? vLkpd() : vQuiz('form');
    $('view').innerHTML = `<div class="max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-20">${v}</div>`;
  }
  updateProgress(); icons(); save();
  try { if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab); } catch (e) { }
}


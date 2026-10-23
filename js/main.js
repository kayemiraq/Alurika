/* Listener global (input visualizer, back button, status bar) dan boot aplikasi. */
document.addEventListener('input', ev => { if (ev.target.dataset.v === 'name') V.name = ev.target.value.toUpperCase(); });
document.addEventListener('change', ev => { if (ev.target.dataset.v === 'par') V.par = ev.target.value; });
window.addEventListener('popstate', () => { const t = (location.hash || '').slice(1); if (TABS.includes(t) && !locked(t)) { tab = t; render(); } });
let _ly = 0; window.addEventListener('scroll', () => { const sb = $('status-bar'), y = window.scrollY; sb.style.transition = 'transform .35s ease, opacity .35s ease'; const hide = y > _ly && y > 300; sb.style.transform = `translateX(-50%) translateY(${hide ? 100 : 0}px)`; sb.style.opacity = hide ? '0' : '1'; _ly = y; });
function boot() {
  D = buildData(rj('modulTree'), rj('LKPDTree')); S = load();
  if (!D.ok) { $('view').innerHTML = glass('Data materi tidak dapat dibaca. Periksa berkas modulTree.json.'); return; }
  if (!TABS.includes(tab) || locked(tab)) tab = 'beranda';
  render();
}
boot();

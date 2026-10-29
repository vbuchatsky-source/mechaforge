// Challenge selector (header)
(function () {
  const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
  const L = (h, e) => EN ? e : h; const c2 = !!window.MF_C2;
  const d = document.createElement('div'); d.className = 'chsel';
  d.innerHTML = `<a href="./${c2 ? '' : ''}index.html" class="${c2 ? '' : 'on'}" id="ch1">🔩 ${L('אתגר 1: מברגה', 'Challenge 1: Drill')}</a><a href="./diff.html" class="${c2 ? 'on' : ''}" id="ch2">⚙ ${L('אתגר 2: דיפרנציאל', 'Challenge 2: Differential')}</a>`;
  const lvl = document.getElementById('lvl'); lvl.parentNode.insertBefore(d, lvl);
})();
try{['xai','openai'].forEach(p=>localStorage.removeItem('mf_ai_key_'+p));}catch(e){}
// resizable parts library (drag the inner edge)
(function () {
  const pal = document.getElementById('palette'); if (!pal) return;
  const MIN = 190, MAX = 440, saved = +localStorage.getItem('mf_pal_w');
  const set = w => { w = Math.max(MIN, Math.min(MAX, w)); pal.style.width = w + 'px'; document.documentElement.style.setProperty('--palw', w + 'px'); return w; };
  if (saved) set(saved);
  const sp = document.createElement('div'); sp.className = 'psplit'; sp.title = 'גרור לשינוי רוחב / drag to resize'; pal.appendChild(sp);
  sp.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); sp.setPointerCapture(e.pointerId); const x0 = e.clientX, w0 = pal.getBoundingClientRect().width, rtl = getComputedStyle(pal).direction === 'rtl'; let w = w0;
    const mv = ev => { w = set(w0 + (rtl ? x0 - ev.clientX : ev.clientX - x0)); };
    const up = () => { sp.removeEventListener('pointermove', mv); sp.removeEventListener('pointerup', up); localStorage.setItem('mf_pal_w', Math.round(w)); dispatchEvent(new Event('resize')); };
    sp.addEventListener('pointermove', mv); sp.addEventListener('pointerup', up); });
  sp.addEventListener('dblclick', () => { localStorage.removeItem('mf_pal_w'); pal.style.width = ''; });
})();

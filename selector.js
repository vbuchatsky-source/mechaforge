// Header: Home + challenge selector
(function () {
  const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
  const L = (h, e) => EN ? e : h, here = location.pathname.split('/').pop() || 'index.html';
  const CH = [['drill.html', '🔩', 'מברגה', 'Drill'], ['diff.html', '⚙', 'דיפרנציאל', 'Differential'], ['ratchet.html', '🔧', 'ראצ׳ט ומצמד', 'Ratchet & Clutch'], ['ujoint.html', '✚', 'מפרק קרדן', 'U-Joint'], ['cam.html', '🥚', 'גל זיזים', 'Camshaft'], ['fourbar.html', '📐', 'ארבע מוטות', 'Four-Bar']];
  const d = document.createElement('div'); d.className = 'chsel';
  const cur = CH.findIndex(c => c[0] === here);
  d.innerHTML = `<a href="./index.html" class="home" id="chH">🏠 ${L('בית (Home)', 'Home')}</a><select id="chS" title="${L('בחר אתגר', 'Pick a challenge')}">${CH.map((c, i) => `<option value="${c[0]}"${i === cur ? ' selected' : ''}>${c[1]} ${L('אתגר', 'Challenge')} ${i + 1}: ${L(c[2], c[3])}</option>`).join('')}</select>`;
  d.querySelector('#chS').onchange = e => location.href = './' + e.target.value;
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

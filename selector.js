// Challenge selector (header)
(function () {
  const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
  const L = (h, e) => EN ? e : h; const c2 = !!window.MF_C2;
  const d = document.createElement('div'); d.className = 'chsel';
  d.innerHTML = `<a href="./${c2 ? '' : ''}index.html" class="${c2 ? '' : 'on'}" id="ch1">🔩 ${L('אתגר 1: מברגה', 'Challenge 1: Drill')}</a><a href="./diff.html" class="${c2 ? 'on' : ''}" id="ch2">⚙ ${L('אתגר 2: דיפרנציאל', 'Challenge 2: Differential')}</a>`;
  const lvl = document.getElementById('lvl'); lvl.parentNode.insertBefore(d, lvl);
})();
try{['xai','openai'].forEach(p=>localStorage.removeItem('mf_ai_key_'+p));}catch(e){}

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
const L = (h, e) => EN ? e : h;
document.documentElement.dir = EN ? 'ltr' : 'rtl'; document.documentElement.lang = EN ? 'en' : 'he';
const J = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
const units = k => { const v = J(k); const a = Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : []; return Math.min(5, a.filter(x => (typeof x === 'number' ? x : x && (x.best ?? x.score ?? x.pct)) >= 70).length); };
const M = [
  { k: 'drill', he: 'מברגה', en: 'Cordless Drill', dh: 'בונים מנוע, תמסורת, מצמד וצ׳אק – מהיר וחלש הופך לאיטי וחזק.', de: 'Build motor, gearbox, clutch and chuck – fast and weak becomes slow and strong.', url: 'drill.html', uk: 'mf_units_c1', pk: 'mf_prog' },
  { k: 'diff', he: 'דיפרנציאל', en: 'Differential', dh: 'מאפשר לגלגלים להסתובב במהירות שונה בסיבוב.', de: 'Lets the wheels turn at different speeds in a corner.', url: 'diff.html', uk: 'mf_units_c2', pk: 'mf_prog_c2' },
  { k: 'ratchet', he: 'ראצ׳ט / מצמד', en: 'Ratchet / Clutch', dh: 'מסתובב לכיוון אחד בלבד, או מחליק כשהכוח גדול מדי.', de: 'Turns one way only, or slips when force is too high.', url: 'ratchet.html', uk: 'mf_units_c3', pk: 'mf_prog_c3' },
  { k: 'ujoint', he: 'מפרק קרדן', en: 'Universal Joint', dh: 'מעביר סיבוב בין שני צירים בזווית.', de: 'Passes rotation between two shafts at an angle.', url: 'ujoint.html', uk: 'mf_units_c4', pk: 'mf_prog_c4' },
  { k: 'camshaft', he: 'גל זיזים', en: 'Camshaft', dh: 'הופך סיבוב לתנועה של שסתומים למעלה ולמטה.', de: 'Turns rotation into valves moving up and down.', url: 'cam.html', uk: 'mf_units_c5', pk: 'mf_prog_c5' },
  { k: 'fourbar', he: 'מנגנון ארבע מוטות', en: 'Four-Bar Linkage', dh: 'ארבעה מוטות – סיבוב מלא הופך לנדנוד.', de: 'Four bars – full rotation becomes a swing.', url: 'fourbar.html', uk: 'mf_units_c6', pk: 'mf_prog_c6' }
];
document.getElementById('hT').textContent = L('בחר מנגנון לתרגול', 'Pick a mechanism to practice');
document.getElementById('hS').textContent = L('לחץ על כרטיס כדי לפתוח את האתגר: לימוד, תרגול, מבחן, חומר תיאורטי ומבחני ראיון.', 'Click a card to open its challenge: learn, practice, test, theory and interview tests.');
const hl = document.getElementById('hLang'); hl.textContent = EN ? 'עברית' : 'EN'; hl.onclick = () => { localStorage.setItem('mf_lang', EN ? 'he' : 'en'); location.reload(); };
const grid = document.getElementById('grid');
M.forEach((m, i) => {
  const c = document.createElement('button'); c.className = 'hcard' + (m.url ? '' : ' soon'); c.dataset.k = m.k;
  let ft;
  if (m.url) { let p = J(m.pk); if (!p || typeof p !== 'object') p = {}; let u = 0; try { u = units(m.uk); } catch (e) {} const st = Math.max(0, Math.min(3, +p.best || 0));
    ft = `<span class="chip">${L(`מבחנים: ${u} מתוך 5`, `Tests: ${u} of 5`)}</span><span class="chip">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>${p.badge ? `<span class="chip">🏅</span>` : ''}<span class="chip go">${L('לתרגול ←', 'Practice →')}</span>`;
  } else ft = `<span class="chip soon">${L('בקרוב (Coming soon)', 'Coming soon')}</span><span class="chip">${L('תצוגה מקדימה', 'Preview')}</span>`;
  c.innerHTML = `<span class="num">${i + 1}</span><div class="view"></div><div class="bd"><div class="nm">${EN ? m.en : `${m.he} (${m.en})`}</div><div class="ds">${L(m.dh, m.de)}</div><div class="ft">${ft}</div></div>`;
  c.onclick = () => { if (m.url) location.href = m.url; else if (window.mfGlossOpen) window.mfGlossOpen(m.k); };
  grid.appendChild(c); m.el = c.querySelector('.view');
});
try {
// one shared renderer, scissor per card
const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
R.setPixelRatio(Math.min(devicePixelRatio, 1.5)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
const env = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(R), 0.04).texture;
const mk = () => { const s = new THREE.Scene(); s.environment = env; s.add(new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.4)); const k = new THREE.DirectionalLight(0xffffff, 2); k.position.set(5, 9, 7); s.add(k); const r2 = new THREE.DirectionalLight(0x9fb6d6, 0.8); r2.position.set(-6, 3, -7); s.add(r2); return s; };
M.forEach(m => { const b = window.MF_B && window.MF_B[m.k]; if (!b) return; try { m.s = mk(); m.mod = b(); m.mod.tick(0.5);
  const piv = new THREE.Group(); const bx = new THREE.Box3().setFromObject(m.mod.g); m.mod.g.position.sub(bx.getCenter(new THREE.Vector3())); piv.add(m.mod.g); m.s.add(piv); m.piv = piv;
  const sz = bx.getSize(new THREE.Vector3()).length(); m.cam = new THREE.PerspectiveCamera(32, 1.4, 0.1, 200); m.cam.position.set(sz * 0.7, sz * 0.42, sz * 1.35); m.cam.lookAt(0, 0, 0); } catch (e) { console.warn('preview', m.k, e); m.s = null; } });
const t0 = performance.now();
const hc = document.getElementById('hc'); if (hc) hc.style.display = 'none';
// offscreen renderer; each card gets its own 2D canvas that scrolls natively with the card
M.forEach(m => { if (!m.s) return; const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none'; if (getComputedStyle(m.el).position === 'static') m.el.style.position = 'relative'; m.el.appendChild(cv); m.cv = cv; m.cx = cv.getContext('2d'); });
const PR = Math.min(devicePixelRatio, 1.5);
function frame() {
  const H = (window.visualViewport ? visualViewport.height : innerHeight) + 200;
  const t = (performance.now() - t0) / 1000, hov = document.querySelector('.hcard:hover');
  for (const m of M) { if (!m.s || !m.cv) continue; const r = m.el.getBoundingClientRect(); if (r.bottom < -200 || r.top > H || r.width < 2) continue;
    try { const w = Math.round(r.width * PR), h = Math.round(r.height * PR);
      if (m.cv.width !== w || m.cv.height !== h) { m.cv.width = w; m.cv.height = h; }
      const sz = R.getSize(new THREE.Vector2()); if (sz.x !== Math.round(r.width) || sz.y !== Math.round(r.height)) R.setSize(Math.round(r.width), Math.round(r.height), false);
      const act = hov && hov.dataset.k === m.k; m.mod.tick(act ? t * 1.6 : t * 0.5); m.piv.rotation.y = t * 0.25;
      m.cam.aspect = r.width / r.height; m.cam.updateProjectionMatrix();
      R.setClearColor(0, 0); R.clear(); R.render(m.s, m.cam);
      m.cx.clearRect(0, 0, w, h); m.cx.drawImage(R.domElement, 0, 0, w, h); } catch (e) { m.s = null; } }
  requestAnimationFrame(frame);
}
frame();
window.__home = M.map(m => ({ k: m.k, built: !!m.url, model: !!m.s }));

} catch (e) { console.warn('3D previews disabled:', e); document.body.classList.add('no3d'); window.__home = M.map(m => ({ k: m.k, built: !!m.url, model: false })); }

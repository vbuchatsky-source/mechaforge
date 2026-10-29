import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
const L = (h, e) => EN ? e : h;
document.documentElement.dir = EN ? 'ltr' : 'rtl'; document.documentElement.lang = EN ? 'en' : 'he';
const J = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
const units = k => (J(k) || []).filter(x => x >= 70).length;
const M = [
  { k: 'drill', he: 'מברגה', en: 'Cordless Drill', dh: 'בונים מנוע, תמסורת, מצמד וצ׳אק – מהיר וחלש הופך לאיטי וחזק.', de: 'Build motor, gearbox, clutch and chuck – fast and weak becomes slow and strong.', url: 'drill.html', uk: 'mf_units_c1', pk: 'mf_prog' },
  { k: 'diff', he: 'דיפרנציאל', en: 'Differential', dh: 'מאפשר לגלגלים להסתובב במהירות שונה בסיבוב.', de: 'Lets the wheels turn at different speeds in a corner.', url: 'diff.html', uk: 'mf_units_c2', pk: 'mf_prog_c2' },
  { k: 'ratchet', he: 'ראצ׳ט / מצמד', en: 'Ratchet / Clutch', dh: 'מסתובב לכיוון אחד בלבד, או מחליק כשהכוח גדול מדי.', de: 'Turns one way only, or slips when force is too high.', url: 'ratchet.html', uk: 'mf_units_c3', pk: 'mf_prog_c3' },
  { k: 'ujoint', he: 'מפרק קרדן', en: 'Universal Joint', dh: 'מעביר סיבוב בין שני צירים בזווית.', de: 'Passes rotation between two shafts at an angle.', url: 'ujoint.html', uk: 'mf_units_c4', pk: 'mf_prog_c4' },
  { k: 'camshaft', he: 'גל זיזים', en: 'Camshaft', dh: 'הופך סיבוב לתנועה של שסתומים למעלה ולמטה.', de: 'Turns rotation into valves moving up and down.', url: 'cam.html', uk: 'mf_units_c5', pk: 'mf_prog_c5' },
  { k: 'fourbar', he: 'מנגנון ארבע מוטות', en: 'Four-Bar Linkage', dh: 'ארבעה מוטות – סיבוב מלא הופך לנדנוד.', de: 'Four bars – full rotation becomes a swing.', url: 'fourbar.html', uk: 'mf_units_c6', pk: 'mf_prog_c6' }
];
document.getElementById('hT').textContent = L('בחר מנגנון לתרגול', 'Pick a mechanism to practice');
document.getElementById('hS').textContent = L('לחץ על כרטיס כדי לפתוח את האתגר. כרטיסים שמסומנים "בקרוב" מציגים רק תצוגה מקדימה.', 'Click a card to open its challenge. Cards marked "Coming soon" show a preview only.');
const hl = document.getElementById('hLang'); hl.textContent = EN ? 'עברית' : 'EN'; hl.onclick = () => { localStorage.setItem('mf_lang', EN ? 'he' : 'en'); location.reload(); };
const grid = document.getElementById('grid');
M.forEach((m, i) => {
  const c = document.createElement('button'); c.className = 'hcard' + (m.url ? '' : ' soon'); c.dataset.k = m.k;
  let ft;
  if (m.url) { const p = J(m.pk) || {}, u = units(m.uk), st = p.best || 0;
    ft = `<span class="chip">${L('מבחנים', 'Tests')} ${u}/5</span><span class="chip">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>${p.badge ? `<span class="chip">🏅</span>` : ''}<span class="chip go">${L('לתרגול ←', 'Practice →')}</span>`;
  } else ft = `<span class="chip soon">${L('בקרוב (Coming soon)', 'Coming soon')}</span><span class="chip">${L('תצוגה מקדימה', 'Preview')}</span>`;
  c.innerHTML = `<span class="num">${i + 1}</span><div class="view"></div><div class="bd"><div class="nm">${EN ? m.en : `${m.he} (${m.en})`}${EN ? '' : `<small>${m.en}</small>`}</div><div class="ds">${L(m.dh, m.de)}</div><div class="ft">${ft}</div></div>`;
  c.onclick = () => { if (m.url) location.href = m.url; else if (window.mfGlossOpen) window.mfGlossOpen(m.k); };
  grid.appendChild(c); m.el = c.querySelector('.view');
});
// one shared renderer, scissor per card
const R = new THREE.WebGLRenderer({ canvas: document.getElementById('hc'), antialias: true, alpha: true });
R.setPixelRatio(Math.min(devicePixelRatio, 1.5)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1; R.setScissorTest(true);
const env = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(R), 0.04).texture;
const mk = () => { const s = new THREE.Scene(); s.environment = env; s.add(new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.4)); const k = new THREE.DirectionalLight(0xffffff, 2); k.position.set(5, 9, 7); s.add(k); const r2 = new THREE.DirectionalLight(0x9fb6d6, 0.8); r2.position.set(-6, 3, -7); s.add(r2); return s; };
M.forEach(m => { const b = window.MF_B && window.MF_B[m.k]; if (!b) return; m.s = mk(); m.mod = b(); m.mod.tick(0.5);
  const piv = new THREE.Group(); const bx = new THREE.Box3().setFromObject(m.mod.g); m.mod.g.position.sub(bx.getCenter(new THREE.Vector3())); piv.add(m.mod.g); m.s.add(piv); m.piv = piv;
  const sz = bx.getSize(new THREE.Vector3()).length(); m.cam = new THREE.PerspectiveCamera(32, 1.4, 0.1, 200); m.cam.position.set(sz * 0.7, sz * 0.42, sz * 1.35); m.cam.lookAt(0, 0, 0); });
const t0 = performance.now();
function frame() {
  const W = innerWidth, H = innerHeight; if (R.domElement.width !== Math.floor(W * R.getPixelRatio())) R.setSize(W, H, false);
  R.setClearColor(0, 0); R.setScissor(0, 0, W, H); R.clear();
  const t = (performance.now() - t0) / 1000, hov = document.querySelector('.hcard:hover');
  for (const m of M) { if (!m.s) continue; const r = m.el.getBoundingClientRect(); if (r.bottom < 56 || r.top > H || r.right < 0 || r.left > W) continue;
    const top = Math.max(r.top, 56), h = r.bottom - top; if (h <= 0) continue;
    const act = hov && hov.dataset.k === m.k; m.mod.tick(act ? t * 1.6 : t * 0.5); m.piv.rotation.y = t * 0.25;
    m.cam.aspect = r.width / r.height; m.cam.updateProjectionMatrix();
    R.setViewport(r.left, H - r.bottom, r.width, r.height); R.setScissor(r.left, H - r.bottom, r.width, h); R.render(m.s, m.cam); }
  requestAnimationFrame(frame);
}
frame();
window.__home = M.map(m => ({ k: m.k, built: !!m.url, model: !!m.s }));

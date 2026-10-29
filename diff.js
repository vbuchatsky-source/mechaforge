// MechaForge – Challenge 2: Differential
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const QS = new URLSearchParams(location.search);
const LANG = (() => { const q = QS.get('lang'); if (q === 'en' || q === 'he') { localStorage.setItem('mf_lang', q); return q; } return localStorage.getItem('mf_lang') || 'he'; })();
const EN = LANG === 'en', L = (h, e) => EN ? e : h, $ = id => document.getElementById(id);
document.documentElement.lang = LANG; document.documentElement.dir = EN ? 'ltr' : 'rtl';
const P = window.MF_PARTS, nm = k => EN ? P[k][2] : P[k][1];
const ORDER = ['dcase', 'side', 'spider', 'crown', 'pinion', 'axle'], BAD = ['solid', 'spur', 'worm'], PAL = [...ORDER, ...BAD];
const RATIOS = [[34, 10], [41, 10], [45, 9], [39, 7], [43, 6]];
const SUB = { dcase: L('מחזיק את הלוויינים', 'holds the spiders'), side: L('לצירי הגלגלים', 'to the wheel shafts'), spider: L('מהירות שונה לכל גלגל', 'different wheel speeds'), crown: L('גלגל גדול, מאט', 'big gear, slows down'), pinion: L('מסובב את הכתר', 'turns the crown'), axle: L('ציר לכל גלגל', 'a shaft per wheel'), solid: L('מוט אחד לשני גלגלים', 'one bar for both wheels'), spur: L('גלגלים ישרים', 'straight gears'), worm: L('מאט פי 40', 'slows 40×') };
const WHY_BAD = { solid: L('ציר קשיח: בסיבוב גלגל אחד נגרר ומחליק.', 'Solid axle: in a turn a wheel scrubs.'), spur: L('גלגלים ישרים לא מסובבים בפינה של 90 מעלות.', 'Straight gears cannot turn a 90° corner.'), worm: L('בורג אינסופי: איטי מדי ומבזבז חצי מהכוח.', 'Worm: far too slow and wastes half the power.') };
// ---------- three ----------
const R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b1e23);
scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(R), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.4)); const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(6, 10, 8); scene.add(key);
const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 300); cam.position.set(8, 6.5, 11);
const ctl = new OrbitControls(cam, R.domElement); ctl.enableDamping = true; ctl.target.set(0, 0, 0.6);
const grid = new THREE.GridHelper(30, 30, 0x30343a, 0x25282d); grid.position.y = -1.6; scene.add(grid);
const CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const M = {
  steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c9cf, metalness: 1, roughness: 0.28 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x4a5058, metalness: 0.8, roughness: 0.45 }),
  brass: new THREE.MeshPhysicalMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.32 }),
  orange: new THREE.MeshPhysicalMaterial({ color: 0xff8a3a, metalness: 0.6, roughness: 0.35 }),
  tyre: new THREE.MeshPhysicalMaterial({ color: 0x1d1f22, metalness: 0, roughness: 0.9 }),
  bad: new THREE.MeshPhysicalMaterial({ color: 0xe5484d, metalness: 0.5, roughness: 0.4 }),
  caseM: new THREE.MeshPhysicalMaterial({ color: 0x7d858f, metalness: 0.9, roughness: 0.42, side: THREE.DoubleSide }) };
function gearShape(z, m) { const r = z * m / 2, ra = r + m, rf = r - 1.25 * m, pts = [];
  for (let i = 0; i < z; i++) { const a = i / z * Math.PI * 2, p = Math.PI * 2 / z; for (const [rr, aa] of [[rf, a - p * 0.5], [rf, a - p * 0.27], [ra, a - p * 0.13], [ra, a + p * 0.13], [rf, a + p * 0.27]]) pts.push(new THREE.Vector2(Math.cos(aa) * rr, Math.sin(aa) * rr)); }
  return pts; }
function gear(z, m, w, cone, mat) { const sh = new THREE.Shape(gearShape(z, m)); const h = new THREE.Path(); h.absarc(0, 0, Math.max(m * 1.5, z * m * 0.14), 0, Math.PI * 2, true); sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, steps: cone ? 6 : 1, curveSegments: 4 }); g.translate(0, 0, -w / 2);
  if (cone) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 - (p.getZ(i) / w + 0.5) * cone; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i)); } }
  g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
const cyl = (r, l, mat, s = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, s), mat);
// part groups
const G = {}, spin = {};
function mk(k) { const g = new THREE.Group(); g.visible = false; scene.add(g); G[k] = g; return g; }
{ const g = mk('dcase'); const sh = new THREE.Mesh(new THREE.SphereGeometry(1.15, 40, 24), M.caseM); sh.scale.set(0.95, 1, 1); g.add(sh); spin.caseG = g; M.caseM.clippingPlanes = [];
  const pin = cyl(0.08, 2.1, M.dark, 12); g.add(pin); }
{ const g = mk('side'); spin.side = []; for (const s of [1, -1]) { const o = new THREE.Group(); o.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; o.position.x = s * 0.62; const q = gear(16, 0.1, 0.32, 0.4, M.steel); o.add(q); g.add(o); spin.side.push([q, s]); } }
{ const g = mk('spider'); spin.sp = []; for (const s of [1, -1]) { const o = new THREE.Group(); o.rotation.x = s > 0 ? Math.PI / 2 : -Math.PI / 2; o.position.y = s * 0.62; const q = gear(10, 0.1, 0.3, 0.4, M.brass); o.add(q); g.add(o); spin.sp.push([q, s]); } }
{ const g = mk('crown'); const o = new THREE.Group(); o.rotation.y = -Math.PI / 2; o.position.x = 1.25; const q = gear(40, 0.1, 0.35, 0.3, M.steel); o.add(q); g.add(o); spin.crown = q; }
{ const g = mk('pinion'); const o = new THREE.Group(); o.position.set(0.8, 0, 2.25); o.rotation.y = Math.PI; const q = gear(10, 0.1, 0.4, 0.4, M.orange); o.add(q);
  const sh = cyl(0.1, 3, M.dark, 14); sh.rotation.x = Math.PI / 2; sh.position.set(0.8, 0, 3.8); const mot = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.2), M.dark); mot.position.set(0.8, 0, 5.6); g.add(o, sh, mot); spin.pin = q; spin.pinSh = sh; }
function wheel(x) { const w = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.32, 18, 40), M.tyre); t.rotation.y = Math.PI / 2; const hub = cyl(0.5, 0.3, M.steel, 6); hub.rotation.z = Math.PI / 2; w.add(t, hub); w.position.x = x; return w; }
{ const g = mk('axle'); spin.ax = []; for (const s of [1, -1]) { const a = new THREE.Group(); const b = cyl(0.11, 3.2, M.steel, 14); b.rotation.z = Math.PI / 2; b.position.x = s * 2.3; a.add(b, wheel(s * 4.1)); g.add(a); spin.ax.push([a, s]); } }
{ const g = mk('solid'); const a = new THREE.Group(); const b = cyl(0.14, 8.2, M.bad, 14); b.rotation.z = Math.PI / 2; a.add(b, wheel(4.1), wheel(-4.1)); g.add(a); spin.solid = a; }
{ const g = mk('spur'); const a = gear(30, 0.1, 0.4, 0, M.bad); a.position.set(1.2, 0, 0); a.rotation.y = Math.PI / 2; const b = gear(12, 0.1, 0.4, 0, M.bad); b.rotation.y = Math.PI / 2; b.position.set(1.2, 2.1, 0); g.add(a, b); }
{ const g = mk('worm'); const w = cyl(0.3, 2.6, M.bad, 20); w.rotation.x = Math.PI / 2; w.position.set(1.25, 2.1, 0.6); g.add(w); }
const ghostMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.18, depthWrite: false });
// ---------- state ----------
let MODE = 'learn', placed = [], XRAY = false, SEC = false, AUTOX = true, scen = 'straight', running = false, LSD = false, ri = 2;
const prog = JSON.parse(localStorage.getItem('mf_prog_c2') || '{}');
const saveProg = () => localStorage.setItem('mf_prog_c2', JSON.stringify(prog));
// ---------- UI ----------
function toast(msg, bad, part) { const t = $('toast'); t.textContent = msg; if (part) { const b = document.createElement('button'); b.className = 'twhy'; b.textContent = L('❓ למה? הסבר', '❓ Why? Explain'); b.onclick = e => { e.stopPropagation(); window.mfPartWhy(part); t.className = ''; }; t.appendChild(b); }
  t.className = 'show' + (bad ? ' bad' : '') + (part ? ' act' : ''); clearTimeout(t._h); t._h = setTimeout(() => t.className = '', part ? 7000 : 2600); }
$('palT').textContent = L('ספריית חלקים', 'Parts library');
for (const k of PAL) { const el = document.createElement('div'); el.className = 'pitem'; el.dataset.t = k;
  const n = nm(k).replace(/\s*\(([^)]+)\)$/, '<small class="en2">$1</small>');
  el.innerHTML = `<div class="dot${BAD.includes(k) ? ' bad' : ''}"></div><div style="flex:1"><div class="n">${n}</div><div class="s">${SUB[k]}</div></div><button class="pwhy" title="${L('מה זה?', 'What is it?')}">?</button>`;
  el.querySelector('.pwhy').addEventListener('click', e => { e.stopPropagation(); window.mfPartWhy(k); });
  el.addEventListener('click', () => add(k)); $('palList').appendChild(el); }
const sel = $('ratio'); RATIOS.forEach(([c, p], i) => { const o = document.createElement('option'); o.value = i; o.textContent = L(`כתר ${c} / פיניון ${p} (פי ${(c / p).toFixed(1)})`, `crown ${c} / pinion ${p} (${(c / p).toFixed(1)}×)`); sel.appendChild(o); }); sel.value = ri;
sel.onchange = () => { ri = +sel.value; stats(); }; $('lsd').onchange = e => { LSD = e.target.checked; stats(); }; $('lsdL').textContent = L('דיפרנציאל מוגבל החלקה (LSD)', 'Limited-slip diff (LSD)');
const spd = i => 339.3 / (RATIOS[i][0] / RATIOS[i][1]), trq = i => 200 * RATIOS[i][0] / RATIOS[i][1] * 0.96;
function stats() { $('stats').innerHTML = `<span>${L('מהירות מרבית', 'Top speed')} <b>${spd(ri).toFixed(0)} ${L('קמ״ש', 'km/h')}</b></span><span>${L('כוח בגלגלים', 'Wheel force')} <b>${trq(ri).toFixed(0)} N·m</b></span><span>${L('חלקים', 'Parts')} <b>${placed.length}/6</b></span>`; }
function card(k) { const c = $('learnCard'); if (MODE !== 'learn' || !k) { c.classList.remove('show'); return; }
  const p = P[k]; c.innerHTML = `<div class="lh">${L('שלב', 'Step')} ${ORDER.indexOf(k) + 1}/6 · ${nm(k)}</div><p>${window.mfGloss ? window.mfGloss(L(p[3], p[4])) : L(p[3], p[4])} ${L(p[5], p[6])}</p><button class="ghost sm" id="lcWhy">🧊 ${L('דגם תלת-ממד', '3D model')}</button>`; c.classList.add('show'); $('lcWhy').onclick = () => window.mfPartWhy(k); }
function hint() { const nx = ORDER.find(k => !placed.includes(k)); $('hint').textContent = nx ? L(`השלב הבא: ${nm(nx)} – לחץ עליו בספרייה`, `Next: ${nm(nx)} – click it in the library`) : L('כל החלקים במקום! בחר האטה ולחץ "הרץ בדיקה".', 'All parts placed! Pick a slow-down and press "Run test".');
  document.querySelectorAll('.pitem').forEach(e => { e.classList.toggle('done', placed.includes(e.dataset.t)); e.classList.toggle('tutHi', MODE === 'learn' && e.dataset.t === nx); }); }
function add(k) { if (running) return; if (placed.includes(k)) { toast(L('כבר במקום', 'Already placed')); return; }
  if (BAD.includes(k)) { if (MODE === 'learn') { toast(WHY_BAD[k], true, k); return; } }
  else if (MODE === 'learn') { const nx = ORDER.find(x => !placed.includes(x)); if (k !== nx) { toast(L(`עוד לא. קודם: ${nm(nx)}`, `Not yet – first: ${nm(nx)}`), true); return; } }
  if (k === 'solid' && placed.includes('axle') || k === 'axle' && placed.includes('solid')) { toast(L('אי אפשר גם ציר קשיח וגם צירים נפרדים', 'Cannot have both a solid axle and axle shafts'), true); return; }
  placed.push(k); G[k].visible = true; pop(G[k]); toast(L(`${nm(k)} הותקן ✓`, `${nm(k)} installed ✓`)); card(k); hint(); stats(); }
function pop(g) { g.scale.setScalar(0.6); g.userData.t = 0; }
function clear() { placed = []; for (const k in G) G[k].visible = false; running = false; card(null); hint(); stats(); $('scnLbl').textContent = ''; }
function setMode(m) { MODE = m; document.querySelectorAll('.mbtn').forEach(b => b.classList.toggle('on', b.dataset.m === m)); clear();
  $('modeTip').textContent = { learn: L('למידה: בונים לפי הסדר, עם הסבר לכל חלק', 'Learn: build in order with an explanation per part'), practice: L('תרגול: נסו גם חלקים שגויים ותראו מה קורה', 'Practice: try wrong parts too and see what happens'), test: L('מבחן: בלי רמזים. בונים, בוחרים האטה ומריצים', 'Test: no hints. Build, pick a slow-down, run') }[m];
  $('hint').style.display = m === 'test' ? 'none' : ''; }
document.querySelectorAll('.mbtn').forEach(b => b.onclick = () => setMode(b.dataset.m));
for (const [id, lbl] of [['mL', L('📘 למידה', '📘 Learn')], ['mP', L('🛠 תרגול', '🛠 Practice')], ['mT', L('🏁 מבחן', '🏁 Test')]]) $(id).textContent = lbl;
$('bX').textContent = 'X-RAY'; $('bSec').textContent = L('חתך', 'Section'); $('bAX').textContent = L('X-RAY אוטומטי', 'Auto X-RAY'); $('bAX').classList.add('on');
$('bX').onclick = () => { XRAY = !XRAY; $('bX').classList.toggle('on', XRAY); };
$('bSec').onclick = () => { SEC = !SEC; $('bSec').classList.toggle('on', SEC); M.caseM.clippingPlanes = SEC ? [CLIP] : []; M.caseM.needsUpdate = true; };
$('bAX').onclick = () => { AUTOX = !AUTOX; $('bAX').classList.toggle('on', AUTOX); };
$('bLang').textContent = EN ? 'עב' : 'EN'; $('bLang').onclick = () => { localStorage.setItem('mf_lang', EN ? 'he' : 'en'); location.search = ''; };
$('bExp').textContent = L('💡 הסבר', '💡 Explain'); $('bExp').onclick = () => { const nx = ORDER.find(k => !placed.includes(k)) || placed[placed.length - 1] || 'dcase'; window.mfPartWhy(nx); };
$('bClear').textContent = L('נקה', 'Clear'); $('bClear').onclick = clear;
$('bRun').textContent = L('▶ הרץ בדיקה', '▶ Run test'); $('bRun').onclick = run;
const SC = { straight: L('ישר', 'Straight'), turn: L('סיבוב', 'Turn'), ice: L('גלגל על קרח', 'One wheel on ice') };
document.querySelectorAll('.sbtn').forEach(b => { b.textContent = SC[b.dataset.s]; b.onclick = () => { scen = b.dataset.s; document.querySelectorAll('.sbtn').forEach(x => x.classList.toggle('on', x === b)); running = true; scnText(); }; });
$('sTitle').textContent = L('אתגר 2: דיפרנציאל (Differential)', 'Challenge 2: Differential');
$('sTag').textContent = L('בנו דיפרנציאל שנותן לכל גלגל להסתובב במהירות משלו', 'Build a differential that lets each wheel turn at its own speed');
$('bPlay').textContent = L('התחל', 'Start'); $('bPlay').onclick = () => { $('start').classList.remove('show'); brief(); };
function brief() { $('briefCard').innerHTML = `<h2>${L('המשימה', 'The task')}</h2><p class="sub">${L('מכונית חשמלית קטנה. המנוע מסתובב 3,000 פעם בדקה בכוח 200 N·m. הגלגלים בקוטר 60 ס״מ.', 'A small electric car. Motor: 3,000 turns a minute at 200 N·m. Wheels 60 cm across.')}</p>
  <ul><li>${L('בנו את 6 החלקים של הדיפרנציאל', 'Build the 6 differential parts')}</li><li>${L('מהירות מרבית 50 עד 70 קמ״ש', 'Top speed 50 to 70 km/h')}</li><li>${L('כוח בגלגלים לפחות 900 N·m', 'Wheel force at least 900 N·m')}</li><li>${L('לעבור סיבוב בלי שגלגל נגרר', 'Pass a turn without a wheel scrubbing')}</li><li>⭐ ${L('בונוס: לעבור גם קרח (LSD), ומהירות 55 עד 62 קמ״ש', 'Bonus: pass the ice too (LSD), and speed 55 to 62 km/h')}</li></ul>
  <button class="primary" id="bGo">${L('יאללה!', "Let's go!")}</button>`; $('brief').classList.add('show'); $('bGo').onclick = () => $('brief').classList.remove('show'); }
$('bBrief').textContent = L('📋 משימה', '📋 Task'); $('bBrief').onclick = brief;
function scnText() { const ok = placed.includes('spider') && placed.includes('side') && placed.includes('axle');
  const t = { straight: L('ישר: שני הגלגלים באותה מהירות. גלגלי הלוויין עומדים.', 'Straight: both wheels equal; spiders still.'),
    turn: placed.includes('solid') ? L('סיבוב עם ציר קשיח: הגלגל הפנימי נגרר ומחליק! ✗', 'Turn with a solid axle: the inner wheel scrubs! ✗') : L('סיבוב: החיצוני מהר יותר, הפנימי לאט יותר. גלגלי הלוויין מסתובבים.', 'Turn: outer faster, inner slower – the spiders spin.'),
    ice: placed.includes('solid') ? L('קרח עם ציר קשיח: נוסע, אבל בסיבובים נגרר.', 'Ice with a solid axle: it moves, but scrubs in turns.') : LSD ? L('קרח עם LSD: הדסקיות שולחות כוח לגלגל עם האחיזה – נוסעים! ✓', 'Ice with LSD: plates send force to the gripping wheel – moving! ✓') : L('קרח בלי LSD: הגלגל על הקרח מסתובב מהר, השני עומד. תקועים! ✗', 'Ice without LSD: the ice wheel spins, the other stops. Stuck! ✗') }[scen];
  $('scnLbl').textContent = ok || placed.includes('solid') ? t : L('חסרים חלקים כדי לראות את התנועה', 'Parts are missing to show the motion'); }
function run() { if (running && $('result').classList.contains('show')) return;
  const bad = placed.filter(k => BAD.includes(k)), miss = ORDER.filter(k => !placed.includes(k) && !(k === 'axle' && placed.includes('solid')));
  const ck = [
    { ok: !miss.length && !bad.length, t: L('כל 6 החלקים הנכונים במקום', 'All 6 correct parts in place'), v: bad.length ? bad.map(nm).join(', ') : miss.length ? L('חסר: ', 'Missing: ') + miss.map(nm).join(', ') : '' },
    { ok: spd(ri) >= 50 && spd(ri) <= 70, t: L('מהירות מרבית 50 עד 70 קמ״ש', 'Top speed 50 to 70 km/h'), v: spd(ri).toFixed(0) + L(' קמ״ש', ' km/h') },
    { ok: trq(ri) >= 900, t: L('כוח בגלגלים לפחות 900 N·m', 'Wheel force at least 900 N·m'), v: trq(ri).toFixed(0) + ' N·m' },
    { ok: !placed.includes('solid') && placed.includes('spider'), t: L('עובר סיבוב בלי גרירה', 'Passes a turn without scrubbing'), v: placed.includes('solid') ? L('ציר קשיח נגרר', 'solid axle scrubs') : '' } ];
  const pass = ck.every(c => c.ok), stars = pass ? 1 + (LSD ? 1 : 0) + (spd(ri) >= 55 && spd(ri) <= 62 ? 1 : 0) : 0;
  let fail = '';
  if (placed.includes('solid')) fail = L('ציר קשיח: בסיבוב הגלגל החיצוני צריך לעבור יותר דרך. עם מוט אחד הם חייבים להסתובב אותו דבר, אז גלגל אחד נגרר.', 'Solid axle: in a turn the outer wheel must travel further; with one bar both turn the same, so one scrubs.');
  else if (placed.includes('spur')) fail = L('גלגלים ישרים: המנוע שוכב לאורך המכונית, והגלגלים לרוחב. גלגלים ישרים לא מסובבים בפינה.', 'Spur gears: the motor lies along the car, the wheels across; straight gears cannot turn the corner.');
  else if (placed.includes('worm')) fail = L('בורג אינסופי: מאט פי 40, המכונית מגיעה רק לבערך 8 קמ״ש, וחצי מהכוח הופך לחום.', 'Worm drive: slows 40×, the car reaches only about 8 km/h and half the power becomes heat.');
  else if (spd(ri) > 70) fail = L('האטה קטנה מדי: מהיר, אבל אין מספיק כוח לעלייה.', 'Too little slow-down: fast but not enough force for hills.');
  else if (spd(ri) < 50) fail = L('האטה גדולה מדי: חזק, אבל איטי מדי.', 'Too much slow-down: strong but too slow.');
  if (MODE === 'test' && pass) { prog.best = Math.max(prog.best || 0, stars); prog.badge = true; saveProg(); }
  if (pass) { prog.passed = true; saveProg(); }
  $('resCard').innerHTML = `<h2>${pass ? L('עבר! ', 'Passed! ') + '⭐'.repeat(stars) : L('לא עבר', 'Not passed')}</h2>${MODE === 'test' && pass ? `<p class="badge2">🏅 ${L('תג: מהנדס דיפרנציאל (Differential Engineer)', 'Badge: Differential Engineer')}</p>` : ''}
   <ul class="cks">${ck.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✗'} ${c.t}${c.v ? ` <small>(${c.v})</small>` : ''}</li>`).join('')}</ul>
   ${fail ? `<p class="why2">${fail}</p>` : ''}${pass && !LSD ? `<p class="sub">⭐ ${L('טיפ: הוסיפו LSD כדי לעבור גם קרח', 'Tip: add LSD to pass the ice too')}</p>` : ''}
   <div class="row"><button class="ghost" id="rIce">❄ ${L('ראו את מבחן הקרח', 'See the ice test')}</button><button class="ghost" id="rTurn">↪ ${L('ראו את הסיבוב', 'See the turn')}</button><button class="primary" id="rOk">${L('סגור', 'Close')}</button></div>`;
  $('result').classList.add('show'); running = true; scen = 'turn'; scnText();
  $('rOk').onclick = () => $('result').classList.remove('show');
  $('rIce').onclick = () => { $('result').classList.remove('show'); scen = 'ice'; scnText(); };
  $('rTurn').onclick = () => { $('result').classList.remove('show'); scen = 'turn'; scnText(); };
  window.__c2last = { pass, stars, ck }; }
// ---------- loop ----------
let wc = 0, dl = 0, dr = 0, tPrev = performance.now();
function resize() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
function frame(now) { const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
  for (const k in G) { const g = G[k]; if (g.userData.t !== undefined && g.userData.t < 1) { g.userData.t += dt * 3; g.scale.setScalar(0.6 + 0.4 * Math.min(1, g.userData.t)); } }
  const xr = XRAY || (AUTOX && running); M.caseM.transparent = xr; M.caseM.opacity = xr ? 0.18 : 1; M.caseM.depthWrite = !xr;
  if (running) { const w = 2.2; wc += w * dt; let d = 0;
    if (scen === 'turn') d = 0.35 * w; if (scen === 'ice') d = LSD ? 0.25 * w : w;
    if (placed.includes('solid')) d = 0;
    dl += (w + d) * dt; dr += (w - d) * dt;
    if (spin.caseG) G.dcase.rotation.x = wc; G.spider.rotation.x = wc; G.crown.rotation.x = wc; spin.pin.rotation.z = wc * 4;
    spin.side.forEach(([q, s]) => q.rotation.z = s > 0 ? -dl : dr);
    spin.ax[0][0].rotation.x = dl; spin.ax[1][0].rotation.x = dr; spin.solid.rotation.x = wc;
    spin.sp.forEach(([q, s]) => q.rotation.z += s * d * dt * 1.6);
    const shake = placed.includes('solid') && scen === 'turn' ? Math.sin(now / 30) * 0.03 : 0; G.solid.position.y = shake; }
  ctl.update(); R.render(scene, cam); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
setMode('learn'); stats(); hint();
if (QS.get('demo') === 'all') { $('start').classList.remove('show'); ORDER.forEach(add); }
window.__c2 = { add, run, setMode, placed: () => placed, setRatio: i => { ri = i; sel.value = i; stats(); }, setLSD: v => { LSD = v; $('lsd').checked = v; }, scen: s => { scen = s; running = true; scnText(); } };

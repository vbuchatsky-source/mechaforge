// MechaForge – generic challenge engine (challenges \u20663–6\u2069). Config module: body[data-cfg]
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const C = (await import('./' + document.body.dataset.cfg)).default;
const QS = new URLSearchParams(location.search);
const LANG = (() => { const q = QS.get('lang'); if (q === 'en' || q === 'he') { localStorage.setItem('mf_lang', q); return q; } return localStorage.getItem('mf_lang') || 'he'; })();
const EN = LANG === 'en', L = (h, e) => EN ? e : h, T = a => a ? (EN ? a[1] : a[0]) : '', $ = id => document.getElementById(id);
document.documentElement.lang = LANG; document.documentElement.dir = EN ? 'ltr' : 'rtl';
const P = window.MF_PARTS, nm = k => EN ? P[k][2] : P[k][1];
const ORDER = C.ORDER, BAD = C.BAD, PAL = [...ORDER, ...BAD], N = ORDER.length;
// ---------- three ----------
const R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b1e23);
scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(R), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.4)); const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(6, 10, 8); scene.add(key);
const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 300); cam.position.set(...(C.cam || [8, 6.5, 11]));
const ctl = new OrbitControls(cam, R.domElement); ctl.enableDamping = true; ctl.target.set(...(C.target || [0, 0, 0]));
const grid = new THREE.GridHelper(30, 30, 0x30343a, 0x25282d); grid.position.y = C.gridY ?? -1.6; scene.add(grid);
const CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const M = {
  steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c9cf, metalness: 1, roughness: 0.28 }),
  alu: new THREE.MeshPhysicalMaterial({ color: 0xa9afb7, metalness: 0.92, roughness: 0.4 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x4a5058, metalness: 0.8, roughness: 0.45 }),
  brass: new THREE.MeshPhysicalMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.32 }),
  orange: new THREE.MeshPhysicalMaterial({ color: 0xff8a3a, metalness: 0.6, roughness: 0.35 }),
  spring: new THREE.MeshPhysicalMaterial({ color: 0xd8b35a, metalness: 1, roughness: 0.3 }),
  rubber: new THREE.MeshPhysicalMaterial({ color: 0x1d1f22, metalness: 0, roughness: 0.9 }),
  bad: new THREE.MeshPhysicalMaterial({ color: 0xe5484d, metalness: 0.5, roughness: 0.4 }),
  caseM: new THREE.MeshPhysicalMaterial({ color: 0x7d858f, metalness: 0.9, roughness: 0.42, side: THREE.DoubleSide }) };
function gearShape(z, m, inner) { const r = z * m / 2, ra = inner ? r - m : r + m, rf = inner ? r + 1.25 * m : r - 1.25 * m, pts = [];
  for (let i = 0; i < z; i++) { const a = i / z * Math.PI * 2, p = Math.PI * 2 / z; for (const [rr, aa] of [[rf, a - p * 0.5], [rf, a - p * 0.27], [ra, a - p * 0.13], [ra, a + p * 0.13], [rf, a + p * 0.27]]) pts.push(new THREE.Vector2(Math.cos(aa) * rr, Math.sin(aa) * rr)); }
  return pts; }
function gear(z, m, w, cone, mat, bore) { const sh = new THREE.Shape(gearShape(z, m)); const h = new THREE.Path(); h.absarc(0, 0, bore || Math.max(m * 1.5, z * m * 0.14), 0, Math.PI * 2, true); sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, steps: cone ? 6 : 1, curveSegments: 4 }); g.translate(0, 0, -w / 2);
  if (cone) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 - (p.getZ(i) / w + 0.5) * cone; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i)); } }
  g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
const cyl = (r, l, mat, s = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, s), mat);
const box = (x, y, z, mat) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat);
function helix(r, pitch, turns, tube, mat) { const pts = []; for (let i = 0; i <= turns * 32; i++) { const a = i / 32 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, i / 32 * pitch, Math.sin(a) * r)); }
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 32, tube, 8, false), mat); }
// link between two points (bar), returns {g, set(p,q)}
function bar(w, t, mat) { const g = new THREE.Group(), b = box(1, w, t, mat); g.add(b); return { g, set(p, q) { const dx = q.x - p.x, dy = q.y - p.y, Ln = Math.hypot(dx, dy); g.position.set(p.x, p.y, g.position.z); g.rotation.z = Math.atan2(dy, dx); b.scale.x = Ln; b.position.x = Ln / 2; } }; }
const G = {}, S = {};
function mk(k) { const g = new THREE.Group(); g.visible = false; scene.add(g); G[k] = g; return g; }
const ctx = { THREE, M, G, S, mk, gear, cyl, box, helix, bar, scene, L };
C.build(ctx);
// ---------- state ----------
const st = { mode: 'learn', placed: [], scen: C.scenDef || Object.keys(C.scen)[0], running: false, flag: false, pi: C.param.def, t: 0,
  has: k => st.placed.includes(k), get p() { return C.param.opts[st.pi][2]; } };
let XRAY = false, SEC = false, AUTOX = true;
const prog = JSON.parse(localStorage.getItem(C.progKey) || '{}');
const saveProg = () => localStorage.setItem(C.progKey, JSON.stringify(prog));
// ---------- UI ----------
function toast(msg, bad, part) { const t = $('toast'); t.textContent = msg; if (part) { const b = document.createElement('button'); b.className = 'twhy'; b.textContent = L('❓ למה? הסבר', '❓ Why? Explain'); b.onclick = e => { e.stopPropagation(); window.mfPartWhy(part); t.className = ''; }; t.appendChild(b); }
  t.className = 'show' + (bad ? ' bad' : '') + (part ? ' act' : ''); clearTimeout(t._h); t._h = setTimeout(() => t.className = '', part ? 7000 : 2600); }
$('palT').textContent = L('ספריית חלקים', 'Parts library');
for (const k of PAL) { const el = document.createElement('div'); el.className = 'pitem'; el.dataset.t = k;
  const n = nm(k).replace(/\s*\(([^)]+)\)$/, '<small class="en2">$1</small>');
  el.innerHTML = `<div class="dot${BAD.includes(k) ? ' bad' : ''}"></div><div style="flex:1;min-width:0"><div class="n">${n}</div><div class="s">${T(C.SUB[k])}</div></div><button class="pwhy" title="${L('מה זה?', 'What is it?')}">?</button>`;
  el.querySelector('.pwhy').addEventListener('click', e => { e.stopPropagation(); window.mfPartWhy(k); });
  el.addEventListener('click', () => add(k)); $('palList').appendChild(el); }
const sel = $('ratio'); C.param.opts.forEach((o, i) => { const op = document.createElement('option'); op.value = i; op.textContent = T(C.param.label) + ': ' + (EN ? o[1] : o[0]); sel.appendChild(op); }); sel.value = st.pi;
sel.onchange = () => { st.pi = +sel.value; stats(); scnText(); };
if (C.flag) { $('lsdL').textContent = T(C.flag); $('lsd').onchange = e => { st.flag = e.target.checked; stats(); scnText(); }; } else $('lsd').parentNode.style.display = 'none';
function stats() { $('stats').innerHTML = C.stats(st).map(([l, v]) => `<span>${T(l)} <b>${v}</b></span>`).join('') + `<span>${L('חלקים', 'Parts')} <b>${st.placed.length}/${N}</b></span>`; }
function card(k) { const c = $('learnCard'); if (st.mode !== 'learn' || !k) { c.classList.remove('show'); return; }
  const p = P[k], g = s => window.mfGloss ? window.mfGloss(window.mfAuto ? window.mfAuto(s) : s) : s;
  c.innerHTML = `<div class="lh">${L('שלב', 'Step')} ${ORDER.indexOf(k) + 1}/${N} · ${nm(k)}</div><p>${g(L(p[3], p[4]))} ${L(p[5], p[6])}</p><button class="ghost sm" id="lcWhy">🧊 ${L('דגם תלת-ממד', '3D model')}</button>`; c.classList.add('show'); $('lcWhy').onclick = () => window.mfPartWhy(k); }
function hint() { const nx = ORDER.find(k => !st.has(k)); $('hint').textContent = nx ? L(`השלב הבא: ${nm(nx)} – לחץ עליו בספרייה`, `Next: ${nm(nx)} – click it in the library`) : L('כל החלקים במקום! בחר הגדרה ולחץ "הרץ בדיקה".', 'All parts placed! Pick a setting and press "Run test".');
  document.querySelectorAll('.pitem').forEach(e => { e.classList.toggle('done', st.has(e.dataset.t)); e.classList.toggle('tutHi', st.mode === 'learn' && e.dataset.t === nx); }); }
function add(k) { if (st.has(k)) { toast(L('כבר במקום', 'Already placed')); return; }
  if (BAD.includes(k)) { if (st.mode === 'learn') { toast(T(C.WHY_BAD[k]), true, k); return; } }
  else if (st.mode === 'learn') { const nx = ORDER.find(x => !st.has(x)); if (k !== nx) { toast(L(`עוד לא. קודם: ${nm(nx)}`, `Not yet – first: ${nm(nx)}`), true); return; } }
  for (const [a, b] of C.excl || []) if ((k === a && st.has(b)) || (k === b && st.has(a))) { toast(L(`אי אפשר גם ${nm(a)} וגם ${nm(b)}`, `Cannot have both ${nm(a)} and ${nm(b)}`), true); return; }
  st.placed.push(k); G[k].visible = true; G[k].scale.setScalar(0.6); G[k].userData.t = 0; toast(L(`${nm(k)} הותקן ✓`, `${nm(k)} installed ✓`)); card(k); hint(); stats(); scnText(); }
function clear() { st.placed = []; for (const k in G) G[k].visible = false; st.running = false; card(null); hint(); stats(); $('scnLbl').textContent = ''; }
function setMode(m) { st.mode = m; document.querySelectorAll('.mbtn').forEach(b => b.classList.toggle('on', b.dataset.m === m)); clear();
  $('modeTip').textContent = { learn: L('למידה: בונים לפי הסדר, עם הסבר לכל חלק', 'Learn: build in order with an explanation per part'), practice: L('תרגול: נסו גם חלקים שגויים ותראו מה קורה', 'Practice: try wrong parts too and see what happens'), test: L('מבחן: בלי רמזים. בונים, בוחרים הגדרה ומריצים', 'Test: no hints. Build, pick a setting, run') }[m];
  $('hint').style.display = m === 'test' ? 'none' : ''; }
document.querySelectorAll('.mbtn').forEach(b => b.onclick = () => setMode(b.dataset.m));
for (const [id, lbl] of [['mL', L('📘 למידה', '📘 Learn')], ['mP', L('🛠 תרגול', '🛠 Practice')], ['mT', L('🏁 מבחן', '🏁 Test')]]) $(id).textContent = lbl;
$('bX').textContent = 'X-RAY'; $('bSec').textContent = L('חתך', 'Section'); $('bAX').textContent = L('X-RAY אוטומטי', 'Auto X-RAY'); $('bAX').classList.add('on');
$('bX').onclick = () => { XRAY = !XRAY; $('bX').classList.toggle('on', XRAY); };
$('bSec').onclick = () => { SEC = !SEC; $('bSec').classList.toggle('on', SEC); M.caseM.clippingPlanes = SEC ? [CLIP] : []; M.caseM.needsUpdate = true; };
$('bAX').onclick = () => { AUTOX = !AUTOX; $('bAX').classList.toggle('on', AUTOX); };
$('bLang').textContent = EN ? 'עב' : 'EN'; $('bLang').onclick = () => { localStorage.setItem('mf_lang', EN ? 'he' : 'en'); location.search = ''; };
$('bExp').textContent = L('💡 הסבר', '💡 Explain'); $('bExp').onclick = () => { const nx = ORDER.find(k => !st.has(k)) || st.placed[st.placed.length - 1] || ORDER[0]; window.mfPartWhy(nx); };
$('bClear').textContent = L('נקה', 'Clear'); $('bClear').onclick = clear;
$('bRun').textContent = L('▶ הרץ בדיקה', '▶ Run test'); $('bRun').onclick = run;
const sb = document.querySelector('.sbtns'); sb.innerHTML = Object.entries(C.scen).map(([k, v]) => `<button class="tb sbtn${k === st.scen ? ' on' : ''}" data-s="${k}">${T(v)}</button>`).join('');
sb.querySelectorAll('.sbtn').forEach(b => b.onclick = () => { st.scen = b.dataset.s; sb.querySelectorAll('.sbtn').forEach(x => x.classList.toggle('on', x === b)); st.running = true; scnText(); });
$('sTitle').textContent = T(C.title); $('sTag').textContent = T(C.tag); document.title = 'MechaForge – ' + C.title[1];
$('bPlay').textContent = L('התחל', 'Start'); $('bPlay').onclick = () => { $('start').classList.remove('show'); brief(); };
function brief() { $('briefCard').innerHTML = `<h2>${L('המשימה', 'The task')}</h2><p class="sub">${T(C.brief.task)}</p><ul>${C.brief.goals.map(g => `<li>${T(g)}</li>`).join('')}</ul><button class="primary" id="bGo">${L('יאללה!', "Let's go!")}</button>`; $('brief').classList.add('show'); $('bGo').onclick = () => $('brief').classList.remove('show'); }
$('bBrief').textContent = L('📋 משימה', '📋 Task'); $('bBrief').onclick = brief;
function scnText() { $('scnLbl').textContent = st.running || st.placed.length ? T(C.text(st)) : ''; }
function run() { const bad = st.placed.filter(k => BAD.includes(k)), miss = ORDER.filter(k => !st.has(k) && !(C.alt && C.alt[k] && st.has(C.alt[k])));
  const ev = C.evaluate(st);
  const ck = [{ ok: !miss.length && !bad.length, t: L(`כל ${N} החלקים הנכונים במקום`, `All ${N} correct parts in place`), v: bad.length ? bad.map(nm).join(', ') : miss.length ? L('חסר: ', 'Missing: ') + miss.map(nm).join(', ') : '' }, ...ev.ck.map(c => ({ ok: c.ok, t: T(c.t), v: c.v || '' }))];
  const pass = ck.every(c => c.ok), stars = pass ? 1 + ev.bonus.filter(Boolean).length : 0;
  const fail = bad.length ? T(C.WHY_BAD[bad[0]]) : T(ev.fail);
  if (st.mode === 'test' && pass) { prog.best = Math.max(prog.best || 0, stars); prog.badge = true; }
  if (pass) prog.passed = true; saveProg();
  $('resCard').innerHTML = `<h2>${pass ? L('עבר! ', 'Passed! ') + '⭐'.repeat(stars) : L('לא עבר', 'Not passed')}</h2>${st.mode === 'test' && pass ? `<p class="badge2">🏅 ${L('תג: ', 'Badge: ')}${T(C.badge)}</p>` : ''}
   <ul class="cks">${ck.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✗'} ${c.t}${c.v ? ` <small>(${c.v})</small>` : ''}</li>`).join('')}</ul>
   ${fail ? `<p class="why2">${fail}</p>` : ''}${pass && stars < 3 ? `<p class="sub">⭐ ${T(C.tip)}</p>` : ''}
   <div class="row">${Object.entries(C.scen).map(([k, v]) => `<button class="ghost rsc" data-s="${k}">▶ ${T(v)}</button>`).join('')}<button class="primary" id="rOk">${L('סגור', 'Close')}</button></div>`;
  $('result').classList.add('show'); st.running = true; scnText();
  $('rOk').onclick = () => $('result').classList.remove('show');
  document.querySelectorAll('.rsc').forEach(b => b.onclick = () => { $('result').classList.remove('show'); st.scen = b.dataset.s; sb.querySelectorAll('.sbtn').forEach(x => x.classList.toggle('on', x.dataset.s === st.scen)); scnText(); });
  window.__mlast = { pass, stars, ck }; }
// ---------- loop ----------
let tPrev = performance.now();
function resize() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
function frame(now) { const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
  for (const k in G) { const g = G[k]; if (g.userData.t !== undefined && g.userData.t < 1) { g.userData.t += dt * 3; g.scale.setScalar(0.6 + 0.4 * Math.min(1, g.userData.t)); } }
  const xr = XRAY || (AUTOX && (st.running || st.placed.some(k => (C.inner || []).includes(k)))); M.caseM.transparent = xr; M.caseM.opacity = xr ? 0.26 : 1; M.caseM.depthWrite = !xr; M.caseM.roughness = xr ? 0.15 : 0.42;
  st.t += dt; C.animate(st, dt, ctx); if (C.live) { const s = C.live(st); if (s) $('live').innerHTML = s; }
  ctl.update(); R.render(scene, cam); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
setMode('learn'); stats(); hint();
if (QS.get('demo') === 'all') { $('start').classList.remove('show'); ORDER.forEach(add); }
window.__m = { add, run, setMode, st, setParam: i => { st.pi = i; sel.value = i; stats(); }, setFlag: v => { st.flag = v; $('lsd').checked = v; }, scen: s => { st.scen = s; st.running = true; scnText(); } };
window.MF_SCENE_PART = k => { if (!G[k]) return null; const c = G[k].clone(true); c.visible = true; c.scale.setScalar(1); c.position.set(0, 0, 0);
  const gm = M.caseM.clone(); gm.transparent = true; gm.opacity = 0.35; gm.depthWrite = false; c.traverse(o => { if (o.material === M.caseM) o.material = gm; });
  return { g: c, d: 8, tick: t => { c.rotation.y = Math.sin(t * 0.5) * 0.4; } }; };

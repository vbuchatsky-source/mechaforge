import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------------- i18n ----------------
const QS = new URLSearchParams(location.search);
const LANG = (() => { const q = QS.get('lang'); if (q === 'en' || q === 'he') { localStorage.setItem('mf_lang', q); return q; } return localStorage.getItem('mf_lang') || 'he'; })();
const EN = LANG === 'en';
const L = (he, en) => EN ? en : he;
if (EN) { document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr'; }
const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function switchLang() { const u = new URL(location.href); u.searchParams.set('lang', EN ? 'he' : 'en'); localStorage.setItem('mf_lang', EN ? 'he' : 'en'); location.href = u.toString(); }
let HQ = QS.has('hq') ? true : localStorage.getItem('mf_hq') === '1';
const MOBILE = matchMedia('(max-width:760px)').matches || /Mobi|Android/i.test(navigator.userAgent);

// ---------------- renderer ----------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environmentIntensity = 0.9;
const camera = new THREE.PerspectiveCamera(MOBILE ? 46 : 36, 1, 0.1, 200);
camera.position.set(9, 9, 17);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 5; controls.maxDistance = 45;
controls.target.set(0, 2.4, 0);
const hemi = new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.35); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(6, 16, 9); key.castShadow = true;
Object.assign(key.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12, near: 1, far: 50 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4; scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb6d6, 0.9); rim.position.set(-10, 6, -12); scene.add(rim);
function applyQuality() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, HQ ? 2 : (MOBILE ? 1.25 : 1.5)));
  key.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024); if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
  for (const b of [$('bHQ'), $('bHQ2')]) b.classList.toggle('on', HQ);
  resize();
}
function resize() { if (typeof frame === 'function' && mode === 'build' && camGoal === null && false) {} const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); drawGraph(); }
addEventListener('resize', resize);

// ---------------- materials ----------------
const M = {
  steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c9cf, metalness: 1, roughness: 0.28 }),
  alu: new THREE.MeshPhysicalMaterial({ color: 0xa9afb7, metalness: 0.92, roughness: 0.4, clearcoat: 0.15 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x3b3f45, metalness: 0.75, roughness: 0.42 }),
  black: new THREE.MeshPhysicalMaterial({ color: 0x1d2024, metalness: 0.3, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
  plastic: new THREE.MeshPhysicalMaterial({ color: 0x2a2d32, metalness: 0, roughness: 0.62, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x17181a, metalness: 0, roughness: 0.92 }),
  brass: new THREE.MeshPhysicalMaterial({ color: 0x9c8a6a, metalness: 1, roughness: 0.35 }),
  copper: new THREE.MeshPhysicalMaterial({ color: 0x8d6a55, metalness: 1, roughness: 0.4 }),
  mdf: new THREE.MeshStandardMaterial({ color: 0x55585d, metalness: 0.1, roughness: 0.8 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff6a00, emissiveIntensity: 0.6, roughness: 0.4 }),
};
const EDGE = new THREE.LineBasicMaterial({ color: 0x08090b, transparent: true, opacity: 0.55 });
function mesh(geo, mat, edges = 30) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (edges) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, edges), EDGE); e.raycast = () => {}; m.add(e); }
  return m;
}
// cylinder along X
function cylX(r1, r2, len, seg = 48, mat = M.steel, edges = 30) { const g = new THREE.CylinderGeometry(r2, r1, len, seg); g.rotateZ(-Math.PI / 2); return mesh(g, mat, edges); }
function rbox(w, h, d, r, mat) { return mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat, 0); }
// lathe along X from profile [[x,r],...]
function latheX(pts, mat, seg = 64, edges = 0) { const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[1], p[0])), seg); g.rotateZ(-Math.PI / 2); return mesh(g, mat, edges); }

// ---------------- gears ----------------
function toothRing(z, rTip, rRoot, tipW = 0.22, baseW = 0.56) {
  const pts = [], p = Math.PI * 2 / z, F = 4;
  for (let i = 0; i < z; i++) {
    const a = i * p, wb = p * baseW / 2, wt = p * tipW / 2;
    const P = (r, ang) => pts.push(new THREE.Vector2(Math.cos(ang) * r, Math.sin(ang) * r));
    P(rRoot, a - p / 2 + 0.001);
    for (let k = 0; k <= F; k++) { const t = k / F, s = Math.sin(t * Math.PI / 2); P(lerp(rRoot, rTip, t), a - lerp(wb, wt, s)); }
    P(rTip, a);
    for (let k = F; k >= 0; k--) { const t = k / F, s = Math.sin(t * Math.PI / 2); P(lerp(rRoot, rTip, t), a + lerp(wb, wt, s)); }
  }
  return pts;
}
function extrudeX(shape, depth, bevel = 0.02) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -(depth - 2 * bevel) / 2); g.rotateY(Math.PI / 2); return g;
}
function circlePath(r, hole = false) { const p = new THREE.Path(); p.absarc(0, 0, r, 0, Math.PI * 2, hole); return p; }
function spurGear(z, m, w, bore, mat = M.steel) {
  const s = new THREE.Shape(toothRing(z, m * z / 2 + m, m * z / 2 - 1.2 * m));
  if (bore) s.holes.push(circlePath(bore, true));
  return mesh(extrudeX(s, w, Math.min(0.02, m * 0.25)), mat, 35);
}
function ringGear(z, m, w, rOut, mat = M.dark) {
  const s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const hp = new THREE.Path(toothRing(z, m * z / 2 - m, m * z / 2 + 1.2 * m, 0.42, 0.78).reverse()); s.holes.push(hp);
  return mesh(extrudeX(s, w, 0.025), mat, 35);
}

// ---------------- part catalogue ----------------
const AX = 2.6, GAP = 0.5, X0 = -9.5;
const PT = {
  motor: { he: 'מנוע DC 18V', en: 'DC motor 18 V', she: '18,000 סל"ד · 1.6 N·m', sen: '18,000 rpm · 1.6 N·m', kind: 'src', len: 3.2, r: 1.4, w0: 18000, Ts: 1.6, Is: 80, I0: 1.5, cost: 14, mass: 310 },
  hobby: { he: 'מנוע צעצוע 3V', en: 'Hobby motor 3 V', she: '12,000 סל"ד · 0.06 N·m', sen: '12,000 rpm · 0.06 N·m', kind: 'src', len: 2.0, r: 0.8, w0: 12000, Ts: 0.06, Is: 2.2, I0: 0.2, cost: 3, mass: 40 },
  stepper: { he: 'מנוע צעד NEMA17', en: 'Stepper NEMA 17', she: '1,200 סל"ד · 0.45 N·m', sen: '1,200 rpm · 0.45 N·m', kind: 'src', len: 2.2, r: 1.2, w0: 1200, Ts: 0.45, Is: 4, I0: 1.0, cost: 18, mass: 350 },
  pl4: { he: 'שלב פלנטרי 4:1', en: 'Planetary stage 4:1', she: 'יחס 4 · נצילות 95%', sen: 'ratio 4 · η 95%', kind: 'gear', len: 1.1, r: 2.15, i: 4, eta: 0.95, cost: 6, mass: 120, zs: 12, zp: 12, zr: 36, m: 0.09 },
  pl5: { he: 'שלב פלנטרי 5:1', en: 'Planetary stage 5:1', she: 'יחס 5 · נצילות 95%', sen: 'ratio 5 · η 95%', kind: 'gear', len: 1.1, r: 2.15, i: 5, eta: 0.95, cost: 6, mass: 130, zs: 12, zp: 18, zr: 48, m: 0.072 },
  clutch: { he: 'מצמד מומנט', en: 'Torque clutch', she: 'מחליק בעומס יתר', sen: 'slips on overload', kind: 'clutch', len: 1.2, r: 1.6, i: 1, eta: 0.98, cost: 5, mass: 90 },
  worm: { he: 'בורג אינסופי 30:1', en: 'Worm drive 30:1', she: 'יציאה ב-90°', sen: '90° output', kind: 'bad', len: 2.0, r: 1.6, cost: 9, bad: ['יציאה בזווית 90° – הצ\'אק חייב להיות על אותו ציר', '90° output – the chuck must stay on the motor axis'] },
  spur: { he: 'זוג גלגלי שיניים', en: 'Spur gear pair', she: 'מסיט את הציר', sen: 'offsets the axis', kind: 'bad', len: 1.0, r: 1.6, cost: 4, bad: ['מסיט את הציר ב-18 מ"מ – לא נכנס בגוף המברגה', 'Offsets the axis by 18 mm – won\'t fit the drill body'] },
};
const PAL = ['motor', 'pl4', 'pl5', 'clutch', 'worm', 'spur', 'hobby', 'stepper'];

function addPedestal(g, def) {
  const h = AX - def.r - 0.02; if (h < 0.05) return;
  const p = rbox(Math.min(def.len * 0.7, 1.6), h, Math.min(def.r * 1.4, 2.4), 0.06, M.dark); p.position.set(0, -def.r - 0.01 - h / 2 + 0.0, 0);
  p.position.y = -(def.r + 0.01) - h / 2; g.add(p);
  const foot = rbox(Math.min(def.len * 0.9, 2.2), 0.14, Math.min(def.r * 1.7, 3), 0.04, M.dark); foot.position.y = -AX + 0.07; g.add(foot);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = cylX(0.07, 0.07, 0.06, 6, M.steel, 0); b.rotation.z = Math.PI / 2; b.position.set(sx * Math.min(def.len * 0.9, 2.2) * 0.36, -AX + 0.17, sz * Math.min(def.r * 1.7, 3) * 0.38); g.add(b); }
}
function boltRing(g, n, R, x, r = 0.07) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + Math.PI / n; const b = cylX(r, r, 0.08, 6, M.steel, 0); b.position.set(x, Math.cos(a) * R, Math.sin(a) * R); g.add(b); } }

function buildPart(type, opts = {}) {
  const d = PT[type], g = new THREE.Group(); g.userData = { type, spin: [] };
  const L2 = d.len / 2, sp = g.userData.spin;
  const outShaft = (r = 0.18) => { const s = cylX(r, r, GAP - 0.04, 24, M.steel); s.position.x = L2 + (GAP - 0.04) / 2; g.add(s); return s; };
  if (d.kind === 'src') {
    if (type === 'stepper') {
      const body = rbox(d.len * 0.8, 2.3, 2.3, 0.12, M.black); g.add(body);
      for (const x of [-1, 1]) { const c = rbox(0.2, 2.4, 2.4, 0.05, M.alu); c.position.x = x * (d.len * 0.4 + 0.1); g.add(c); }
      boltRing(g, 4, 1.25, d.len / 2 - 0.05, 0.08);
    } else {
      const can = latheX([[-L2, 0], [-L2, d.r * 0.9], [-L2 + 0.08, d.r], [L2 - 0.6, d.r], [L2 - 0.52, d.r * 0.96], [L2 - 0.52, 0]], M.steel, 64);
      g.add(can); can.userData.house = 1;
      const bell = latheX([[L2 - 0.6, 0], [L2 - 0.6, d.r * 0.97], [L2 - 0.1, d.r * 0.92], [L2, d.r * 0.55], [L2, 0]], M.black, 64); g.add(bell); bell.userData.house = 1;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const v = rbox(0.7, 0.07, 0.24, 0.03, M.rubber); v.position.set(-L2 + 0.9, Math.cos(a) * d.r * 0.995, Math.sin(a) * d.r * 0.995); v.rotation.x = -a; g.add(v); }
      for (const z of [-0.4, 0.4]) { const t = rbox(0.1, 0.5, 0.18, 0.02, M.brass); t.position.set(-L2 - 0.05, 0, z * d.r); g.add(t); }
      const band = cylX(d.r + 0.01, d.r + 0.01, 0.08, 64, M.dark, 0); band.position.x = L2 - 1.2; g.add(band);
    }
    const sh = outShaft(type === 'hobby' ? 0.08 : 0.18); sp.push({ o: sh, f: 1 });
  } else if (d.kind === 'gear') {
    const w = 0.55, ring = ringGear(d.zr, d.m, w, d.r); g.add(ring); ring.userData.house = 1;
    const back = latheX([[-L2, 0.22], [-L2, d.r], [-L2 + 0.25, d.r], [-L2 + 0.25, 0.22]], M.dark, 64, 30); g.add(back); back.userData.house = 1;
    ring.position.x = -L2 + 0.25 + w / 2 + 0.01;
    boltRing(g, 6, d.r - 0.17, -L2 - 0.03);
    const sun = spurGear(d.zs, d.m, w, 0.1); sun.position.x = ring.position.x; g.add(sun); sp.push({ o: sun, f: 1 });
    const inS = cylX(0.18, 0.18, 0.3, 24, M.steel, 0); inS.position.x = -L2 + 0.12; sun.add(inS);
    const carrier = new THREE.Group(); carrier.position.x = ring.position.x; g.add(carrier);
    const rp = d.m * (d.zs + d.zp) / 2, pp = Math.PI * 2 / d.zp; g.userData.planets = [];
    for (let k = 0; k < 3; k++) {
      const phi = k * Math.PI * 2 / 3, pg = spurGear(d.zp, d.m, w * 0.96, 0.09, M.alu);
      const piv = new THREE.Group(); piv.position.set(0, Math.cos(phi) * rp, Math.sin(phi) * rp); carrier.add(piv); piv.add(pg);
      const th0 = phi + Math.PI - pp / 2; pg.userData.th0 = th0; pg.rotation.x = th0; g.userData.planets.push(pg);
      const pin = cylX(0.085, 0.085, w + 0.2, 16, M.steel, 0); pin.position.x = 0.1; piv.add(pin);
      const arm = rbox(0.14, rp + 0.1, 0.34, 0.05, M.steel); arm.position.set(w / 2 + 0.11, Math.cos(phi) * rp / 2, Math.sin(phi) * rp / 2); arm.rotation.x = -phi; carrier.add(arm);
    }
    const hub = cylX(0.36, 0.36, 0.16, 32, M.steel); hub.position.x = w / 2 + 0.11; carrier.add(hub);
    const os = cylX(0.18, 0.18, L2 - (ring.position.x + w / 2 + 0.19) + GAP - 0.04, 24, M.steel); os.position.x = w / 2 + 0.19 + (L2 - (ring.position.x + w / 2 + 0.19) + GAP - 0.04) / 2; carrier.add(os);
    g.userData.carrier = carrier; g.userData.sun = sun;
    // front retainer ring (open so the gears stay visible)
    const fr = latheX([[ring.position.x + w / 2 + 0.02, d.r - 0.28], [ring.position.x + w / 2 + 0.02, d.r], [ring.position.x + w / 2 + 0.12, d.r], [ring.position.x + w / 2 + 0.12, d.r - 0.28]], M.alu, 64, 30); g.add(fr); fr.userData.house = 1;
  } else if (d.kind === 'clutch') {
    const back = latheX([[-L2, 0.2], [-L2, d.r], [-L2 + 0.2, d.r], [-L2 + 0.2, 0.2]], M.dark, 64, 30); g.add(back); back.userData.house = 1;
    const rot = new THREE.Group(); g.add(rot); sp.push({ o: rot, f: 1 });
    const plate = latheX([[-L2 + 0.24, 0.2], [-L2 + 0.24, 1.25], [-L2 + 0.4, 1.25], [-L2 + 0.4, 0.2]], M.steel, 64, 30); rot.add(plate);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), M.steel); b.castShadow = true; b.position.set(-L2 + 0.51, Math.cos(a) * 0.95, Math.sin(a) * 0.95); rot.add(b); }
    const plate2 = latheX([[-L2 + 0.62, 0.2], [-L2 + 0.62, 1.25], [-L2 + 0.74, 1.25], [-L2 + 0.74, 0.2]], M.alu, 64, 30); g.add(plate2); plate2.userData.house = 1;
    const helix = new THREE.Curve(); helix.getPoint = (t, v = new THREE.Vector3()) => v.set(-L2 + 0.78 + t * 0.32, Math.cos(t * Math.PI * 12) * 0.13, Math.sin(t * Math.PI * 12) * 0.13);
    const sg = new THREE.TubeGeometry(helix, 120, 0.03, 6, false);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const s = new THREE.Mesh(sg, M.steel); s.castShadow = true; s.position.set(0, Math.cos(a) * 0.95, Math.sin(a) * 0.95); g.add(s); }
    const nut = latheX([[L2 - 0.08, 0.2], [L2 - 0.08, 1.35], [L2, 1.35], [L2, 0.2]], M.dark, 64, 30); g.add(nut);
    const ring = latheX([[-L2 + 0.2, d.r - 0.12], [-L2 + 0.2, d.r], [L2 - 0.08, d.r], [L2 - 0.08, d.r - 0.12]], M.dark, 64, 30); ring.material = M.dark; g.add(ring);
    ring.visible = !opts.open; ring.userData.cover = true;
    const sh = outShaft(); sp.push({ o: sh, f: 1 }); const core = cylX(0.18, 0.18, d.len, 24, M.steel, 0); g.add(core); sp.push({ o: core, f: 1 });
    // ring is semi-closed: show a window
    ring.visible = false;
    const strapGeo = new THREE.TorusGeometry(d.r - 0.06, 0.06, 8, 64); strapGeo.rotateY(Math.PI / 2);
    for (const x of [-L2 + 0.2, L2 - 0.1]) { const t = mesh(strapGeo, M.dark, 0); t.position.x = x; g.add(t); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; const rod = cylX(0.05, 0.05, d.len - 0.3, 8, M.steel, 0); rod.position.set(0.05, Math.cos(a) * (d.r - 0.06), Math.sin(a) * (d.r - 0.06)); g.add(rod); }
  } else if (type === 'worm') {
    const box = rbox(d.len, 2.2, 2.2, 0.15, M.dark); g.add(box);
    const o = cylX(0.18, 0.18, 1.0, 24, M.steel); o.rotation.set(0, Math.PI / 2, 0); o.position.set(0, 0, 1.55); g.add(o);
  } else if (type === 'spur') {
    const a = spurGear(18, 0.09, 0.5, 0.1); g.add(a); const b = spurGear(22, 0.09, 0.5, 0.1); b.position.y = -1.8; g.add(b);
  }
  if (!opts.noPed) addPedestal(g, d);
  g.traverse(o => { if (o.isMesh) o.userData.part = g; });
  const hm = []; g.traverse(o => { if (o.userData.house) o.traverse(m => { if ((m.isMesh || m.isLineSegments) && !hm.includes(m)) { m.material = m.material.clone(); hm.push(m); } }); }); g.userData.house = hm; g.userData.ha = 1;
  return g;
}

// fixed end: chuck + bit + brake dyno
function buildChuck() {
  const g = new THREE.Group(), rot = new THREE.Group(); g.add(rot);
  const body = latheX([[0, 0.25], [0, 0.95], [0.1, 1.05], [1.1, 1.05], [1.2, 0.95], [1.5, 0.7], [1.75, 0.45], [1.75, 0.25]], M.black, 48); rot.add(body);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const r = rbox(0.9, 0.05, 0.1, 0.02, M.rubber); r.position.set(0.6, Math.cos(a) * 1.05, Math.sin(a) * 1.05); r.rotation.x = -a; rot.add(r); }
  const sleeve = latheX([[1.2, 0.5], [1.2, 0.96], [1.55, 0.7], [1.55, 0.5]], M.steel, 48); rot.add(sleeve);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; const j = rbox(0.3, 0.12, 0.14, 0.03, M.steel); j.position.set(1.72, Math.cos(a) * 0.22, Math.sin(a) * 0.2); j.rotation.x = -a; rot.add(j); }
  const bit = cylX(0.13, 0.13, 1.9, 6, M.steel); bit.position.x = 2.75; rot.add(bit);
  const tip = cylX(0.13, 0.03, 0.25, 6, M.steel); tip.position.x = 3.82; rot.add(tip);
  // dynamometer (brake) as test load
  const dyn = new THREE.Group(); dyn.position.x = 4.0; g.add(dyn);
  const sock = cylX(0.3, 0.3, 0.6, 32, M.steel); sock.position.x = 0.3; rot.add(sock); sock.position.x = 4.3;
  const disc = latheX([[0.62, 0.3], [0.62, 1.7], [0.82, 1.7], [0.82, 0.3]], M.steel, 72, 30); rot.add(disc); disc.position.x = 4.0;
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const h = cylX(0.1, 0.1, 0.22, 12, M.dark, 0); h.position.set(4.72, Math.cos(a) * 1.15, Math.sin(a) * 1.15); rot.add(h); }
  const cal = rbox(0.55, 0.8, 0.7, 0.08, M.dark); cal.position.set(4.72, 1.55, 0); g.add(cal);
  const calS = rbox(0.3, 0.3, 0.3, 0.05, M.alu); calS.position.set(4.72, 2.08, 0); g.add(calS);
  const ped = { len: 1.4, r: 1.72 }; const pg = new THREE.Group(); pg.position.x = 4.72; addPedestal(pg, ped); g.add(pg);
  const ped2 = { len: 1.8, r: 1.08 }; const pg2 = new THREE.Group(); pg2.position.x = 0.6; addPedestal(pg2, ped2); g.add(pg2);
  g.userData = { rot, len: 5.6 };
  return g;
}

// ---------------- bench scene ----------------
const bench = new THREE.Group(); scene.add(bench);
const plate = rbox(27, 0.3, 7, 0.08, M.dark.clone()); plate.position.y = -0.15; plate.castShadow = false; bench.add(plate);
for (const z of [-2, 0, 2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(26.6, 0.02, 0.22), M.black.clone()); s.position.set(0, 0.002, z); bench.add(s); }
const shadowGround = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.45 }));
shadowGround.rotation.x = -Math.PI / 2; shadowGround.position.y = -0.3; shadowGround.receiveShadow = true; scene.add(shadowGround);
const grid = new THREE.GridHelper(120, 120, 0x343941, 0x262a30); grid.position.y = -0.299; grid.material.transparent = true; grid.material.opacity = 0.7; scene.add(grid);
const chuck = buildChuck(); chuck.position.y = AX; bench.add(chuck);
const sockets = new THREE.Group(); bench.add(sockets);
const sockGeo = new THREE.TorusGeometry(1.0, 0.045, 10, 64); sockGeo.rotateY(Math.PI / 2);
const selRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 96).rotateY(Math.PI / 2), M.accent); selRing.visible = false; bench.add(selRing);

const chain = []; // {type, g, x}
let clutchTc = 12;
function chainLen() { return chain.reduce((s, c) => s + PT[c.type].len + GAP, 0); }
function layout(snap = false) {
  let x = X0;
  for (const c of chain) { const d = PT[c.type]; c.tx = x + d.len / 2; if (snap || c.x === undefined) c.x = c.tx; x += d.len + GAP; }
  chuck.userData.tx = Math.max(x, X0 + 3.6); if (snap || chuck.userData.x === undefined) chuck.userData.x = chuck.userData.tx;
  buildSockets(); updateStats();
}
function socketPositions() {
  const s = []; let x = X0;
  if (!chain.length) return [{ i: 0, x: X0 + 1 }];
  s.push({ i: 0, x: X0 - GAP / 2 - 0.3 });
  chain.forEach((c, k) => { x += PT[c.type].len + GAP; s.push({ i: k + 1, x: x - GAP / 2 }); });
  return s;
}
let sockMeshes = [];
function buildSockets() { sockets.clear(); sockMeshes = socketPositions().map(s => { const m = new THREE.Mesh(sockGeo, new THREE.MeshBasicMaterial({ color: 0x8a919b, transparent: true, opacity: 0.35 })); m.position.set(s.x, AX, 0); m.userData.s = s; sockets.add(m); return m; }); sockets.visible = false; }

function canInsert(type, idx) {
  const d = PT[type];
  if (d.bad) return L(d.bad[0], d.bad[1]);
  const hasMotor = chain.length && PT[chain[0].type].kind === 'src';
  if (d.kind === 'src') { if (idx !== 0) return L('המנוע חייב להיות בתחילת השרשרת', 'The motor must be at the start of the chain'); return null; }
  if (!hasMotor) return L('קודם מניחים מנוע – הוא מקור התנועה', 'Place a motor first – it is the motion source');
  if (idx === 0) return L('לא ניתן לפני המנוע', 'Cannot go before the motor');
  if (chain.length >= 5) return L('מקסימום 5 רכיבים', 'Max 5 components');
  return null;
}
function insertPart(type, idx) {
  const d = PT[type];
  if (d.kind === 'src' && chain.length && PT[chain[0].type].kind === 'src') { bench.remove(chain[0].g); chain.shift(); }
  const g = buildPart(type); bench.add(g);
  const c = { type, g }; chain.splice(idx, 0, c);
  layout(); c.x = c.tx; g.position.set(c.x, AX + 2.5, 0); c.drop = 0;
  select(c); invalidateRun(); frame(); toast(L('חובר ✓', 'Connected ✓'));
}
function removePart(c) { const k = chain.indexOf(c); if (k < 0) return; bench.remove(c.g); chain.splice(k, 1); if (k === 0 && chain.length && PT[chain[0].type].kind !== 'src') { /* keep, will be invalid */ } select(null); layout(); invalidateRun(); }

// ---------------- palette with thumbnails ----------------
function thumbs() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  const s = new THREE.Scene(); s.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(r), 0.04).texture;
  s.add(new THREE.DirectionalLight(0xffffff, 2).translateX(3).translateY(5).translateZ(4));
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); const out = {};
  for (const t of PAL) {
    const g = buildPart(t, { noPed: true }); s.add(g); const box = new THREE.Box3().setFromObject(g); const sz = box.getSize(new THREE.Vector3()).length();
    const ctr = box.getCenter(new THREE.Vector3()); cam.position.copy(ctr).add(new THREE.Vector3(1.1, 0.7, 1.0).normalize().multiplyScalar(sz * 1.75)); cam.lookAt(ctr);
    r.render(s, cam); out[t] = c.toDataURL(); s.remove(g);
  }
  r.dispose(); return out;
}
const TH = thumbs();
const palList = $('palList');
for (const t of PAL) {
  const d = PT[t], el = document.createElement('div'); el.className = 'pitem'; el.dataset.t = t;
  el.innerHTML = `<img src="${TH[t]}" alt=""><div><div class="n">${EN ? d.en : d.he}</div><div class="s">${EN ? d.sen : d.she}</div></div>`;
  palList.appendChild(el);
  el.addEventListener('pointerdown', e => startDrag(e, t));
}

// ---------------- drag & drop ----------------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let drag = null;
function proj(v) { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; }
function startDrag(e, t) {
  if (mode !== 'build') return; e.preventDefault();
  drag = { t, sx: e.clientX, sy: e.clientY, moved: false, sock: null, why: null };
  addEventListener('pointermove', onDrag); addEventListener('pointerup', endDrag, { once: true });
}
function onDrag(e) {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) { drag.moved = true; sockets.visible = true; }
  if (!drag.moved) return;
  const gh = $('dragGhost'); gh.style.display = 'block'; gh.style.left = e.clientX + 'px'; gh.style.top = e.clientY + 'px';
  let best = null, bd = 1e9;
  for (const m of sockMeshes) { const p = proj(m.position); const dd = Math.hypot(p.x - e.clientX, p.y - e.clientY); if (dd < bd) { bd = dd; best = m; } }
  drag.sock = bd < (TUT ? (MOBILE ? 170 : 230) : (MOBILE ? 110 : 140)) ? best : null;
  if (TUT && TUT.want === drag.t && TUT.idx !== undefined) { const tm = sockMeshes.find(m => m.userData.s.i === TUT.idx); if (tm) drag.sock = tm; }
  drag.why = drag.sock ? canInsert(drag.t, drag.sock.userData.s.i) : null;
  for (const m of sockMeshes) { m.material.color.set(m === drag.sock ? (drag.why ? 0xe5484d : 0x3fb97a) : 0x8a919b); m.material.opacity = m === drag.sock ? 0.95 : 0.3; m.scale.setScalar(m === drag.sock ? 1.15 : 1); }
  const d = PT[drag.t];
  gh.className = drag.sock ? (drag.why ? 'bad' : 'good') : '';
  gh.textContent = drag.sock ? (drag.why || L('שחרר לחיבור', 'Release to connect')) : (EN ? d.en : d.he);
}
function endDrag() {
  removeEventListener('pointermove', onDrag); $('dragGhost').style.display = 'none'; sockets.visible = false;
  if (!drag) return; const d = drag; drag = null;
  let idx, why;
  if (!d.moved) { idx = PT[d.t].kind === 'src' ? 0 : chain.length; why = canInsert(d.t, idx); }
  else { if (!d.sock) { if (TUT && TUT.want === d.t) { idx = TUT.idx; why = null; insertPart(d.t, idx); } return; } idx = d.sock.userData.s.i; why = d.why; }
  if (why) { toast(why, true); acadReject(d.t, why); return; }
  insertPart(d.t, idx);
}

// ---------------- selection / inspector ----------------
let sel = null;
function select(c) {
  sel = c; const el = $('insp');
  if (!c) { el.style.display = 'none'; selRing.visible = false; return; }
  const d = PT[c.type]; el.style.display = 'block';
  const rows = [];
  if (d.kind === 'src') rows.push([L('סל"ד ללא עומס', 'No-load speed'), d.w0.toLocaleString() + ' rpm'], [L('מומנט עצירה', 'Stall torque'), d.Ts + ' N·m'], [L('זרם עצירה', 'Stall current'), d.Is + ' A']);
  if (d.kind === 'gear') rows.push([L('יחס', 'Ratio'), d.i + ':1'], [L('שיניים שמש/לוויין/טבעת', 'Teeth sun/planet/ring'), `${d.zs}/${d.zp}/${d.zr}`], [L('נצילות', 'Efficiency'), d.eta * 100 + '%']);
  if (d.kind === 'clutch') rows.push([L('מומנט החלקה', 'Slip torque'), `<span id="tcv">${clutchTc}</span> N·m`]);
  rows.push([L('עלות', 'Cost'), '$' + d.cost], [L('משקל', 'Mass'), d.mass + ' g']);
  el.innerHTML = `<h5>${EN ? d.en : d.he}</h5><table>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>` +
    (d.kind === 'clutch' ? `<input type="range" id="tcr" min="4" max="20" step="1" value="${clutchTc}">` : '') +
    `<div class="row"><button class="ghost" id="bDel">${L('הסר', 'Remove')}</button><button class="ghost" id="bDes">✕</button></div>`;
  $('bDel').onclick = () => removePart(c); $('bDes').onclick = () => select(null);
  if ($('tcr')) $('tcr').oninput = e => { clutchTc = +e.target.value; $('tcv').textContent = clutchTc; invalidateRun(); };
  selRing.visible = true; selRing.scale.setScalar(d.r + 0.12);
}
let downP = null;
canvas.addEventListener('pointerdown', e => { downP = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', e => {
  if (!downP || Math.hypot(e.clientX - downP.x, e.clientY - downP.y) > 6 || mode !== 'build') return;
  ndc.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(chain.map(c => c.g), true); const h = hits.find(h => h.object.userData.part);
  select(h ? chain.find(c => c.g === h.object.userData.part) : null);
});

// ---------------- physics model ----------------
function analyse() {
  const src = chain[0] && PT[chain[0].type].kind === 'src' ? PT[chain[0].type] : null;
  let i = 1, eta = 1, clutch = false, cost = 0;
  for (const c of chain) { const d = PT[c.type]; cost += d.cost; if (d.i) i *= d.i; if (d.eta) eta *= d.eta; if (d.kind === 'clutch') clutch = true; }
  return { src, i, eta, clutch, cost, n: chain.length };
}
const LIM = { rpmLo: 500, rpmHi: 1200, tq: 20, I: 50, loadRef: 10 };
function evaluate(a) {
  const ck = [];
  const free = a.src ? a.src.w0 / a.i : 0, tmax = a.src ? a.src.Ts * a.i * a.eta : 0;
  const Kt = a.src ? a.src.Ts / a.src.Is : 1, Tm = LIM.loadRef / (a.i * a.eta), I = a.src ? (Tm >= a.src.Ts ? a.src.Is : a.src.I0 + Tm / Kt) : 0;
  ck.push({ ok: !!a.src, t: L('מקור תנועה: מנוע בתחילת השרשרת', 'Motion source: motor at chain start') });
  ck.push({ ok: free >= LIM.rpmLo && free <= LIM.rpmHi, t: L(`סל"ד ביציאה ללא עומס ${LIM.rpmLo}–${LIM.rpmHi}`, `No-load output ${LIM.rpmLo}–${LIM.rpmHi} rpm`), v: Math.round(free) + ' rpm' });
  ck.push({ ok: tmax >= LIM.tq, t: L(`מומנט מרבי ≥ ${LIM.tq} N·m`, `Max torque ≥ ${LIM.tq} N·m`), v: tmax.toFixed(1) + ' N·m' });
  ck.push({ ok: a.src && I <= LIM.I && Tm < a.src.Ts, t: L(`זרם ב-10 N·m ≤ ${LIM.I} A`, `Current at 10 N·m ≤ ${LIM.I} A`), v: a.src ? I.toFixed(0) + ' A' : '–' });
  const pass = ck.every(c => c.ok);
  let stars = pass ? 1 : 0; const extra = [];
  extra.push({ ok: pass && a.clutch, t: L('★ מצמד מגן על הבורג והמנוע כשהבורג מתיישב', '★ Clutch protects screw & motor when the screw seats') });
  extra.push({ ok: pass && free >= 800 && free <= 1000, t: L('★ סל"ד אופטימלי 800–1000 (מהירות + מומנט)', '★ Sweet-spot speed 800–1000 rpm (speed + torque)') });
  if (pass) stars += extra.filter(e => e.ok).length;
  return { ck, extra, pass, stars, free, tmax, I };
}
function updateStats() {
  const a = analyse();
  $('stats').innerHTML = `<span>${L('יחס', 'Ratio')} <b>${a.i.toFixed(0)}:1</b></span><span>η <b>${(a.eta * 100).toFixed(0)}%</b></span><span>${L('רכיבים', 'Parts')} <b>${a.n}/5</b></span><span>${L('עלות', 'Cost')} <b>$${a.cost}</b></span>`;
  $('bRun').disabled = !a.src || mode !== 'build';
  $('hint').textContent = !chain.length ? L('גרור מנוע מהספרייה אל טבעת החיבור', 'Drag a motor from the library onto the connection ring')
    : a.n === 1 ? L('הוסף תמסורת בין המנוע לצ\'אק כדי להוריד סל"ד ולהעלות מומנט', 'Add a gearbox between motor and chuck: lower rpm, raise torque')
    : L('לחץ "הפעל בדיקה" – או המשך לשפר', 'Press "Run test" – or keep refining');
}

// ---------------- test run (fixed timestep) ----------------
const DT = 1 / 120, T_END = 4.2;
let run = null, lastResult = null;
function invalidateRun() { if (run) return; $('graphs').style.display = 'none'; }
function startRun() {
  const a = analyse(); if (!a.src) return; select(null);
  run = { a, t: 0, wm: 0, wo: 0, data: [], acc: 0, slip: false, stall: false, ang: 0 };
  mode = 'run'; $('graphs').style.display = 'block'; updateStats(); $('bRun').textContent = L('בודק…', 'Testing…');
}
function loadAt(t) { return t < 0.4 ? 0.4 : t < 2.8 ? 1 + 9 * (t - 0.4) / 2.4 : 200; }
function stepRun(r) {
  const { src, i, eta, clutch } = r.a, Kt = src.Ts / src.Is; const t = r.t;
  let Tl = loadAt(t), slip = false;
  if (clutch && Tl > clutchTc) { Tl = clutchTc; slip = true; }
  let Tm = Tl / (i * eta) + 0.02, wmT, Tout = Tl, stall = false;
  if (Tm >= src.Ts) { Tm = src.Ts; wmT = 0; stall = true; Tout = src.Ts * i * eta; } else wmT = src.w0 * (1 - Tm / src.Ts);
  if (t < 0.25) wmT *= t / 0.25;
  r.wm += (wmT - r.wm) * (1 - Math.exp(-DT / 0.05));
  const woT = slip ? 0 : r.wm / i; r.wo += (woT - r.wo) * (1 - Math.exp(-DT / (slip ? 0.02 : 0.05)));
  const I = stall ? src.Is : src.I0 + Tm / Kt;
  r.slip = slip; r.stall = stall; r.cur = I; r.tout = Tout;
  if (Math.round(t / DT) % 4 === 0) r.data.push([t, r.wo, Tout, I]);
  r.t += DT;
}
const VIS = 2 * Math.PI / 60 * 0.012; // visual speed scale
function spinChain(wMotor, dt, wOut) {
  let w = wMotor;
  for (const c of chain) {
    const d = PT[c.type], u = c.g.userData;
    u.a = (u.a || 0) + w * VIS * dt;
    for (const s of u.spin) s.o.rotation.x = u.a;
    if (d.kind === 'gear') {
      const ac = u.a / d.i; u.carrier.rotation.x = ac;
      for (const p of u.planets) p.rotation.x = p.userData.th0 - (u.a - ac) * d.zs / d.zp;
      w = w / d.i;
    }
    if (d.kind === 'clutch' && wOut !== undefined) { u.ao = (u.ao || 0) + wOut * VIS * dt; for (const s of u.spin) if (s.o.isMesh) s.o.rotation.x = u.ao; }
  }
  chuck.userData.ang = (chuck.userData.ang || 0) + (wOut !== undefined ? wOut : w) * VIS * dt; chuck.userData.rot.rotation.x = chuck.userData.ang;
}

// ---------------- graphs ----------------
const gc = $('g'), gx = gc.getContext('2d');
function drawGraph() {
  if (!gc.clientWidth) return; const dpr = Math.min(devicePixelRatio, 2), W = gc.clientWidth, H = gc.clientHeight;
  if (gc.width !== W * dpr) { gc.width = W * dpr; gc.height = H * dpr; }
  gx.setTransform(dpr, 0, 0, dpr, 0, 0); gx.clearRect(0, 0, W, H);
  const data = run ? run.data : (lastResult ? lastResult.data : []);
  const rows = [
    { k: 1, n: L('סל"ד יציאה', 'Output rpm'), max: 1400, band: [LIM.rpmLo, LIM.rpmHi], u: 'rpm' },
    { k: 2, n: L('מומנט יציאה', 'Output torque'), max: 40, lim: LIM.tq, u: 'N·m' },
    { k: 3, n: L('זרם מנוע', 'Motor current'), max: 90, lim: LIM.I, u: 'A', limBad: true }];
  const rh = (H - 8) / 3;
  rows.forEach((r, j) => {
    const y0 = 4 + j * rh, ph = rh - 18, px = 8, pw = W - 16;
    gx.fillStyle = '#8a919b'; gx.font = '11px system-ui'; gx.textAlign = 'left'; gx.fillText(r.n, px, y0 + 11);
    const last = data.length ? data[data.length - 1][r.k] : 0; gx.textAlign = 'right'; gx.fillStyle = '#e3e6ea'; gx.fillText(last.toFixed(r.k === 1 ? 0 : 1) + ' ' + r.u, px + pw, y0 + 11);
    const Y = v => y0 + 15 + ph - clamp(v / r.max) * ph, X = t => px + t / T_END * pw;
    gx.strokeStyle = 'rgba(255,255,255,.07)'; gx.strokeRect(px, y0 + 15, pw, ph);
    if (r.band) { gx.fillStyle = 'rgba(63,185,122,.10)'; gx.fillRect(px, Y(r.band[1]), pw, Y(r.band[0]) - Y(r.band[1])); }
    if (r.lim) { gx.setLineDash([4, 4]); gx.strokeStyle = r.limBad ? 'rgba(229,72,77,.7)' : 'rgba(63,185,122,.7)'; gx.beginPath(); gx.moveTo(px, Y(r.lim)); gx.lineTo(px + pw, Y(r.lim)); gx.stroke(); gx.setLineDash([]); }
    gx.strokeStyle = '#ff7a1a'; gx.lineWidth = 1.6; gx.beginPath(); data.forEach((d, k) => k ? gx.lineTo(X(d[0]), Y(d[r.k])) : gx.moveTo(X(d[0]), Y(d[r.k]))); gx.stroke(); gx.lineWidth = 1;
  });
}

// ---------------- result ----------------
function finishRun() {
  const ev = evaluate(run.a); lastResult = { data: run.data, ev, a: run.a }; run = null; mode = 'build'; $('bRun').textContent = L('הפעל בדיקה', 'Run test'); updateStats(); drawGraph();
  const best = +(localStorage.getItem('mf_l1') || 0); if (ev.stars > best) localStorage.setItem('mf_l1', ev.stars);
  const li = c => `<li><span class="${c.ok ? 'ok' : 'no'}">${c.ok ? '✓' : '✗'}</span> ${c.t}${c.v ? ` — <b>${c.v}</b>` : ''}</li>`;
  $('resCard').innerHTML = `<h2>${ev.pass ? L('המנגנון עובד!', 'Mechanism works!') : L('עוד לא…', 'Not yet…')}</h2>
   <div class="stars">${[1, 2, 3].map(k => `<i class="${ev.stars >= k ? 'on' : ''}">★</i>`).join('')}</div>
   <ul class="chk">${ev.ck.map(li).join('')}${ev.extra.map(li).join('')}</ul>
   <p class="sub">${ev.pass ? (ev.stars < 3 ? L('אפשר לשפר לעוד כוכבים – או לראות איך זה בנוי במציאות.', 'You can improve for more stars – or see how it is built for real.') : L('פתרון מושלם. בוא נראה את המוצר האמיתי.', 'Perfect solution. Let\'s see the real product.')) : hintFor(ev)}</p>
   <div class="row">${ev.pass ? `<button class="ghost" id="bImp">${L('שפר', 'Improve')}</button><button class="primary" id="bRev">${L('גלה את המוצר ▶', 'Reveal product ▶')}</button>` : `<button class="primary" id="bImp">${L('חזרה לבנייה', 'Back to build')}</button>`}</div>`;
  $('result').classList.add('show');
  $('bImp').onclick = () => $('result').classList.remove('show');
  if ($('bRev')) $('bRev').onclick = () => { $('result').classList.remove('show'); startReveal(); };
  acadRunDone(ev);
}
function hintFor(ev) {
  if (!ev.ck[0].ok) return L('רמז: התחל במנוע.', 'Hint: start with a motor.');
  if (ev.free > LIM.rpmHi) return L(`רמז: הסל"ד גבוה מדי. יחס כולל נדרש בערך ${Math.ceil(18000 / LIM.rpmHi)}–${Math.floor(18000 / LIM.rpmLo)}. שלב אחד לא מספיק.`, `Hint: speed too high. You need a total ratio of about ${Math.ceil(18000 / LIM.rpmHi)}–${Math.floor(18000 / LIM.rpmLo)}. One stage isn't enough.`);
  if (ev.free < LIM.rpmLo) return L('רמז: היחס גבוה מדי – המברגה איטית. נסה פחות שלבים או מנוע מהיר יותר.', 'Hint: ratio too high – it is too slow. Fewer stages or a faster motor.');
  return L('רמז: המנוע חלש מדי למומנט הנדרש.', 'Hint: the motor is too weak for the torque.');
}

// ---------------- reveal: real drill driver ----------------
const drill = new THREE.Group(); drill.visible = false; scene.add(drill);
let RV = null;
const S = 0.4;
function fadeable(root) { const mats = []; root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } }); return mats; }
function setOpacity(mats, a) { for (const m of mats) { const tr = a < 0.999; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = a; m.depthWrite = a > 0.5; } }
function buildDrill(types) {
  drill.clear();
  const parts = []; let x = -2.0;
  const add = (g, xpos, name, from) => { g.position.x = xpos; drill.add(g); parts.push({ g, x: xpos, y: g.position.y, name, from, mats: fadeable(g) }); };
  for (const t of types) {
    const d = PT[t]; if (d.bad) continue;
    const g = buildPart(t, { noPed: true }); g.scale.setScalar(S);
    add(g, x + d.len * S / 2, EN ? d.en : d.he, 'x'); g.userData.def = d; x += (d.len + GAP) * S;
  }
  // collar
  const col = new THREE.Group(); const cr = latheX([[0, 0.92], [0, 1.08], [0.38, 1.08], [0.38, 0.72], [0.3, 0.6], [0, 0.6]], M.plastic, 72, 30); col.add(cr);
  for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; const r = rbox(0.3, 0.05, 0.08, 0.02, M.rubber); r.position.set(0.19, Math.cos(a) * 1.09, Math.sin(a) * 1.09); r.rotation.x = -a; col.add(r); }
  const mark = rbox(0.3, 0.06, 0.06, 0.02, M.accent); mark.position.set(0.19, 0, 1.12); mark.rotation.x = Math.PI / 2; col.add(mark);
  add(col, 1.42, L('טבעת כיוון מומנט', 'Torque-setting collar'), 'x');
  const ch = buildChuck(); ch.remove(ch.children.find(c => c !== ch.userData.rot) || new THREE.Object3D());
  for (const c of [...ch.children]) if (c !== ch.userData.rot) ch.remove(c);
  for (const c of [...ch.userData.rot.children]) if (c.position.x > 3.9) ch.userData.rot.remove(c);
  ch.scale.setScalar(0.46); add(ch, 1.84, L('צ\'אק ומקדח-ביט', 'Chuck & bit'), 'x'); drill.userData.chuck = ch;
  // housing: barrel halves + grip
  const prof = [[-2.25, 0], [-2.25, 0.55], [-2.15, 0.85], [-1.95, 1.0], [-1.6, 1.06], [1.1, 1.06], [1.38, 1.02], [1.4, 0.96], [1.4, 0.92], [1.36, 0.92], [-1.9, 0.92], [-2.1, 0.8], [-2.12, 0], ];
  const half = s => { const g = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[1], p[0])), 48, s ? -Math.PI / 2 : Math.PI / 2, Math.PI); g.rotateZ(-Math.PI / 2); return mesh(g, M.black, 40); };
  const near = new THREE.Group(), far = new THREE.Group(); near.add(half(1)); far.add(half(0));
  const gs = new THREE.Shape(); gs.moveTo(-0.95, -0.95); gs.lineTo(0.25, -0.95); gs.quadraticCurveTo(0.45, -1.4, 0.15, -2.2); gs.lineTo(-0.05, -3.4); gs.quadraticCurveTo(-0.1, -3.7, -0.45, -3.7); gs.lineTo(-1.0, -3.7); gs.quadraticCurveTo(-1.35, -3.7, -1.3, -3.4); gs.lineTo(-1.15, -2.0); gs.quadraticCurveTo(-1.05, -1.3, -1.6, -0.97); gs.lineTo(-0.95, -0.95);
  for (const [grp, z0] of [[near, 0], [far, -0.62]]) { const gg = new THREE.ExtrudeGeometry(gs, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3, curveSegments: 16 }); gg.translate(0, 0, z0 + 0.06); grp.add(mesh(gg, M.black, 40)); }
  const rub = new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-1.18, -1.95); s.lineTo(-1.04, -3.35); s.quadraticCurveTo(-1.0, -3.55, -0.75, -3.55); s.lineTo(-0.7, -3.55); s.lineTo(-0.82, -1.95); s.quadraticCurveTo(-1.0, -1.7, -1.18, -1.95); return s; })(), { depth: 1.36, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 });
  rub.translate(-0.1, 0, -0.68); const rubM = mesh(rub, M.rubber, 0); far.add(rubM);
  const trig = rbox(0.28, 0.75, 0.42, 0.1, M.plastic); trig.position.set(0.42, -1.55, 0); far.add(trig);
  const sw = rbox(0.22, 0.2, 1.36, 0.06, M.dark); sw.position.set(-0.2, -1.12, 0); far.add(sw);
  const vent = []; for (let k = 0; k < 5; k++) { const v = rbox(0.09, 0.5, 0.06, 0.03, M.rubber); v.position.set(-1.7 + k * 0.17, 0.2, 1.06); near.add(v); vent.push(v); }
  drill.add(near); drill.add(far);
  // battery
  const bat = new THREE.Group(); const bb = rbox(2.2, 0.85, 1.7, 0.14, M.plastic); bat.add(bb); const bs = rbox(2.24, 0.12, 1.74, 0.05, M.dark); bs.position.y = 0.25; bat.add(bs);
  const lat = rbox(0.4, 0.2, 0.9, 0.05, M.rubber); lat.position.set(0.95, 0.15, 0); bat.add(lat);
  bat.position.set(-0.55, -4.18, 0); drill.add(bat); parts.push({ g: bat, x: -0.55, y: -4.18, name: L('סוללה 18V Li-ion', '18 V Li-ion battery'), from: 'y', mats: fadeable(bat) });
  const motorPart = parts[0];
  drill.userData = { near, far, parts, nearMats: fadeable(near), farMats: fadeable(far), chuck: ch, types };
  drill.position.set(0, 4.6, 0); drill.traverse(o => { if (o.isMesh) o.castShadow = true; });
}
function startReveal() {
  mode = 'reveal'; select(null);
  buildDrill(chain.map(c => c.type));
  bench.visible = false; drill.visible = true; RV = { t: 0 };
  for (const id of ['palette', 'dock', 'graphs', 'hint', 'insp']) $(id).style.display = 'none';
  $('reveal').classList.add('show'); $('rNext').disabled = true;
  controls.target.set(-0.2, 3.6, 0); camera.position.set(4.2, 6.6, 9.6);
  const ev = lastResult.ev, a = lastResult.a;
  RV.caps = [
    [0, L('המנגנון שלך – בתוך מברגה חשמלית אמיתית', 'Your mechanism – inside a real drill driver')],
    [3.2, L('מבט פנימי: מעטפת שקופה', 'Inside view: transparent housing')],
    [5.2, L('הרכבה, חלק אחר חלק', 'Assembly, part by part')],
    [13.5, L(`כך זה בנוי במציאות: מנוע → ${a.i}:1 פלנטרי → מצמד → צ'אק · ${Math.round(ev.free)} סל"ד · ${ev.tmax.toFixed(0)} N·m`, `This is how it's built for real: motor → ${a.i}:1 planetary → clutch → chuck · ${Math.round(ev.free)} rpm · ${ev.tmax.toFixed(0)} N·m`)]];
  RV.labs = drill.userData.parts.map(p => { const e = document.createElement('div'); e.className = 'lab acc'; e.textContent = p.name; e.style.opacity = 0; $('labels').appendChild(e); return e; });
}
function endReveal() {
  RV && RV.labs.forEach(e => e.remove()); RV = null; drill.visible = false; bench.visible = true; mode = 'build';
  $('reveal').classList.remove('show'); for (const id of ['palette', 'dock', 'hint']) $(id).style.display = ''; frame(true);
}
function updateReveal(dt) {
  const R = RV; R.t += dt; const t = R.t, u = drill.userData, P = u.parts, n = P.length;
  const T_FADE = [3.2, 4.4], T_HIDE = [4.4, 5.2], T_AS = 5.4, STEP = 1.0, T_RUN = T_AS + n * STEP + 0.4, T_END2 = T_RUN + 4.5, T_CLOSE = [T_END2, T_END2 + 1.4];
  let shell = 1;
  if (t > T_FADE[0]) shell = lerp(1, 0.12, ease(clamp((t - T_FADE[0]) / (T_FADE[1] - T_FADE[0]))));
  if (t > T_CLOSE[0]) shell = lerp(0.12, 1, ease(clamp((t - T_CLOSE[0]) / (T_CLOSE[1] - T_CLOSE[0]))));
  if (XRAY || SEC) shell = Math.min(shell, 0.14);
  setOpacity(u.nearMats, shell); for (const m of u.nearMats) if (m.emissive) m.emissive.setHex(shell < 0.5 ? 0x0a1016 : 0);
  setOpacity(u.farMats, lerp(0.22, 1, clamp((shell - 0.14) / 0.86)));
  { const cs = shell > 0.6; if (u.cs !== cs) { u.cs = cs; for (const g of [u.near, u.far]) g.traverse(o => { if (o.isMesh) o.castShadow = cs; }); } }
  const running = t < T_HIDE[0] || (t > T_RUN);
  P.forEach((p, k) => {
    let vis = 1, off = 0;
    if (t > T_HIDE[0] && t < T_AS) vis = 1 - ease(clamp((t - T_HIDE[0]) / (T_HIDE[1] - T_HIDE[0])));
    if (t >= T_AS) { const s = clamp((t - (T_AS + k * STEP)) / 0.9); vis = s > 0 ? Math.min(1, s * 3) : 0; off = (1 - ease(s)) * (p.from === 'y' ? -3 : 4); }
    p.g.visible = vis > 0.01; setOpacity(p.mats, vis);
    if (p.from === 'y') p.g.position.y = p.y + off; else p.g.position.x = p.x + off;
    const lab = R.labs[k]; const active = t >= T_AS + k * STEP && t < T_AS + k * STEP + 1.6 && t < T_RUN;
    lab.style.opacity = active ? 1 : 0;
    if (active) { const w = p.g.getWorldPosition(new THREE.Vector3()); w.y += p.from === 'y' ? -0.6 : 1.25; const q = proj(w); lab.style.left = q.x + 'px'; lab.style.top = (p.from === 'y' ? q.y + 40 : q.y) + 'px'; }
  });
  // spin
  const wm = running ? 18000 * 0.85 : 0;
  let w = wm; R.ang = (R.ang || 0);
  for (const p of P) {
    const d = p.g.userData.def; if (!d) continue; const ud = p.g.userData; ud.a = (ud.a || 0) + w * VIS * dt;
    for (const s of ud.spin) s.o.rotation.x = ud.a;
    if (d.kind === 'gear') { const ac = ud.a / d.i; ud.carrier.rotation.x = ac; for (const pl of ud.planets) pl.rotation.x = pl.userData.th0 - (ud.a - ac) * d.zs / d.zp; w /= d.i; }
  }
  u.chuck.userData.ang = (u.chuck.userData.ang || 0) + w * VIS * dt * 6; u.chuck.userData.rot.rotation.x = u.chuck.userData.ang;
  let cap = ''; for (const c of R.caps) if (t >= c[0]) cap = c[1]; $('revCap').textContent = cap;
  // slow orbit
  const asm = t > T_AS - 0.6 && t < T_RUN + 0.6, ang = asm ? 0.12 + Math.sin(t * 0.18) * 0.1 : 0.5 + Math.sin(t * 0.18) * 0.45, dist = MOBILE ? 19 : 11.5; if (!R.user) { camera.position.set(-0.2 + Math.sin(ang) * dist, 6.4 + Math.sin(t * 0.25) * 0.5, Math.cos(ang) * dist); }
  if (t > T_CLOSE[1] + 0.3) { $('rNext').disabled = true; R.done = true; }
}
controls.addEventListener('start', () => { if (RV) RV.user = true; camGoal = null; });

// ---------------- UI wiring ----------------
let mode = 'start';
let camGoal = null;
function frame(instant) {
  const len = chainLen() + 7.5, cx = X0 + len / 2 - 1;
  const vf = camera.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const half = len / 2 + 1.5, dist = Math.max(14, half / Math.tan(Math.min(hf, vf * 1.6) / 2) * (MOBILE ? 0.62 : 0.95));
  const dir = MOBILE ? new THREE.Vector3(0.62, 0.55, 0.56).normalize() : new THREE.Vector3(0.38, 0.42, 0.82).normalize();
  const T = new THREE.Vector3(cx, MOBILE ? 1.2 : 2.0, 0); camGoal = { t: T, p: T.clone().addScaledVector(dir, dist) }; if (instant) { controls.target.copy(camGoal.t); camera.position.copy(camGoal.p); camGoal = null; }
}
function toast(msg, bad) { const t = $('toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 2600); }
function showBrief() {
  $('briefCard').innerHTML = `<p class="sub">${L('אתגר 1 מתוך 10 · קל', 'Challenge 1 of 10 · Easy')}</p><h2>${L('מברגה חשמלית', 'Cordless drill driver')}</h2>
  <p class="sub">${L('המנוע מהיר מאוד וחלש. הבורג צריך סיבוב איטי וחזק. תכנן את התמסורת שביניהם.', 'The motor is very fast and weak. A screw needs slow, strong rotation. Design the drivetrain in between.')}</p>
  <div class="spec"><div><h6>${L('כניסה', 'Input')}</h6><p>${L('מנוע DC 18V<br>18,000 סל"ד ללא עומס<br>מומנט עצירה 1.6 N·m · 80 A', 'DC motor 18 V<br>18,000 rpm no-load<br>Stall 1.6 N·m · 80 A')}</p></div>
  <div><h6>${L('יעד ביציאה (צ\'אק)', 'Target at output (chuck)')}</h6><p>${L(`סיבוב על אותו ציר<br>${LIM.rpmLo}–${LIM.rpmHi} סל"ד ללא עומס<br>מומנט מרבי ≥ ${LIM.tq} N·m`, `Rotation on the same axis<br>${LIM.rpmLo}–${LIM.rpmHi} rpm no-load<br>Max torque ≥ ${LIM.tq} N·m`)}</p></div></div>
  <h6 style="color:#8a919b;font-size:11px;letter-spacing:.8px">${L('אילוצים', 'CONSTRAINTS')}</h6>
  <ul><li>${L(`זרם ≤ ${LIM.I} A בעומס הברגה של 10 N·m`, `Current ≤ ${LIM.I} A at a 10 N·m screwing load`)}</li><li>${L('עד 5 רכיבים, הכול בתוך גוף המברגה', 'Up to 5 components, all inside the drill body')}</li><li>${L('★ בונוס: הגנה כשהבורג מתיישב (עומס חוסם)', '★ Bonus: protect when the screw seats (blocking load)')}</li></ul>
  <div class="row"><button class="primary" id="bGo">${L('לבנייה', 'Start building')}</button></div>`;
  $('brief').classList.add('show'); $('bGo').onclick = () => { $('brief').classList.remove('show'); if (mode === 'start') mode = 'build'; updateStats(); };
}
$('lvl').textContent = L('אתגר 1 · מברגה חשמלית', 'Challenge 1 · Drill driver');
$('palT').textContent = L('ספריית רכיבים', 'Component library');
$('bBrief').textContent = L('תדריך', 'Brief'); $('bClear').textContent = L('נקה', 'Clear'); $('bRun').textContent = L('הפעל בדיקה', 'Run test');
$('sTag').textContent = L('אתגרי מנגנונים למהנדסים', 'Mechanism challenges for engineers');
$('bPlay').textContent = L('התחל', 'Play'); $('bLang').textContent = EN ? 'עב' : 'EN'; $('bLang2').textContent = EN ? 'עברית' : 'English';
$('rReplay').textContent = L('↺ שוב', '↺ Replay'); $('rBack').textContent = L('חזרה לבנייה', 'Back to build'); $('rNext').textContent = L('אתגר 2 – בקרוב', 'Challenge 2 – soon');
$('bPlay').onclick = () => { $('start').classList.remove('show'); showModes(); };
$('bBrief').onclick = showBrief;
for (const b of [$('bLang'), $('bLang2')]) b.onclick = switchLang;
for (const b of [$('bHQ'), $('bHQ2')]) b.onclick = () => { HQ = !HQ; localStorage.setItem('mf_hq', HQ ? '1' : '0'); applyQuality(); toast(HQ ? L('איכות גבוהה', 'High quality') : L('מצב מהיר', 'Fast mode')); };
$('bRun').onclick = startRun;
$('bClear').onclick = () => { for (const c of chain) bench.remove(c.g); chain.length = 0; select(null); layout(); frame(); };
$('rReplay').onclick = () => { const types = drill.userData.types; RV.labs.forEach(e => e.remove()); startReveal(); };
$('rBack').onclick = endReveal;

layout(true); applyQuality(); frame(true); updateStats();
if (QS.has('demo')) { $('start').classList.remove('show'); mode = 'build'; for (const t of QS.get('demo').split(',')) insertPart(t, PT[t].kind === 'src' ? 0 : chain.length); for (const c of chain) c.g.position.y = AX; select(null); frame(true); }

// ================= MechaForge Academy: learn / practice / test, explain, X-ray, section =================
let TUT = null, ACAD = null, XRAY = false, SEC = false, hoverT = null;
const PROG = Object.assign({ learn: false, practice: false, best: 0, badge: false }, JSON.parse(localStorage.getItem('mf_prog') || '{}'));
const saveProg = () => localStorage.setItem('mf_prog', JSON.stringify(PROG));
const fmt = n => Math.round(n).toLocaleString('en-US');
// ---------- knowledge base ----------
const SVG = {
  motor: `<svg viewBox="0 0 220 120"><line x1="30" y1="100" x2="210" y2="100" class="ax"/><line x1="30" y1="100" x2="30" y2="10" class="ax"/><line x1="30" y1="18" x2="200" y2="100" class="cv"/><circle cx="30" cy="18" r="4" class="pt"/><circle cx="200" cy="100" r="4" class="pt"/><text x="36" y="16">${L('מומנט עצירה 1.6', 'stall 1.6')} N·m</text><text x="150" y="92">18,000 rpm</text><text x="120" y="116">${L('סל"ד', 'speed')} →</text><text x="4" y="60" transform="rotate(-90 12 60)">T ↑</text></svg>`,
  gear: (zs, zp, zr) => `<svg viewBox="0 0 220 150"><circle cx="110" cy="75" r="66" class="ring"/><circle cx="110" cy="75" r="58" class="ring2"/>${[0, 1, 2].map(k => { const a = k * 2.094 - 1.57, x = 110 + Math.cos(a) * 37, y = 75 + Math.sin(a) * 37; return `<line x1="110" y1="75" x2="${x}" y2="${y}" class="car"/><circle cx="${x}" cy="${y}" r="20" class="pl"/>`; }).join('')}<circle cx="110" cy="75" r="16" class="sun"/><text x="110" y="79" text-anchor="middle" class="dk">Zs ${zs}</text><text x="110" y="28" text-anchor="middle">Zp ${zp}</text><text x="196" y="16" text-anchor="middle">Zr ${zr}</text></svg>
   <p class="fx">i = 1 + Z<sub>r</sub>/Z<sub>s</sub> = 1 + ${zr}/${zs} = <b>${1 + zr / zs}</b></p>`,
  clutch: `<svg viewBox="0 0 220 110"><rect x="20" y="15" width="18" height="80" class="pl2"/><rect x="92" y="15" width="14" height="80" class="pl2"/>${[30, 55, 80].map(y => `<circle cx="65" cy="${y}" r="10" class="ball"/>`).join('')}<polyline points="106,55 116,40 126,70 136,40 146,70 156,40 166,70 176,55" class="spr"/><rect x="176" y="15" width="14" height="80" class="pl2"/><text x="20" y="108">${L('צלחת מונעת', 'drive plate')}</text><text x="120" y="108">${L('קפיץ = מומנט החלקה', 'spring = slip torque')}</text></svg>`,
};
const INFO = {
  motor: { what: ['מנוע DC בעל מברשות, 18V. הופך אנרגיה חשמלית מהסוללה לסיבוב.', 'Brushed 18 V DC motor – turns battery power into rotation.'],
    how: ['ככל שהעומס (המומנט) גדל, הסל"ד יורד באופן ליניארי והזרם עולה. ללא עומס: 18,000 סל"ד. בעצירה: 1.6 N·m ו-80 A.', 'As load torque rises, speed drops linearly and current rises. No-load 18,000 rpm; stall 1.6 N·m at 80 A.'],
    why: ['זה "המקור" – תמיד ראשון בשרשרת. הבעיה: מהיר פי 20 ממה שבורג צריך, וחלש פי 12.', 'It is the source – always first. Problem: 20× too fast for a screw and 12× too weak.'], svg: SVG.motor,
    q: { q: ['המנוע נותן 1.6 N·m. כמה פעמים צריך להגדיל את המומנט כדי להגיע ל-20 N·m?', 'The motor gives 1.6 N·m. By how much must torque be multiplied to reach 20 N·m?'], o: ['×2', '×5', '×12.5', '×100'], c: 2, e: ['20 / 1.6 = 12.5. לכן נצטרך תמסורת ביחס של לפחות ~14 (בגלל הפסדי נצילות).', '20 / 1.6 = 12.5 – so we need a ratio of at least ~14 (efficiency losses).'] } },
  pl4: { what: ['תמסורת פלנטרית: גלגל שמש במרכז, 3 גלגלי לוויין, וטבעת שיניים פנימית קבועה בגוף.', 'Planetary gearbox: a central sun gear, 3 planets and a fixed internal ring gear.'],
    how: ['הכניסה מסובבת את השמש. הלוויינים מתגלגלים בתוך הטבעת הקבועה ומסובבים את הנשא (Carrier) – שהוא היציאה. הנשא מסתובב פי 4 לאט יותר, והמומנט גדל פי 4 (פחות 5% הפסד).', 'Input drives the sun. The planets roll inside the fixed ring and turn the carrier – the output. The carrier turns 4× slower and torque rises 4× (minus 5% loss).'],
    why: ['קומפקטי, קואקסיאלי (כניסה ויציאה על אותו ציר) ומחלק את העומס על 3 לוויינים – בדיוק מה שנכנס בקנה של מברגה.', 'Compact, coaxial (in and out on the same axis) and load shared by 3 planets – exactly what fits a drill barrel.'], svg: SVG.gear(12, 12, 36),
    q: { q: ['השמש מסתובבת ב-18,000 סל"ד. מה סל"ד הנשא (היציאה) בשלב 4:1?', 'The sun turns at 18,000 rpm. What is the carrier (output) speed of the 4:1 stage?'], o: ['72,000', '18,000', '4,500', '1,800'], c: 2, e: ['n_out = n_in / i = 18,000 / 4 = 4,500 סל"ד. עדיין מהיר מדי – היעד 500–1200.', 'n_out = n_in / i = 18,000 / 4 = 4,500 rpm. Still too fast – the target is 500–1200.'] } },
  pl5: { what: ['שלב פלנטרי שני, יחס 5:1 (טבעת 48 שיניים, שמש 12).', 'A second planetary stage, 5:1 (ring 48 teeth, sun 12).'],
    how: ['הנשא של השלב הקודם מסובב את השמש של השלב הזה. בשלבים בטור היחסים <b>מוכפלים</b>: 4 × 5 = 20, והנצילויות מוכפלות: 0.95 × 0.95 ≈ 90%.', 'The previous carrier drives this sun. Ratios of stages in series <b>multiply</b>: 4 × 5 = 20, and efficiencies multiply: 0.95 × 0.95 ≈ 90%.'],
    why: ['<div class="why2"><b>למה לחבר 4:1 ו-5:1?</b><br>① המנוע מסתובב <b>18,000 סל"ד</b>, ובמברגה צריך בערך <b>900 סל"ד</b> → יחס נדרש 18,000/900 = <b>20:1</b>.<br>② בשלב פלנטרי אחד היחס הוא <b>1 + טבעת/שמש</b>. ל-20:1 צריך טבעת גדולה פי 19 מהשמש: שמש של 12 שיניים → טבעת של 228 שיניים! השמש קטנה מדי והטבעת לא נכנסת בקנה. בפועל שלב אחד מוגבל לבערך <b>6–7:1</b>.<br>③ שלבים בטור <b>מוכפלים</b>: 4 × 5 = <b>20</b>. 18,000/20 = <b>900 סל"ד</b>.<br>④ המומנט גדל פי 20 כפול הנצילות: 1.6 × 20 × 0.95 × 0.95 ≈ <b>28.9 N·m</b> ≥ 20 ✓.<br>⑤ במברגות אמיתיות יש בדרך כלל <b>2–3 שלבים</b> (השלישי הוא ההילוך 1/2 בבורר).</div>', '<div class="why2"><b>Why connect 4:1 and 5:1?</b><br>① The motor turns <b>18,000 rpm</b>; a drill needs about <b>900 rpm</b> → required ratio 18,000/900 = <b>20:1</b>.<br>② One planetary stage gives <b>1 + Ring/Sun</b>. 20:1 needs a ring 19× the sun: a 12-tooth sun → a 228-tooth ring! The sun gets too small and the ring won\'t fit the barrel. A single stage is practically limited to about <b>6–7:1</b>.<br>③ Stages in series <b>multiply</b>: 4 × 5 = <b>20</b>. 18,000/20 = <b>900 rpm</b>.<br>④ Torque grows ×20 times efficiency: 1.6 × 20 × 0.95 × 0.95 ≈ <b>28.9 N·m</b> ≥ 20 ✓.<br>⑤ Real drills usually have <b>2–3 stages</b> (the third is the 1/2 speed selector).</div>'], svg: SVG.gear(12, 18, 48),
    q: { pre: true, q: ['נבא לפני שמסתובב: מה יהיה הסל"ד ביציאה אחרי 4:1 ואז 5:1?', 'Predict before it spins: output speed after 4:1 then 5:1?'], o: ['3,600', '900', '4,500', '22,500'], c: 1, e: ['18,000 / (4×5) = 900 סל"ד ✓ בטווח. מומנט: 1.6 × 20 × 0.9 ≈ 28.9 N·m ✓', '18,000 / (4×5) = 900 rpm ✓ in range. Torque: 1.6 × 20 × 0.9 ≈ 28.9 N·m ✓'] } },
  clutch: { what: ['מצמד מומנט: צלחת עם כדורים שנלחצים לשקעים ע"י קפיצים. זו הטבעת הממוספרת בחזית מברגה אמיתית.', 'Torque clutch: a plate with balls pressed into detents by springs – the numbered collar on a real drill.'],
    how: ['כל עוד המומנט נמוך – הכדורים נשארים בשקעים והכול מסתובב יחד. כשהמומנט עובר את הסף – הכדורים קופצים החוצה והמצמד מחליק ("טרררר"). הסף נקבע לפי כוח הקפיצים.', 'Below the threshold the balls stay seated and everything turns together. Above it, the balls ride out and the clutch slips (the familiar ratchet). Spring force sets the threshold.'],
    why: ['כשהבורג מתיישב העומס קופץ לאינסוף. בלי מצמד – המנוע נעצר, מושך 80 A ונשרף, או שהראש של הבורג נהרס.', 'When the screw seats the load jumps to "infinite". Without a clutch the motor stalls, draws 80 A and burns, or the screw head strips.'], svg: SVG.clutch,
    q: { q: ['המצמד מכוון ל-12 N·m והבורג מתיישב. מה קורה?', 'Clutch set to 12 N·m and the screw seats. What happens?'], o: [L('המנוע נעצר ומושך 80 A', 'Motor stalls at 80 A'), L('המצמד מחליק, המומנט נשאר 12 N·m', 'Clutch slips, torque stays 12 N·m'), L('הסל"ד עולה', 'Speed rises'), L('התמסורת נשברת', 'Gearbox breaks')], c: 1, e: ['נכון – המצמד מגביל את המומנט ל-12 N·m, המנוע ממשיך להסתובב והזרם נשאר נמוך.', 'Right – the clutch caps torque at 12 N·m; the motor keeps turning and current stays low.'] } },
  hobby: { what: ['מנוע צעצוע 3V – זול וקטן.', 'Small cheap 3 V hobby motor.'], how: ['מומנט עצירה 0.06 N·m בלבד.', 'Only 0.06 N·m stall torque.'], why: ['גם עם 20:1 ייתן רק ~1 N·m – חלש מדי למברגה.', 'Even with 20:1 it gives only ~1 N·m – far too weak.'] },
  stepper: { what: ['מנוע צעד NEMA17 – מדויק, איטי.', 'NEMA 17 stepper – precise, slow.'], how: ['1,200 סל"ד ו-0.45 N·m.', '1,200 rpm and 0.45 N·m.'], why: ['כבר איטי; כל תמסורת שתגדיל מומנט תוריד את הסל"ד מתחת ל-500.', 'Already slow; any gearbox big enough for torque drops speed below 500.'] },
  worm: { what: ['בורג אינסופי 30:1.', 'Worm drive 30:1.'], how: ['יחס גבוה בשלב אחד, אבל היציאה ב-90° והנצילות נמוכה (~50%).', 'High ratio in one stage, but 90° output and low efficiency (~50%).'], why: ['במברגה הצ\'אק חייב להיות על ציר המנוע – לכן נדחה.', 'In a drill the chuck must be on the motor axis – so it is rejected.'] },
  spur: { what: ['זוג גלגלי שיניים חיצוניים.', 'External spur gear pair.'], how: ['מעביר תנועה בין שני צירים מקבילים במרחק.', 'Transfers motion between two parallel offset axes.'], why: ['מסיט את הציר ב-18 מ"מ – לא נכנס בקנה הצר.', 'Offsets the axis by 18 mm – won\'t fit the narrow barrel.'] },
};
const LSTEPS = ['motor', 'pl4', 'pl5', 'clutch'];
function chainMath() {
  let n = 0, T = 0, i = 1, eta = 1; const rows = [];
  for (const c of chain) { const d = PT[c.type];
    if (d.kind === 'src') { n = d.w0; T = d.Ts; rows.push([EN ? d.en : d.he, n, T, '—']); }
    else if (d.kind === 'gear') { n /= d.i; T *= d.i * d.eta; i *= d.i; eta *= d.eta; rows.push([EN ? d.en : d.he, n, T, `÷${d.i} · ×${(d.i * d.eta).toFixed(2)}`]); }
    else if (d.kind === 'clutch') { const lim = Math.min(T, clutchTc); rows.push([EN ? d.en : d.he, n, lim, L(`מוגבל ל-${clutchTc}`, `capped ${clutchTc}`)]); } }
  const okN = n >= LIM.rpmLo && n <= LIM.rpmHi, okT = T >= LIM.tq;
  return `<table class="mt"><tr><th>${L('רכיב', 'Part')}</th><th>${L('סל"ד', 'rpm')}</th><th>N·m ${L('מרבי', 'max')}</th><th></th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${fmt(r[1])}</td><td>${r[2].toFixed(1)}</td><td class="op">${r[3]}</td></tr>`).join('') || `<tr><td colspan="4">${L('השרשרת ריקה', 'Chain is empty')}</td></tr>`}</table>
  <div class="mtot"><span>i = <b>${i}:1</b></span><span>η = <b>${(eta * 100).toFixed(0)}%</b></span><span class="${okN ? 'ok' : 'no'}">${fmt(n)} rpm ${okN ? '✓' : '✗'}</span><span class="${okT ? 'ok' : 'no'}">${T.toFixed(1)} N·m ${okT ? '✓' : '✗'}</span></div>
  <p class="fx">n<sub>out</sub> = n<sub>motor</sub> / i · T<sub>out</sub> = T<sub>motor</sub> × i × η</p>`;
}
function infoHTML(t) {
  const f = INFO[t], d = PT[t];
  return `<div class="kb"><h4>${EN ? d.en : d.he} <small>${EN ? d.sen : d.she}</small></h4>
  <h6>${L('מה זה', 'What it is')}</h6><p>${L(...f.what)}</p><h6>${L('איך זה עובד', 'How it works')}</h6><p>${L(...f.how)}</p><h6>${L('למה כאן', 'Why here')}</h6><p>${L(...f.why)}</p>${f.svg ? `<div class="dg">${f.svg}</div>` : ''}</div>`;
}
// ---------- side panel ----------
const side = document.createElement('aside'); side.id = 'side';
side.innerHTML = `<div class="sh"><span id="sideT"></span><span class="sp"></span><button id="sideW" title="${L('רוחב', 'Width')}">⇔</button><button id="sideMin" title="${L('מזער', 'Minimise')}">–</button></div><div id="sideB"></div>`;
document.body.appendChild(side);
const tPtr = document.createElement('div'); tPtr.id = 'tptr'; document.body.appendChild(tPtr);
const ioL = [0, 1].map(() => { const e = document.createElement('div'); e.className = 'lab io'; $('labels').appendChild(e); return e; });
$('sideW').onclick = () => { side.classList.toggle('wide'); viewShift(); };
$('sideMin').onclick = () => { side.classList.toggle('min'); viewShift(); };
function viewShift() {
  const on = side.classList.contains('show') && !side.classList.contains('min') && !MOBILE;
  const w = innerWidth, h = innerHeight, pw = on ? side.offsetWidth + 12 : 0, s = Math.round((pw - 228) / 2);
  if (on && s > 0) camera.setViewOffset(w + 2 * s, h, 0, 0, w, h); else camera.clearViewOffset();
  document.body.classList.toggle('sideOn', on); camera.updateProjectionMatrix();
}
addEventListener('resize', viewShift);
function panel(title, html) { side.classList.add('show'); side.classList.remove('min'); $('sideT').innerHTML = title; $('sideB').innerHTML = html; $('sideB').scrollTop = 0; viewShift(); }
function closePanel() { side.classList.remove('show'); viewShift(); }
// ---------- header buttons ----------
const hb = (id, txt) => { const b = document.createElement('button'); b.className = 'tb'; b.id = id; b.textContent = txt; $('bBrief').before(b); return b; };
const bModes = hb('bModes', L('🎓 מצבים', '🎓 Modes')), bExp = hb('bExp', L('❓ הסבר', '❓ Explain')), bX = hb('bX', 'X-RAY'), bSec = hb('bSec', L('✂ חתך', '✂ Section'));
bModes.onclick = () => { if (mode === 'run') return; if (mode === 'reveal') endReveal(); showModes(); };
bExp.onclick = () => acadExplain();
bX.onclick = () => { XRAY = !XRAY; bX.classList.toggle('on', XRAY); toast(XRAY ? L('X-RAY: מעטפות שקופות', 'X-RAY: transparent housings') : L('X-RAY כבוי', 'X-RAY off')); };
bSec.onclick = () => { SEC = !SEC; bSec.classList.toggle('on', SEC); applySec(); toast(SEC ? L('חתך לאורך הציר', 'Section along the axis') : L('חתך כבוי', 'Section off')); };
palList.querySelectorAll('.pitem').forEach(el => { el.addEventListener('pointerenter', () => hoverT = el.dataset.t); el.addEventListener('pointerleave', () => hoverT = null); });
// ---------- section (clipping plane z=0 with coloured caps) ----------
renderer.localClippingEnabled = true;
const secPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), SECU = { value: 0 };
function secMat(m) {
  if (!m.userData.capInst) { m.userData.capInst = 1; m.userData.side0 = m.side; const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { prev && prev(sh, r); sh.uniforms.uSec = SECU; sh.fragmentShader = 'uniform float uSec;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\nif (uSec > 0.5 && !gl_FrontFacing) gl_FragColor = vec4(0.52, 0.27, 0.11, 1.0);'); };
    m.customProgramCacheKey = () => 'sec'; m.needsUpdate = true; }
  const want = SEC ? 1 : 0; if (m.userData.secOn === want) return; m.userData.secOn = want;
  m.clippingPlanes = SEC ? [secPlane] : null; m.side = SEC ? THREE.DoubleSide : m.userData.side0; m.needsUpdate = true;
}
function applySec() {
  SECU.value = SEC ? 1 : 0;
  const roots = [...chain.map(c => c.g), chuck, drill];
  for (const r of roots) r.traverse(o => { if ((o.isMesh || o.isLineSegments) && o.material && !o.material.isMeshBasicMaterial && o.material !== ghostMat) secMat(o.material); });
}
// ---------- housing transparency (X-ray, auto on insert, learn focus) ----------
function setHouse(g, a) {
  const u = g.userData; if (!u.house || Math.abs(u.ha - a) < 0.004) return; u.ha = a;
  for (const m of u.house) { const mt = m.material; const tr = a < 0.99; if (mt.transparent !== tr) { mt.transparent = tr; mt.needsUpdate = true; } mt.opacity = m.isLineSegments ? 0.55 * a : a; mt.depthWrite = a > 0.6; if (mt.emissive) mt.emissive.setHex(a < 0.6 ? 0x1a2a3a : 0); }
}
// ---------- learn-mode ghost / target ----------
const ghostMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff6a00, emissiveIntensity: 0.35, transparent: true, opacity: 0.28, depthWrite: false, roughness: 0.5 });
const tRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 12, 96).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, depthWrite: false }));
const tRing2 = new THREE.Mesh(tRing.geometry, tRing.material.clone()); tRing.visible = tRing2.visible = false; bench.add(tRing, tRing2);
let tGhost = null;
function clearHi() { document.querySelectorAll('.tutHi').forEach(e => e.classList.remove('tutHi')); if (tGhost) { bench.remove(tGhost); tGhost = null; } tRing.visible = tRing2.visible = false; tPtr.style.display = 'none'; TUT = null; ioL.forEach(e => e.style.opacity = 0); }
function guideTo(t, idx) {
  clearHi(); TUT = { want: t, idx, t: 0 };
  const it = document.querySelector(`.pitem[data-t="${t}"]`); it.classList.add('tutHi'); it.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  tGhost = buildPart(t, { noPed: true }); tGhost.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; } if (o.isLineSegments) o.visible = false; });
  let x = X0; for (let k = 0; k < idx; k++) x += PT[chain[k].type].len + GAP;
  TUT.x = x + PT[t].len / 2; tGhost.position.set(TUT.x, AX, 0); bench.add(tGhost);
  tRing.position.set(idx === 0 ? X0 + 1 : x - GAP / 2, AX, 0); tRing2.position.copy(tRing.position); tRing.visible = tRing2.visible = true; TUT.r = PT[t].r + 0.2;
}
function resetBench(types = []) { for (const c of chain) bench.remove(c.g); chain.length = 0; select(null); for (const t of types) insertPart(t, chain.length); for (const c of chain) c.g.position.y = AX; select(null); layout(); frame(); $('graphs').style.display = 'none'; }
// ---------- mode chooser ----------
const mOv = document.createElement('div'); mOv.id = 'modes'; mOv.className = 'ov'; mOv.innerHTML = '<div class="card wide" id="mCard"></div>'; document.body.appendChild(mOv);
function showModes() {
  clearHi(); ACAD = null; closePanel(); document.body.classList.remove('testOn'); $('result').classList.remove('show'); $('brief').classList.remove('show');
  const card = (id, ic, h, p, st, rec) => `<button class="mcard${rec ? ' rec' : ''}" id="${id}"><span class="mi">${ic}</span><b>${h}</b><span class="mp">${p}</span><span class="ms">${st}</span></button>`;
  $('mCard').innerHTML = `<p class="sub">${L('אתגר 1 · מברגה חשמלית', 'Challenge 1 · Drill driver')}</p><h2>${L('איך תרצה להתחיל?', 'How do you want to start?')}</h2>
  <div class="mgrid">${card('mL', '📘', L('למידה', 'Learn'), L('הסבר מלא על כל רכיב, עם הרכבה בידיים, אנימציה פנימית ושאלת בדיקה.', 'Full explanation of every part, hands-on assembly, internal animation and a check question.'), PROG.learn ? L('✓ הושלם', '✓ Done') : L('מומלץ להתחיל כאן', 'Start here'), !PROG.learn)}
  ${card('mP', '🧪', L('תרגול', 'Practice'), L('הרצת סימולציה, הסבר הגרפים, ונסיון תצורות שגויות כדי לראות למה הן נכשלות.', 'Run the simulation, understand the graphs, and try wrong setups to see why they fail.'), PROG.practice ? L('✓ הושלם', '✓ Done') : (PROG.learn ? L('הצעד הבא', 'Next step') : ''), PROG.learn && !PROG.practice)}
  ${card('mT', '🎯', L('מבחן', 'Test'), L('הרכב לבד: בלי רמזים, בלי רוחות רפאים ובלי הצמדה אוטומטית. ציון ותג סיום.', 'Assemble alone: no hints, no ghosts, no auto-snap. Score and a completion badge.'), PROG.badge ? `🏅 ${L('עבר', 'Passed')} · ${PROG.best}` : (PROG.best ? `${L('הכי טוב', 'Best')}: ${PROG.best}` : ''), PROG.practice && !PROG.badge)}</div>
  <div class="row"><button class="ghost" id="mF">${L('בנייה חופשית', 'Free build')}</button>${PROG.learn || PROG.practice || PROG.best ? `<button class="ghost" id="mR">${L('אפס התקדמות', 'Reset progress')}</button>` : ''}</div>`;
  mOv.classList.add('show');
  $('mL').onclick = () => { mOv.classList.remove('show'); startIntro(0); };
  $('mP').onclick = () => { mOv.classList.remove('show'); startPractice(); };
  $('mT').onclick = () => { mOv.classList.remove('show'); startTest(); };
  $('mF').onclick = () => { mOv.classList.remove('show'); showBrief(); };
  if ($('mR')) $('mR').onclick = () => { Object.assign(PROG, { learn: false, practice: false, best: 0, badge: false }); saveProg(); showModes(); };
}
// ---------- intro ----------
const INTRO = [
  { h: ['המשימה', 'The mission'], b: ['<p>בכל אתגר מתכננים מנגנון אמיתי מרכיבים סטנדרטיים ובודקים אותו בסימולציה פיזיקלית.</p><p><b>אתגר 1 – מברגה חשמלית:</b> המנוע מהיר מדי וחלש מדי. בונים בינו לבין הצ\'אק תמסורת שתיתן <b>500–1200 סל"ד</b> ו-<b>20 N·m לפחות</b>, על אותו ציר.</p><div class="tflow"><span>מנוע</span><i>→</i><span>תמסורת</span><i>→</i><span>מצמד</span><i>→</i><span>צ\'אק</span></div>', '<p>Each challenge you design a real mechanism from standard parts and test it in a physics simulation.</p><p><b>Challenge 1 – drill driver:</b> the motor is too fast and too weak. Build a drivetrain giving <b>500–1200 rpm</b> and <b>≥ 20 N·m</b> on the same axis.</p><div class="tflow"><span>Motor</span><i>→</i><span>Gearbox</span><i>→</i><span>Clutch</span><i>→</i><span>Chuck</span></div>'] },
  { h: ['שליטה', 'Controls'], b: ['<table class="tctl"><tr><td>🖱 גרירה שמאלית</td><td>סיבוב המבט</td></tr><tr><td>🖱 גלגלת</td><td>זום</td></tr><tr><td>🖱 גרירה ימנית</td><td>הזזת המבט</td></tr><tr><td>👆 גרירת רכיב מהספרייה</td><td>הרכבה – שחרר ליד טבעת החיבור</td></tr><tr><td>🟢 / 🔴 טבעת</td><td>ירוק = נכנס · אדום = לא מתאים, עם הסבר</td></tr><tr><td>👆 לחיצה על רכיב</td><td>בחירה, נתונים, הסרה</td></tr><tr><td>❓ הסבר</td><td>הסבר על הרכיב הנבחר / שמתחת לעכבר – בכל רגע</td></tr><tr><td>X-RAY / ✂ חתך</td><td>מעטפת שקופה / חתך לאורך הציר</td></tr></table>', '<table class="tctl"><tr><td>🖱 Left drag</td><td>Orbit</td></tr><tr><td>🖱 Wheel</td><td>Zoom</td></tr><tr><td>🖱 Right drag</td><td>Pan</td></tr><tr><td>👆 Drag a library part</td><td>Assemble – release near a ring</td></tr><tr><td>🟢 / 🔴 ring</td><td>Green fits · Red doesn\'t, with reason</td></tr><tr><td>👆 Click a part</td><td>Select, data, remove</td></tr><tr><td>❓ Explain</td><td>Explains the selected / hovered part, any time</td></tr><tr><td>X-RAY / ✂ Section</td><td>Transparent housing / axial cut</td></tr></table>'] },
];
const tIntro = document.createElement('div'); tIntro.id = 'tintro'; tIntro.className = 'ov'; tIntro.innerHTML = '<div class="card" id="tiCard"></div>'; document.body.appendChild(tIntro);
function startIntro(p = 0) {
  const pg = INTRO[p];
  $('tiCard').innerHTML = `<p class="sub">${L('למידה · הקדמה', 'Learn · intro')} ${p + 1}/${INTRO.length}</p><h2>${L(...pg.h)}</h2><div class="tib">${L(...pg.b)}</div>
  <div class="row"><button class="ghost" id="tiSkip">${L('חזרה לתפריט', 'Back to menu')}</button>${p ? `<button class="ghost" id="tiBack">${L('הקודם', 'Back')}</button>` : ''}<button class="primary" id="tiNext">${p < INTRO.length - 1 ? L('הבא', 'Next') : L('מתחילים להרכיב', 'Start assembling')}</button></div>`;
  tIntro.classList.add('show');
  $('tiNext').onclick = () => { if (p < INTRO.length - 1) startIntro(p + 1); else { tIntro.classList.remove('show'); startLearn(); } };
  if ($('tiBack')) $('tiBack').onclick = () => startIntro(p - 1);
  $('tiSkip').onclick = () => { tIntro.classList.remove('show'); showModes(); };
}
// ---------- LEARN ----------
const prog = (k, n, lab) => `<div class="tprog">${Array.from({ length: n }, (_, j) => `<i class="${j < k ? 'done' : j === k ? 'cur' : ''}"></i>`).join('')}<span>${lab}</span></div>`;
function startLearn() { mode = 'build'; resetBench(); ACAD = { mode: 'learn', k: 0, ph: 'drag', t: 0 }; learnStep(); }
function learnStep() {
  const A = ACAD, t = LSTEPS[A.k], d = PT[t], f = INFO[t], hd = `${L('למידה', 'Learn')} · ${A.k + 1}/${LSTEPS.length}`;
  const top = prog(A.k, LSTEPS.length, `${A.k + 1}/${LSTEPS.length}`);
  if (A.ph === 'pre') { // predict before placing
    panel(hd, top + `<h3>${EN ? d.en : d.he}</h3>` + quizHTML(f.q) + `<h6>${L('המצב עכשיו', 'Current state')}</h6>` + chainMath()); bindQuiz(f.q, () => { A.ph = 'drag'; learnStep(); }); return; }
  if (A.ph === 'drag') {
    if (f.q.pre && !A.predicted) { A.predicted = true; A.ph = 'pre'; learnStep(); return; }
    guideTo(t, A.k);
    panel(hd, top + `<h3>${EN ? d.en : d.he}</h3><p class="lead">${L(...f.what)}</p><div class="todo">👉 ${L(`גרור את <b>${d.he}</b> מהספרייה אל הטבעת הכתומה. הרוח הכתומה מראה לאן.`, `Drag <b>${d.en}</b> from the library onto the orange ring. The orange ghost shows where.`)}</div>
      <h6>${L('המצב עכשיו', 'Current state')}</h6>${chainMath()}<div class="row"><button class="ghost" id="lMenu">${L('תפריט', 'Menu')}</button><button class="ghost" id="lShow">${L('הראה לי', 'Show me')}</button></div>`);
    $('lShow').onclick = acadShowMe; $('lMenu').onclick = showModes; return;
  }
  if (A.ph === 'explore') {
    clearHi(); select(null); const c = chain[A.k]; c.xr = true; A.spin = true; A.focus = c;
    const T = new THREE.Vector3(c.g.position.x, AX, 0); camGoal = { t: T, p: T.clone().add(new THREE.Vector3(3.2, 2.4, d.kind === 'src' ? 7.5 : 6.2)) };
    panel(hd, top + `<div class="okb">✓ ${L('חובר נכון!', 'Connected!')}</div>` + infoHTML(t) + `<h6>${L('המספרים – מתעדכנים חי', 'The numbers – live')}</h6>` + chainMath() +
      `<p class="note">${L('המעטפת שקופה כרגע כדי לראות את החלקים הפנימיים. שים לב למהירות הכניסה מול היציאה (התוויות על המודל).', 'The housing is see-through so you can watch the internals. Compare input vs output speed (labels on the model).')}</p><div class="row"><button class="primary" id="lQ">${f.q.pre ? L('המשך', 'Continue') : L('בדוק את עצמך ←', 'Check yourself →')}</button></div>`);
    $('lQ').onclick = () => { if (f.q.pre) learnNext(); else { A.ph = 'quiz'; learnStep(); } }; return;
  }
  if (A.ph === 'quiz') { panel(hd, top + `<h3>${L('בדוק את עצמך', 'Check yourself')}</h3>` + quizHTML(f.q)); bindQuiz(f.q, learnNext); }
}
function learnNext() {
  const A = ACAD; const c = chain[A.k]; if (c) c.xr = false; A.spin = false; A.focus = null; frame();
  A.k++; A.ph = 'drag'; A.predicted = false;
  if (A.k >= LSTEPS.length) { PROG.learn = true; saveProg(); clearHi();
    panel(L('למידה · הושלם', 'Learn · done'), `${prog(4, 4, '4/4')}<div class="okb big">🎉 ${L('סיימת את שלב הלמידה', 'Learning complete')}</div><p class="lead">${L('בנית מנוע → 4:1 → 5:1 → מצמד. יחס 20:1, כ-900 סל"ד, כ-29 N·m ומצמד מגן.', 'You built motor → 4:1 → 5:1 → clutch: 20:1, ≈900 rpm, ≈29 N·m and a protective clutch.')}</p>${chainMath()}<p>${L('עכשיו נריץ את הסימולציה ונבין את התוצאות.', 'Now let\'s run the simulation and understand the results.')}</p><div class="row"><button class="ghost" id="lMenu">${L('תפריט', 'Menu')}</button><button class="primary" id="lP">${L('לתרגול ←', 'To practice →')}</button></div>`);
    $('lP').onclick = () => startPractice(true); $('lMenu').onclick = showModes; return; }
  learnStep();
}
function quizHTML(q) { return `<div class="quiz"><p class="qq">${L(...q.q)}</p>${q.o.map((o, k) => `<button class="qo" data-k="${k}">${o}</button>`).join('')}<div class="qfb"></div></div>`; }
function bindQuiz(q, next) {
  document.querySelectorAll('.qo').forEach(b => b.onclick = () => {
    const k = +b.dataset.k, fb = document.querySelector('.qfb');
    if (k === q.c) { b.classList.add('right'); document.querySelectorAll('.qo').forEach(x => x.disabled = true); fb.innerHTML = `<p class="ok">✓ ${L(...q.e)}</p><div class="row"><button class="primary" id="qN">${L('המשך', 'Continue')}</button></div>`; $('qN').onclick = next; }
    else { b.classList.add('wrong'); b.disabled = true; fb.innerHTML = `<p class="no">✗ ${L('לא בדיוק – נסה שוב. רמז: ', 'Not quite – try again. Hint: ')}${L('חשב לפי n_out = n_in / i ו-T_out = T_in × i × η', 'use n_out = n_in / i and T_out = T_in × i × η')}</p>`; }
  });
}
function acadShowMe() { if (TUT) insertPart(TUT.want, TUT.idx); }
// ---------- PRACTICE ----------
const PSTEPS = [
  { load: ['motor', 'pl4', 'pl5', 'clutch'], h: ['הרצת הסימולציה', 'Run the simulation'], b: ['זו השרשרת שבנית. לחץ <b>"הפעל בדיקה"</b>. הדינמומטר בקצה מעמיס בהדרגה כמו בורג שנכנס לעץ, עד שהבורג "מתיישב" (עומס חוסם).', 'This is the chain you built. Press <b>"Run test"</b>. The dynamometer loads it gradually like a screw going into wood, until the screw seats (blocking load).'] },
  { load: ['motor', 'pl4'], h: ['תצורה שגויה 1: שלב אחד בלבד', 'Wrong setup 1: a single stage'], b: ['טענו מנוע + 4:1 בלבד. לפני ההרצה – נבא: האם יעבוד? לחץ <b>"הפעל בדיקה"</b> וראה.', 'Loaded motor + 4:1 only. Predict first: will it work? Press <b>"Run test"</b>.'] },
  { load: ['hobby', 'pl4', 'pl5', 'clutch'], h: ['תצורה שגויה 2: מנוע חלש', 'Wrong setup 2: weak motor'], b: ['אותה תמסורת, אבל עם מנוע צעצוע 3V. לחץ <b>"הפעל בדיקה"</b>.', 'Same drivetrain with the 3 V hobby motor. Press <b>"Run test"</b>.'] },
  { reject: true, load: ['motor', 'pl4'], h: ['תצורה שגויה 3: רכיב לא מתאים', 'Wrong setup 3: unsuitable part'], b: ['נסה לגרור את <b>הבורג האינסופי 30:1</b> אל השרשרת – ותראה למה הוא נדחה.', 'Try dragging the <b>worm drive 30:1</b> into the chain – and see why it is rejected.'] },
];
function startPractice(fromLearn) { mode = 'build'; clearHi(); ACAD = { mode: 'practice', k: 0 }; practiceStep(); }
function practiceStep(res) {
  const A = ACAD, st = PSTEPS[A.k], hd = `${L('תרגול', 'Practice')} · ${A.k + 1}/${PSTEPS.length}`, top = prog(A.k, PSTEPS.length, `${A.k + 1}/${PSTEPS.length}`);
  if (!res) { resetBench(st.load); if (!st.reject) $('bRun').classList.add('tutHi');
    panel(hd, top + `<h3>${L(...st.h)}</h3><p class="lead">${L(...st.b)}</p>${chainMath()}${graphGuide()}<div class="row"><button class="ghost" id="pMenu">${L('תפריט', 'Menu')}</button>${st.reject ? `<button class="ghost" id="pSkip">${L('דלג', 'Skip')}</button>` : `<button class="ghost" id="pRun">${L('הפעל בשבילי', 'Run it for me')}</button>`}</div>`);
    $('pMenu').onclick = showModes; if ($('pRun')) $('pRun').onclick = () => startRun(); if ($('pSkip')) $('pSkip').onclick = practiceNext; return; }
  $('bRun').classList.remove('tutHi');
  panel(hd, top + `<h3>${L(...st.h)}</h3>${res}<div class="row"><button class="ghost" id="pAgain">↺ ${L('שוב', 'Again')}</button><button class="primary" id="pNext">${A.k < PSTEPS.length - 1 ? L('הבא ←', 'Next →') : L('סיום תרגול', 'Finish practice')}</button></div>`);
  $('pAgain').onclick = () => practiceStep(); $('pNext').onclick = practiceNext;
}
function practiceNext() { const A = ACAD; A.k++; if (A.k < PSTEPS.length) return practiceStep();
  PROG.practice = true; saveProg(); resetBench(['motor', 'pl4', 'pl5', 'clutch']);
  panel(L('תרגול · הושלם', 'Practice · done'), `<div class="okb big">🎉 ${L('סיימת תרגול', 'Practice complete')}</div><p class="lead">${L('עכשיו אתה מבין למה כל רכיב שם ומה קורה כשמשהו חסר. מוכן למבחן? במבחן אין רמזים ואין הצמדה אוטומטית. כפתור "הסבר" זמין, אבל ייספר כרמז.', 'You now know why each part is there and what happens when something is missing. Ready for the test? No hints, no auto-snap. "Explain" is available but counts as a hint.')}</p><div class="row"><button class="ghost" id="pRev">${L('ראה את המוצר האמיתי ▶', 'See the real product ▶')}</button><button class="primary" id="pT">${L('למבחן ←', 'To the test →')}</button></div>`);
  $('pT').onclick = startTest; $('pRev').onclick = () => { closePanel(); lastResult = lastResult || { ev: evaluate(analyse()), a: analyse() }; startReveal(); };
}
function graphGuide() { return `<h6>${L('איך קוראים את הגרפים (חלון הגרפים)', 'Reading the graphs panel')}</h6><ul class="gl"><li><i>1</i>${L('<b>סל"ד יציאה</b> (עליון): הפס הירוק = טווח היעד 500–1200. הסל"ד יורד ככל שהעומס עולה – זה קו המנוע.', '<b>Output rpm</b> (top): the green band is the 500–1200 target. Speed drops as load rises – the motor line.')}</li><li><i>2</i>${L('<b>מומנט יציאה</b> (אמצעי): הקו הירוק המקווקו = 20 N·m נדרש. עם מצמד – העקומה נעצרת בסף ההחלקה.', '<b>Output torque</b> (middle): dashed green = 20 N·m required. With a clutch the curve flattens at the slip threshold.')}</li><li><i>3</i>${L('<b>זרם מנוע</b> (תחתון): הקו האדום = 50 A מקסימום. קפיצה ל-80 A = המנוע נעצר (Stall).', '<b>Motor current</b> (bottom): dashed red = 50 A max. A jump to 80 A = motor stall.')}</li></ul>`; }
function explainResult(ev, a) {
  const li = c => `<li class="${c.ok ? 'ok' : 'no'}">${c.ok ? '✓' : '✗'} ${c.t}${c.v ? ` — <b>${c.v}</b>` : ''}</li>`;
  let why = '';
  if (!ev.ck[0].ok) why = L('אין מנוע בתחילת השרשרת.', 'No motor at the start.');
  else if (ev.free > LIM.rpmHi) why = L(`עם יחס ${a.i}:1 בלבד: 18,000/${a.i} = ${fmt(ev.free)} סל"ד – מהיר מדי, ומומנט ${ev.tmax.toFixed(1)} N·m בלבד. שלב אחד לא מספיק – צריך יחס כולל 15–36.`, `With only ${a.i}:1: 18,000/${a.i} = ${fmt(ev.free)} rpm – too fast, and only ${ev.tmax.toFixed(1)} N·m. One stage is not enough – you need a total ratio of 15–36.`);
  else if (ev.free < LIM.rpmLo) why = L('יחס גבוה מדי – איטי מדי.', 'Ratio too high – too slow.');
  else if (!ev.ck[2].ok) why = L(`הסל"ד בסדר, אבל המנוע חלש: ${a.src.Ts} × ${a.i} × ${(a.eta).toFixed(2)} = ${ev.tmax.toFixed(1)} N·m. תמסורת מחליפה מהירות במומנט – היא לא יוצרת אנרגיה. צריך מנוע חזק יותר.`, `Speed is fine but the motor is weak: ${a.src.Ts} × ${a.i} × ${a.eta.toFixed(2)} = ${ev.tmax.toFixed(1)} N·m. A gearbox trades speed for torque – it doesn't create power. Use a stronger motor.`);
  else if (!ev.ck[3].ok) why = L('הזרם גבוה מדי בעומס הברגה.', 'Current too high under load.');
  else why = L(`הכול עובר: ${fmt(ev.free)} סל"ד, ${ev.tmax.toFixed(1)} N·m, ${ev.I.toFixed(0)} A ב-10 N·m.${a.clutch ? ` בגרף רואים שהמומנט נעצר ב-${clutchTc} N·m כשהבורג מתיישב – זה המצמד שמחליק, והזרם לא קופץ ל-80 A.` : ''}`, `All pass: ${fmt(ev.free)} rpm, ${ev.tmax.toFixed(1)} N·m, ${ev.I.toFixed(0)} A at 10 N·m.${a.clutch ? ` The torque flattens at ${clutchTc} N·m when the screw seats – the clutch slipping, so current never jumps to 80 A.` : ''}`);
  return `<div class="${ev.pass ? 'okb' : 'nob'}">${ev.pass ? L('✓ המנגנון עובד', '✓ Mechanism works') : L('✗ נכשל – וזה בדיוק מה שרצינו לראות', '✗ Failed – exactly what we wanted to see')}</div><ul class="chk2">${ev.ck.map(li).join('')}</ul><h6>${L('למה?', 'Why?')}</h6><p>${why}</p>${graphGuide()}`;
}
// ---------- TEST ----------
function startTest() {
  mode = 'build'; clearHi(); resetBench(); document.body.classList.add('testOn');
  ACAD = { mode: 'test', t0: performance.now(), runs: 0, rejects: [], fails: [], hints: 0 }; testPanel();
}
function testPanel() {
  const A = ACAD;
  panel(`🎯 ${L('מבחן', 'Test')}`, `<p class="lead">${L('הרכב לבד מברגה שעומדת ביעדים, ולחץ "הפעל בדיקה". אין רמזים ואין הצמדה אוטומטית.', 'Assemble a drill that meets the targets on your own, then press "Run test". No hints, no auto-snap.')}</p>
   <div class="spec2"><div>${L('יעד', 'Target')}</div><b>500–1200 rpm · ≥ 20 N·m · ≤ 50 A</b><div>${L('בונוס', 'Bonus')}</div><b>${L('הגנה כשהבורג מתיישב · 800–1000 סל"ד', 'protection when the screw seats · 800–1000 rpm')}</b></div>
   <div class="tstat"><span>⏱ <b id="tTime">0:00</b></span><span>${L('ניסיונות', 'Attempts')} <b>${A.runs}</b></span><span>${L('טעויות', 'Mistakes')} <b>${A.rejects.length + A.fails.length}</b></span><span>${L('רמזים', 'Hints')} <b>${A.hints}</b></span></div>
   <div class="row"><button class="ghost" id="tMenu">${L('תפריט', 'Menu')}</button><button class="ghost" id="tEnd">${L('סיים מבחן', 'End test')}</button></div>`);
  $('tMenu').onclick = showModes; $('tEnd').onclick = () => finishTest(null);
}
const scOv = document.createElement('div'); scOv.id = 'score'; scOv.className = 'ov'; scOv.innerHTML = '<div class="card" id="scCard"></div>'; document.body.appendChild(scOv);
function finishTest(ev) {
  const A = ACAD, sec = (performance.now() - A.t0) / 1000, pass = !!(ev && ev.pass);
  let score = pass ? 100 - 12 * (A.runs - 1) - 5 * A.rejects.length - 10 * A.hints - (sec > 300 ? 10 : 0) + 0 : 0; score = clamp(score, 0, 100);
  if (pass && ev.stars < 3) score = Math.max(0, score - (3 - ev.stars) * 8);
  const ok = pass && score >= 60; if (ok) PROG.badge = true; PROG.best = Math.max(PROG.best, Math.round(score)); saveProg();
  const ms = [...A.rejects.map(r => `<li>🔴 ${L('ניסית לחבר', 'Tried to attach')} <b>${EN ? PT[r.t].en : PT[r.t].he}</b>: ${r.why}</li>`), ...A.fails.map(f => `<li>🟠 ${L('הרצה', 'Run')} ${f.n}: ${f.txt}</li>`)];
  if (pass && !ev.extra[0].ok) ms.push(`<li>⭐ ${L('בלי מצמד – הבורג והמנוע לא מוגנים כשהבורג מתיישב.', 'No clutch – screw and motor unprotected when the screw seats.')}</li>`);
  if (pass && !ev.extra[1].ok) ms.push(`<li>⭐ ${L('הסל"ד לא בטווח האופטימלי 800–1000 (נסה 4:1 + 5:1).', 'Speed not in the 800–1000 sweet spot (try 4:1 + 5:1).')}</li>`);
  if (A.hints) ms.push(`<li>❓ ${L(`השתמשת ב"הסבר" ${A.hints} פעמים (−${10 * A.hints})`, `Used "Explain" ${A.hints}× (−${10 * A.hints})`)}</li>`);
  $('scCard').innerHTML = `<p class="sub">${L('אתגר 1 · תוצאות מבחן', 'Challenge 1 · Test results')}</p><h2>${ok ? L('עברת! 🏅', 'Passed! 🏅') : pass ? L('עבר – אבל הציון נמוך', 'Works – but low score') : L('לא עבר', 'Not passed')}</h2>
   <div class="scbig"><b>${Math.round(score)}</b><span>/100</span></div><div class="stars">${[1, 2, 3].map(k => `<i class="${ev && ev.pass && ev.stars >= k ? 'on' : ''}">★</i>`).join('')}</div>
   <div class="tstat c"><span>${L('נכון', 'Correct')} <b>${pass ? '✓' : '✗'}</b></span><span>${L('ניסיונות', 'Attempts')} <b>${A.runs}</b></span><span>⏱ <b>${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}</b></span><span>${L('רמזים', 'Hints')} <b>${A.hints}</b></span></div>
   ${ok ? `<div class="badge">🏅 ${L('תג סיום: מתכנן תמסורות – מברגה חשמלית', 'Badge: Drivetrain designer – drill driver')}</div>` : ''}
   <h6>${L('משוב', 'Feedback')}</h6><ul class="fb">${ms.join('') || `<li>✓ ${L('ללא טעויות – מושלם!', 'No mistakes – perfect!')}</li>`}</ul>
   <div class="row"><button class="ghost" id="sMenu">${L('תפריט', 'Menu')}</button>${pass ? `<button class="ghost" id="sRev">${L('גלה את המוצר ▶', 'Reveal product ▶')}</button>` : ''}<button class="primary" id="sAgain">↺ ${L('מבחן חוזר', 'Retake')}</button></div>`;
  scOv.classList.add('show'); window.__testDone = { score, pass, ok };
  $('sMenu').onclick = () => { scOv.classList.remove('show'); showModes(); };
  $('sAgain').onclick = () => { scOv.classList.remove('show'); startTest(); };
  if ($('sRev')) $('sRev').onclick = () => { scOv.classList.remove('show'); closePanel(); document.body.classList.remove('testOn'); ACAD = null; startReveal(); };
}
// ---------- hooks ----------
function acadReject(t, why) {
  if (!ACAD) return;
  if (ACAD.mode === 'test') { ACAD.rejects.push({ t, why }); testPanel(); }
  if (ACAD.mode === 'practice' && PSTEPS[ACAD.k].reject && PT[t].bad) practiceStep(`<div class="nob">✗ ${L('נדחה', 'Rejected')}</div><p class="lead">${why}</p>${infoHTML(t)}`);
}
function acadRunDone(ev) {
  if (!ACAD) return; const a = lastResult.a;
  if (ACAD.mode === 'practice') { $('result').classList.remove('show'); practiceStep(explainResult(ev, a)); }
  else if (ACAD.mode === 'test') { $('result').classList.remove('show'); ACAD.runs++;
    if (ev.pass) finishTest(ev); else { ACAD.fails.push({ n: ACAD.runs, txt: ev.ck.filter(c => !c.ok).map(c => c.t + (c.v ? ` (${c.v})` : '')).join(' · ') }); toast(L(`לא עבר (ניסיון ${ACAD.runs}) – תקן ונסה שוב`, `Failed (attempt ${ACAD.runs}) – fix and retry`), true); testPanel(); } }
}
function acadExplain() {
  const t = sel ? sel.type : hoverT, A = ACAD;
  if (A && A.mode === 'test') { A.hints++; }
  const back = A ? `<div class="row"><button class="primary" id="eBack">${L('חזרה', 'Back')}</button></div>` : `<div class="row"><button class="ghost" id="eBack">${L('סגור', 'Close')}</button></div>`;
  const body = (A && A.mode === 'test' ? `<p class="note">${L('נרשם כשימוש ברמז', 'Counted as a hint')}</p>` : '') + (t ? infoHTML(t) : `<p class="lead">${L('לא נבחר רכיב – הנה מצב השרשרת. בחר רכיב (לחיצה) או רחף מעל רכיב בספרייה ולחץ שוב "הסבר".', 'No part selected – here is the chain state. Click a part or hover a library item and press "Explain" again.')}</p>`) +
    `<h6>${L('מצב השרשרת עכשיו', 'Chain state now')}</h6>` + chainMath() + back;
  panel(`❓ ${L('הסבר', 'Explain')}`, body);
  $('eBack').onclick = () => { if (!A) return closePanel(); if (A.mode === 'test') testPanel(); else if (A.mode === 'learn') learnStep(); else practiceStep(); };
}
let tickN = 0, lastLen = -1;
function acadTick(dt) {
  tickN++;
  for (const c of chain) setHouse(c.g, (XRAY || c.xr || c.g.position.y > AX + 0.08) ? lerp(c.g.userData.ha, 0.14, 0.2) : lerp(c.g.userData.ha, 1, 0.12));
  if (SEC && (tickN % 20 === 0 || chain.length !== lastLen)) applySec(); lastLen = chain.length;
  if (ACAD && ACAD.mode === 'test') { const e = $('tTime'); if (e && tickN % 15 === 0) { const s = (performance.now() - ACAD.t0) / 1000; e.textContent = `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; } }
  if (ACAD && ACAD.mode === 'learn') {
    const A = ACAD; A.t += dt;
    if (A.ph === 'drag') {
      const ok = chain.length === A.k + 1 && LSTEPS.slice(0, A.k + 1).every((s, j) => chain[j].type === s);
      if (ok && chain[A.k].g.position.y < AX + 0.1) { A.ph = 'explore'; learnStep(); }
      else if (chain.length > A.k + 1 || (chain.length === A.k + 1 && !ok)) { const c = chain[chain.length - 1]; toast(L(`כאן צריך "${PT[LSTEPS[A.k]].he}" – ${PT[c.type].he} הוסר`, `"${PT[LSTEPS[A.k]].en}" is needed here – ${PT[c.type].en} removed`), true); removePart(c); guideTo(LSTEPS[A.k], A.k); }
    }
    if (A.spin && !run) { spinChain(2400, dt);
      const c = A.focus; if (c) { const d = PT[c.type]; let nin = 18000; for (const x of chain) { if (x === c) break; if (PT[x.type].i) nin /= PT[x.type].i; }
        const nout = d.kind === 'src' ? nin : nin / (d.i || 1);
        const pi = proj(new THREE.Vector3(c.g.position.x - d.len / 2 - 0.2, AX + d.r + 0.5, 0)), po = proj(new THREE.Vector3(c.g.position.x + d.len / 2 + 0.3, AX + d.r + 0.5, 0));
        ioL[0].style.opacity = d.kind === 'src' ? 0 : 1; ioL[0].innerHTML = `${L('כניסה', 'IN')} <b>${fmt(nin)}</b> rpm`; ioL[0].style.left = pi.x + 'px'; ioL[0].style.top = pi.y + 'px';
        ioL[1].style.opacity = 1; ioL[1].innerHTML = `${L('יציאה', 'OUT')} <b>${fmt(nout)}</b> rpm`; ioL[1].style.left = po.x + 'px'; ioL[1].style.top = po.y + 'px'; } }
  }
  if (TUT) { TUT.t += dt; const ph = (TUT.t % 2.4) / 2.4, pul = 0.5 + 0.5 * Math.sin(TUT.t * 5);
    if (tGhost) { const e = ease(clamp(ph / 0.6)); tGhost.position.y = AX + 2.2 * (1 - e); ghostMat.opacity = 0.18 + 0.22 * (ph < 0.6 ? e : 1 - (ph - 0.6) / 0.4 * 0.5); }
    tRing.scale.setScalar(TUT.r * (1 + 0.06 * pul)); tRing.material.opacity = 0.55 + 0.45 * pul; tRing2.scale.setScalar(TUT.r * (1 + ph * 0.6)); tRing2.material.opacity = 0.6 * (1 - ph);
    const it = document.querySelector('.pitem.tutHi');
    if (!drag && it) { const a = it.getBoundingClientRect(), b = proj(new THREE.Vector3(TUT.x, AX, 0)), q = ease(clamp((ph - 0.05) / 0.6));
      tPtr.style.display = 'block'; tPtr.style.left = lerp(a.left + a.width / 2, b.x, q) + 'px'; tPtr.style.top = lerp(a.top + a.height / 2, b.y, q) + 'px'; tPtr.style.opacity = ph > 0.85 ? (1 - ph) / 0.15 : 1; } else tPtr.style.display = 'none'; }
}
// ---------------- main loop ----------------
const clock = new THREE.Clock(); let acc = 0, fpsT = 0, fpsN = 0; window.__fps = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.1); fpsT += dt; fpsN++; if (fpsT > 1) { window.__fps = fpsN / fpsT; fpsT = 0; fpsN = 0; }
  // tween parts into place (no interpenetration: x positions are cumulative lengths with gaps)
  const k = 1 - Math.exp(-dt * 10);
  for (const c of chain) { c.x = lerp(c.x, c.tx, k); c.g.position.x = c.x; c.g.position.y = lerp(c.g.position.y, AX, 1 - Math.exp(-dt * 7)); }
  chuck.userData.x = lerp(chuck.userData.x, chuck.userData.tx, k); chuck.position.x = chuck.userData.x;
  if (sel) { selRing.position.set(sel.g.position.x - PT[sel.type].len / 2 - 0.02, sel.g.position.y, 0); }
  if (run) {
    acc += dt; while (acc >= DT && run) { stepRun(run); if (run.t >= T_END) { acc = 0; spinChain(0, 0); finishRun(); break; } acc -= DT; }
    if (run) { spinChain(run.wm, dt, run.wo); drawGraph(); }
  }
  if (camGoal && mode !== 'reveal') { const q = 1 - Math.exp(-dt * 4); controls.target.lerp(camGoal.t, q); camera.position.lerp(camGoal.p, q); if (camera.position.distanceTo(camGoal.p) < 0.01) camGoal = null; }
  if (mode === 'reveal' && RV) updateReveal(dt);
  acadTick(dt);
  controls.update();
  renderer.render(scene, camera);
}
window.__mf = { drill, PT, LSTEPS, PSTEPS, LANG, sel: () => sel, last: () => lastResult, acad: () => ACAD, tut: () => TUT, showMe: () => acadShowMe(), chain, insertPart, startRun, startReveal, analyse, evaluate, get mode() { return mode; }, get RV() { return RV; } };
loop();

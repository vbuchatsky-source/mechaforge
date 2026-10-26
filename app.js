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
      g.add(can);
      const bell = latheX([[L2 - 0.6, 0], [L2 - 0.6, d.r * 0.97], [L2 - 0.1, d.r * 0.92], [L2, d.r * 0.55], [L2, 0]], M.black, 64); g.add(bell);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const v = rbox(0.7, 0.07, 0.24, 0.03, M.rubber); v.position.set(-L2 + 0.9, Math.cos(a) * d.r * 0.995, Math.sin(a) * d.r * 0.995); v.rotation.x = -a; g.add(v); }
      for (const z of [-0.4, 0.4]) { const t = rbox(0.1, 0.5, 0.18, 0.02, M.brass); t.position.set(-L2 - 0.05, 0, z * d.r); g.add(t); }
      const band = cylX(d.r + 0.01, d.r + 0.01, 0.08, 64, M.dark, 0); band.position.x = L2 - 1.2; g.add(band);
    }
    const sh = outShaft(type === 'hobby' ? 0.08 : 0.18); sp.push({ o: sh, f: 1 });
  } else if (d.kind === 'gear') {
    const w = 0.55, ring = ringGear(d.zr, d.m, w, d.r); g.add(ring);
    const back = latheX([[-L2, 0.22], [-L2, d.r], [-L2 + 0.25, d.r], [-L2 + 0.25, 0.22]], M.dark, 64, 30); g.add(back);
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
    const fr = latheX([[ring.position.x + w / 2 + 0.02, d.r - 0.28], [ring.position.x + w / 2 + 0.02, d.r], [ring.position.x + w / 2 + 0.12, d.r], [ring.position.x + w / 2 + 0.12, d.r - 0.28]], M.alu, 64, 30); g.add(fr);
  } else if (d.kind === 'clutch') {
    const back = latheX([[-L2, 0.2], [-L2, d.r], [-L2 + 0.2, d.r], [-L2 + 0.2, 0.2]], M.dark, 64, 30); g.add(back);
    const rot = new THREE.Group(); g.add(rot); sp.push({ o: rot, f: 1 });
    const plate = latheX([[-L2 + 0.24, 0.2], [-L2 + 0.24, 1.25], [-L2 + 0.4, 1.25], [-L2 + 0.4, 0.2]], M.steel, 64, 30); rot.add(plate);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), M.steel); b.castShadow = true; b.position.set(-L2 + 0.51, Math.cos(a) * 0.95, Math.sin(a) * 0.95); rot.add(b); }
    const plate2 = latheX([[-L2 + 0.62, 0.2], [-L2 + 0.62, 1.25], [-L2 + 0.74, 1.25], [-L2 + 0.74, 0.2]], M.alu, 64, 30); g.add(plate2);
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
const plate = rbox(27, 0.3, 7, 0.08, M.dark); plate.position.y = -0.15; plate.castShadow = false; bench.add(plate);
for (const z of [-2, 0, 2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(26.6, 0.02, 0.22), M.black); s.position.set(0, 0.002, z); bench.add(s); }
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
  drag.sock = bd < (MOBILE ? 170 : 230) ? best : null;
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
  if (why) { toast(why, true); return; }
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
function setOpacity(mats, a) { for (const m of mats) { m.transparent = a < 0.999; m.opacity = a; m.depthWrite = a > 0.5; } }
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
  drill.userData = { parts, nearMats: fadeable(near), farMats: fadeable(far), chuck: ch, types };
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
  setOpacity(u.nearMats, shell);
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
  const ang = 0.5 + Math.sin(t * 0.18) * 0.45, dist = MOBILE ? 19 : 11.5; if (!R.user) { camera.position.set(-0.2 + Math.sin(ang) * dist, 6.4 + Math.sin(t * 0.25) * 0.5, Math.cos(ang) * dist); }
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
  $('brief').classList.add('show'); $('bGo').onclick = () => { $('brief').classList.remove('show'); if (mode === 'start') mode = 'build'; updateStats(); if (window.__tutAfterBrief) { window.__tutAfterBrief = false; startGuide(); } };
}
$('lvl').textContent = L('אתגר 1 · מברגה חשמלית', 'Challenge 1 · Drill driver');
$('palT').textContent = L('ספריית רכיבים', 'Component library');
$('bBrief').textContent = L('תדריך', 'Brief'); $('bClear').textContent = L('נקה', 'Clear'); $('bRun').textContent = L('הפעל בדיקה', 'Run test');
$('sTag').textContent = L('אתגרי מנגנונים למהנדסים', 'Mechanism challenges for engineers');
$('bPlay').textContent = L('התחל', 'Play'); $('bLang').textContent = EN ? 'עב' : 'EN'; $('bLang2').textContent = EN ? 'עברית' : 'English';
$('rReplay').textContent = L('↺ שוב', '↺ Replay'); $('rBack').textContent = L('חזרה לבנייה', 'Back to build'); $('rNext').textContent = L('אתגר 2 – בקרוב', 'Challenge 2 – soon');
$('bPlay').onclick = () => { $('start').classList.remove('show'); if (!localStorage.getItem('mf_tut') || QS.has('tut')) startIntro(); else showBrief(); };
$('bBrief').onclick = showBrief;
for (const b of [$('bLang'), $('bLang2')]) b.onclick = switchLang;
for (const b of [$('bHQ'), $('bHQ2')]) b.onclick = () => { HQ = !HQ; localStorage.setItem('mf_hq', HQ ? '1' : '0'); applyQuality(); toast(HQ ? L('איכות גבוהה', 'High quality') : L('מצב מהיר', 'Fast mode')); };
$('bRun').onclick = startRun;
$('bClear').onclick = () => { for (const c of chain) bench.remove(c.g); chain.length = 0; select(null); layout(); frame(); };
$('rReplay').onclick = () => { const types = drill.userData.types; RV.labs.forEach(e => e.remove()); startReveal(); };
$('rBack').onclick = endReveal;

layout(true); applyQuality(); frame(true); updateStats();
if (QS.has('demo')) { $('start').classList.remove('show'); mode = 'build'; for (const t of QS.get('demo').split(',')) insertPart(t, PT[t].kind === 'src' ? 0 : chain.length); for (const c of chain) c.g.position.y = AX; select(null); frame(true); }

// ---------------- onboarding / guided tutorial ----------------
let TUT = null;
const TSTEPS = [
  { t: 'motor', idx: 0, h: ['שלב 1 · מנוע – מקור התנועה', 'Step 1 · Motor – the motion source'],
    b: ['גרור את <b>מנוע DC 18V</b> מהספרייה אל הטבעת הזוהרת. המנוע מהיר מאוד (18,000 סל"ד) אך חלש (1.6 N·m) – לבורג זה לא מספיק.', 'Drag the <b>DC motor 18 V</b> from the library onto the glowing ring. It is very fast (18,000 rpm) but weak (1.6 N·m) – not enough for a screw.'] },
  { t: 'pl4', idx: 1, h: ['שלב 2 · שלב פלנטרי 4:1', 'Step 2 · Planetary stage 4:1'],
    b: ['חבר <b>שלב פלנטרי 4:1</b> מיד אחרי המנוע. גלגל שמש, 3 לוויינים וטבעת: הסל"ד יורד פי 4 והמומנט עולה פי 4 – והכול נשאר על אותו ציר.', 'Attach the <b>planetary 4:1</b> right after the motor. Sun, 3 planets and a ring: speed ÷4, torque ×4 – all on the same axis.'] },
  { t: 'pl5', idx: 2, h: ['שלב 3 · שלב פלנטרי 5:1', 'Step 3 · Planetary stage 5:1'],
    b: ['הוסף <b>שלב פלנטרי 5:1</b>. יחס כולל 4×5 = <b>20:1</b> → כ-900 סל"ד ו-29 N·m ביציאה. בדיוק בטווח היעד.', 'Add the <b>planetary 5:1</b>. Total 4×5 = <b>20:1</b> → ≈900 rpm and 29 N·m at the output – right on target.'] },
  { t: 'clutch', idx: 3, h: ['שלב 4 · מצמד מומנט (בונוס ★)', 'Step 4 · Torque clutch (bonus ★)'],
    b: ['הוסף <b>מצמד מומנט</b> לפני הצ\'אק. כשהבורג מתיישב הוא מחליק – מגן על המנוע ועל הבורג. אפשר לכוון את מומנט ההחלקה במחוון אחרי לחיצה עליו.', 'Add the <b>torque clutch</b> before the chuck. When the screw seats it slips, protecting motor and screw. Click it to tune the slip torque.'] },
  { run: true, h: ['שלב 5 · בדיקה', 'Step 5 · Test run'],
    b: ['השרשרת מוכנה. לחץ <b>"הפעל בדיקה"</b> – המנוע יאיץ, הבורג יתיישב והגרפים יראו סל"ד, מומנט וזרם.', 'The chain is ready. Press <b>"Run test"</b> – the motor spins up, the screw seats and the graphs show rpm, torque and current.'] },
];
const INTRO = [
  { h: ['ברוך הבא ל-MechaForge', 'Welcome to MechaForge'], b: [
    '<p>בכל אתגר אתה מתכנן מנגנון אמיתי מרכיבים סטנדרטיים, ובודק אותו בסימולציה פיזיקלית.</p><p><b>אתגר 1 – מברגה חשמלית:</b> המנוע מסתובב מהר מדי וחלש מדי. המשימה: לבנות בינו לבין הצ\'אק תמסורת שתיתן <b>500–1200 סל"ד</b> ו-<b>20 N·m לפחות</b>, על אותו ציר.</p><div class="tflow"><span>מנוע</span><i>→</i><span>תמסורת</span><i>→</i><span>מצמד</span><i>→</i><span>צ\'אק</span></div>',
    '<p>Each challenge you design a real mechanism from standard parts and test it in a physics simulation.</p><p><b>Challenge 1 – drill driver:</b> the motor is too fast and too weak. Build a drivetrain to the chuck giving <b>500–1200 rpm</b> and <b>≥ 20 N·m</b>, on the same axis.</p><div class="tflow"><span>Motor</span><i>→</i><span>Gearbox</span><i>→</i><span>Clutch</span><i>→</i><span>Chuck</span></div>'] },
  { h: ['שליטה', 'Controls'], b: [
    '<table class="tctl"><tr><td>🖱 גרירה שמאלית</td><td>סיבוב המבט</td></tr><tr><td>🖱 גלגלת</td><td>זום</td></tr><tr><td>🖱 גרירה ימנית</td><td>הזזת המבט</td></tr><tr><td>👆 גרירת רכיב מהספרייה</td><td>הרכבה – שחרר ליד טבעת החיבור</td></tr><tr><td>🟢 / 🔴 טבעת</td><td>ירוק = נכנס (Snap) · אדום = לא מתאים, עם הסבר</td></tr><tr><td>👆 לחיצה על רכיב</td><td>בחירה, נתונים, הסרה</td></tr><tr><td>👆 לחיצה קצרה על רכיב בספרייה</td><td>מוסיף אותו לסוף השרשרת</td></tr></table>',
    '<table class="tctl"><tr><td>🖱 Left drag</td><td>Orbit</td></tr><tr><td>🖱 Wheel</td><td>Zoom</td></tr><tr><td>🖱 Right drag</td><td>Pan</td></tr><tr><td>👆 Drag a library part</td><td>Assemble – release near a connection ring</td></tr><tr><td>🟢 / 🔴 ring</td><td>Green = snaps · Red = doesn\'t fit, with reason</td></tr><tr><td>👆 Click a part</td><td>Select, data, remove</td></tr><tr><td>👆 Tap a library part</td><td>Appends it to the chain</td></tr></table>'] },
  { h: ['מה כל רכיב עושה', 'What each part does'], b: [
    '<ul class="tparts"><li><b>מנועים</b> – מקור התנועה, תמיד ראשונים. 18V חזק, צעצוע חלש מדי, מנוע צעד איטי מדי.</li><li><b>שלב פלנטרי</b> – מוריד סל"ד ומכפיל מומנט ביחס שלו, על אותו ציר. שלבים מוכפלים: 4×5 = 20.</li><li><b>מצמד מומנט</b> – מחליק בעומס יתר ומגן על המערכת.</li><li><b>בורג אינסופי / זוג גלגלים</b> – משנים כיוון או מסיטים את הציר – לא מתאימים למברגה.</li></ul><p class="sub">עכשיו נרכיב יחד, צעד אחר צעד. אפשר ללחוץ "הראה לי" בכל שלב.</p>',
    '<ul class="tparts"><li><b>Motors</b> – the source, always first. 18 V is strong, hobby too weak, stepper too slow.</li><li><b>Planetary stage</b> – cuts speed and multiplies torque by its ratio, same axis. Stages multiply: 4×5 = 20.</li><li><b>Torque clutch</b> – slips on overload, protects the system.</li><li><b>Worm / spur pair</b> – turn or offset the axis – unsuitable for a drill.</li></ul><p class="sub">Now let\'s assemble together, step by step. Press "Show me" any time.</p>'] },
];
const tEl = document.createElement('div'); tEl.id = 'tut'; document.body.appendChild(tEl);
const tPtr = document.createElement('div'); tPtr.id = 'tptr'; document.body.appendChild(tPtr);
const tIntro = document.createElement('div'); tIntro.id = 'tintro'; tIntro.className = 'ov'; tIntro.innerHTML = '<div class="card" id="tiCard"></div>'; document.body.appendChild(tIntro);
const tBtn = document.createElement('button'); tBtn.className = 'tb'; tBtn.id = 'bTut'; tBtn.textContent = L('🎓 הדרכה', '🎓 Tutorial'); $('bBrief').before(tBtn);
tBtn.onclick = () => { if (mode === 'run' || mode === 'reveal') return; $('start').classList.remove('show'); $('brief').classList.remove('show'); startIntro(); };
const ghostMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff6a00, emissiveIntensity: 0.35, transparent: true, opacity: 0.28, depthWrite: false, roughness: 0.5 });
const tRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 12, 96).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, depthWrite: false }));
const tRing2 = new THREE.Mesh(tRing.geometry, tRing.material.clone()); tRing.visible = tRing2.visible = false; bench.add(tRing, tRing2);
let tGhost = null;
function startIntro(p = 0) {
  endGuide(true);
  const pg = INTRO[p];
  $('tiCard').innerHTML = `<p class="sub">${L('הסבר מקדים', 'Introduction')} · ${p + 1}/${INTRO.length}</p><div class="tdots">${INTRO.map((_, k) => `<i class="${k <= p ? 'on' : ''}"></i>`).join('')}</div><h2>${L(...pg.h)}</h2><div class="tib">${L(...pg.b)}</div>
  <div class="row"><button class="ghost" id="tiSkip">${L('דלג על ההדרכה', 'Skip tutorial')}</button>${p ? `<button class="ghost" id="tiBack">${L('הקודם', 'Back')}</button>` : ''}<button class="primary" id="tiNext">${p < INTRO.length - 1 ? L('הבא', 'Next') : L('בוא נרכיב ←', 'Let\'s build →')}</button></div>`;
  tIntro.classList.add('show');
  $('tiNext').onclick = () => { if (p < INTRO.length - 1) startIntro(p + 1); else { tIntro.classList.remove('show'); startGuide(); } };
  if ($('tiBack')) $('tiBack').onclick = () => startIntro(p - 1);
  $('tiSkip').onclick = () => { tIntro.classList.remove('show'); localStorage.setItem('mf_tut', '1'); showBrief(); };
}
function startGuide() {
  mode = 'build'; for (const c of chain) bench.remove(c.g); chain.length = 0; select(null); layout(); frame();
  TUT = { k: -1, t: 0 }; tEl.classList.add('show'); tutStep(0);
}
function clearHi() { document.querySelectorAll('.tutHi').forEach(e => e.classList.remove('tutHi')); if (tGhost) { bench.remove(tGhost); tGhost = null; } tRing.visible = tRing2.visible = false; tPtr.style.display = 'none'; }
function tutTargetX(st) { let x = X0; for (let k = 0; k < st.idx; k++) x += PT[TSTEPS[k].t].len + GAP; return x; }
function tutStep(k) {
  clearHi(); TUT.k = k; TUT.t = 0; const st = TSTEPS[k];
  TUT.want = st.t; TUT.idx = st.idx;
  tEl.innerHTML = `<div class="tprog">${TSTEPS.map((_, j) => `<i class="${j < k ? 'done' : j === k ? 'cur' : ''}"></i>`).join('')}<span>${k + 1}/${TSTEPS.length}</span></div><h5>${L(...st.h)}</h5><p>${L(...st.b)}</p><div class="row"><button class="ghost" id="tSkip">${L('סיים הדרכה', 'End tutorial')}</button><button class="ghost" id="tReplay">↺ ${L('מההתחלה', 'Restart')}</button><button class="primary" id="tShow">${st.run ? L('הפעל בשבילי', 'Run it for me') : L('הראה לי', 'Show me')}</button></div>`;
  $('tSkip').onclick = () => { endGuide(); localStorage.setItem('mf_tut', '1'); };
  $('tReplay').onclick = () => startIntro(0);
  $('tShow').onclick = tutShowMe;
  if (st.run) { $('bRun').classList.add('tutHi'); return; }
  const it = document.querySelector(`.pitem[data-t="${st.t}"]`); it.classList.add('tutHi'); it.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  tGhost = buildPart(st.t, { noPed: true }); tGhost.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; } if (o.isLineSegments) o.visible = false; });
  const x = tutTargetX(st); TUT.x = x + PT[st.t].len / 2; tGhost.position.set(TUT.x, AX, 0); bench.add(tGhost);
  const sx = st.idx === 0 ? X0 + 1 : x - GAP / 2; TUT.sx = sx;
  tRing.position.set(sx, AX, 0); tRing2.position.copy(tRing.position); tRing.visible = tRing2.visible = true;
}
function tutShowMe() {
  if (!TUT) return; const st = TSTEPS[TUT.k];
  if (st.run) { startRun(); return; }
  insertPart(st.t, st.idx);
}
function endGuide(silent) { if (!TUT) return; clearHi(); TUT = null; tEl.classList.remove('show'); if (!silent) toast(L('ההדרכה הסתיימה – אפשר לחזור אליה בכפתור 🎓', 'Tutorial ended – reopen it with 🎓')); }
function tutTick(dt) {
  if (!TUT) return; TUT.t += dt; const st = TSTEPS[TUT.k];
  if (st.run) { if (mode === 'run' || run) { $('bRun').classList.remove('tutHi'); tEl.querySelector('p').innerHTML = L('הבדיקה רצה… שים לב לגרפים: הסל"ד יורד כשהבורג מתיישב, והמצמד מחליק.', 'Test running… watch the graphs: rpm drops as the screw seats and the clutch slips.'); TUT.wait = true; }
    else if (TUT.wait) { localStorage.setItem('mf_tut', '1'); TUT.done = true; window.__tutDone = true; endGuide(true); toast(L('כל הכבוד! סיימת את ההדרכה 🎉 עכשיו נסה לשפר בעצמך', 'Well done! Tutorial complete 🎉 Now try improving it yourself')); }
    return; }
  // check progress
  const ok = TSTEPS.slice(0, TUT.k + 1).every((s, j) => chain[j] && chain[j].type === s.t) && chain.length === TUT.k + 1;
  if (ok) { tutStep(TUT.k + 1); return; }
  const bad = chain.findIndex((c, j) => !TSTEPS[j] || TSTEPS[j].run || c.type !== TSTEPS[j].t);
  if (bad >= 0) { const c = chain[bad]; toast(L(`בהדרכה צריך כאן "${PT[TSTEPS[TUT.k].t].he}" – ${PT[c.type].he} הוסר`, `The tutorial needs "${PT[TSTEPS[TUT.k].t].en}" here – ${PT[c.type].en} removed`), true); removePart(c); return; }
  const ph = (TUT.t % 2.4) / 2.4, pul = 0.5 + 0.5 * Math.sin(TUT.t * 5);
  if (tGhost) { const e = ease(clamp(ph / 0.6)); tGhost.position.y = AX + 2.2 * (1 - e); ghostMat.opacity = 0.18 + 0.22 * (ph < 0.6 ? e : 1 - (ph - 0.6) / 0.4 * 0.5); }
  const r = PT[st.t].r + 0.2; tRing.scale.setScalar(r * (1 + 0.06 * pul)); tRing.material.opacity = 0.55 + 0.45 * pul;
  tRing2.scale.setScalar(r * (1 + ph * 0.6)); tRing2.material.opacity = 0.6 * (1 - ph);
  if (!drag) { const it = document.querySelector('.pitem.tutHi'); if (it) { const a = it.getBoundingClientRect(); const b = proj(new THREE.Vector3(TUT.x, AX, 0)); const q = ease(clamp((ph - 0.05) / 0.6));
    tPtr.style.display = 'block'; tPtr.style.left = lerp(a.left + a.width / 2, b.x, q) + 'px'; tPtr.style.top = lerp(a.top + a.height / 2, b.y, q) + 'px'; tPtr.style.opacity = ph > 0.85 ? (1 - ph) / 0.15 : 1; } }
  else tPtr.style.display = 'none';
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
  tutTick(dt);
  controls.update();
  renderer.render(scene, camera);
}
window.__mf = { tut: () => TUT, tutShow: () => tutShowMe(), chain, insertPart, startRun, startReveal, analyse, evaluate, get mode() { return mode; }, get RV() { return RV; } };
loop();

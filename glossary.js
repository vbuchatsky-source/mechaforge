// MechaForge glossary – clickable terms with a live 3D model popup (one shared renderer)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
const L = (h, e) => EN ? e : h;

// ---------- term dictionary: [he, en, plain he, plain en, model, highlight] ----------
const G = {
  spur: ['גלגל שיניים ישר (Spur Gear)', 'Spur gear', 'גלגל שיניים רגיל, השיניים ישרות. שני גלגלים כאלה על צירים מקבילים מעבירים סיבוב. פשוט וזול, אבל קצת רועש.', 'The ordinary gear with straight teeth. Two of them on parallel shafts pass rotation along. Simple and cheap, a bit noisy.', 'spur'],
  helical: ['גלגל שיניים משופע (Helical Gear)', 'Helical gear', 'כמו גלגל רגיל, אבל השיניים נוטות באלכסון. השיניים נכנסות למגע בהדרגה, ולכן הוא שקט וחזק יותר. חיסרון: הוא גם "דוחף" קצת לצד, לאורך הציר.', 'Like a spur gear but the teeth are slanted. They engage gradually, so it is quieter and stronger. Downside: it also pushes a little sideways, along the shaft.', 'helical'],
  bevel: ['גלגל שיניים קוני (Bevel Gear)', 'Bevel gear', 'גלגל בצורת חרוט. שני גלגלים כאלה מעבירים סיבוב בזווית של 90 מעלות, כמו בפינה. נמצא בדיפרנציאל של כל מכונית.', 'A cone-shaped gear. A pair of them turns the rotation through 90 degrees, like going round a corner. Found in every car differential.', 'bevel'],
  worm: ['בורג אינסופי (Worm Drive)', 'Worm drive', 'בורג שמסובב גלגל שיניים. כל סיבוב של הבורג מזיז את הגלגל בשן אחת בלבד, ולכן ההאטה חזקה מאוד. אבל יש בו הרבה חיכוך, והגלגל יוצא בזווית של 90 מעלות.', 'A screw that turns a gear wheel. Each turn of the screw moves the wheel by just one tooth, so it slows things down a lot. But it has lots of friction, and the wheel comes out at 90 degrees.', 'worm'],
  planetary: ['תמסורת פלנטרית (Planetary Gearbox)', 'Planetary gearbox', 'גלגל קטן באמצע (שמש), סביבו 3 גלגלים (לוויינים), וטבעת עם שיניים מבפנים. הכול על אותו ציר, ולכן קומפקטי וחזק. זה מה שיש בתוך המברגה.', 'A small gear in the middle (sun), 3 gears around it (planets) and a ring with teeth on the inside. Everything is on one axis, so it is compact and strong. This is what sits inside a drill.', 'planetary'],
  sun: ['גלגל שמש (Sun Gear)', 'Sun gear', 'הגלגל הקטן באמצע התמסורת הפלנטרית. המנוע מסובב אותו.', 'The small gear in the middle of a planetary set. The motor turns it.', 'planetary', 'sun'],
  planet: ['גלגלי לוויין (Planet Gears)', 'Planet gears', 'שלושה גלגלים שמסתובבים סביב השמש, כמו ירחים סביב כוכב. הם מתגלגלים בתוך הטבעת.', 'Three gears that circle the sun like moons, rolling inside the ring.', 'planetary', 'planet'],
  ring: ['טבעת שיניים פנימית (Ring Gear)', 'Ring gear', 'טבעת גדולה עם שיניים בצד הפנימי. במברגה היא קבועה לגוף ולא זזה.', 'A big ring with teeth on the inside. In a drill it is fixed to the body and does not move.', 'planetary', 'ring'],
  carrier: ['נשא (Carrier)', 'Carrier', 'הצלחת שמחזיקה את הלוויינים. כשהם מתגלגלים, היא מסתובבת לאט, וזו היציאה של השלב.', 'The plate holding the planets. As they roll, it turns slowly – that is the output of the stage.', 'planetary', 'carrier'],
  rack: ['שן ומסרק (Rack & Pinion)', 'Rack & pinion', 'גלגל שיניים שנע לאורך פס עם שיניים. הופך סיבוב לתנועה ישרה, כמו בהגה של מכונית.', 'A gear running along a toothed bar. Turns rotation into straight-line motion, like car steering.', 'rack'],
  bearing: ['מסב (Bearing)', 'Bearing', 'טבעת עם כדורים בפנים, שמאפשרת לציר להסתובב בקלות ובלי שחיקה.', 'A ring with balls inside that lets a shaft spin easily without wearing out.', 'bearing'],
  clutch: ['מצמד מומנט (Torque Clutch)', 'Torque clutch', 'כדורים שקפיץ לוחץ לתוך גומות. כשהכוח גדול מדי, הכדורים קופצים החוצה והמברגה "מחליקה" (טררר), במקום להרוס את הבורג.', 'Balls pressed into dimples by a spring. When the force gets too big they pop out and the drill slips (that rattling sound) instead of ruining the screw.', 'clutch'],
  chuck: ['צ׳אק (Chuck)', 'Chuck', 'הראש שתופס את המקדח או הביט, עם 3 לסתות שנסגרות כשמסובבים את השרוול.', 'The head that grips the drill bit with 3 jaws that close when you twist the sleeve.', 'chuck'],
  backlash: ['משחק בין שיניים (Backlash)', 'Backlash', 'רווח קטן בין שיניים של שני גלגלים. כשמשנים כיוון, יש רגע קצר שבו הגלגל זז בלי להזיז את השני.', 'A small gap between the teeth of two gears. When you reverse, one gear moves a little before it pushes the other.', 'backlash'],
  motor: ['מנוע DC (DC Motor)', 'DC motor', 'מנוע שמסתובב מהר מאוד מסוללה, אבל בכוח קטן. לכן צריך תמסורת שתאט אותו ותגביר את הכוח.', 'A motor that spins very fast from a battery but with little force – so it needs a gearbox to slow it down and boost the force.', 'motor'],
  diff: ['דיפרנציאל (Differential)', 'Differential', 'מנגנון שמחלק את הכוח בין שני הגלגלים, ומאפשר לכל אחד להסתובב במהירות אחרת בפנייה.', 'A mechanism that splits power between two wheels and lets each spin at its own speed in a turn.', 'diff'],
  pinion: ['פיניון (Pinion)', 'Pinion', 'גלגל קוני קטן בקצה ציר ההינע, שמסובב את גלגל הכתר.', 'The small bevel gear at the end of the drive shaft that turns the ring gear.', 'diff', 'pinion'],
  crown: ['גלגל כתר (Crown Gear)', 'Ring (crown) gear', 'הגלגל הקוני הגדול בדיפרנציאל. הפיניון מסובב אותו, והוא מסובב את כל הבית.', 'The big bevel gear of the differential. The pinion turns it and it turns the whole case.', 'diff', 'crown'],
  dcase: ['בית הדיפרנציאל (Differential Case)', 'Differential case', 'הקופסה שמסתובבת יחד עם גלגל הכתר ומחזיקה בפנים את הגלגלים הקטנים.', 'The box that spins with the ring gear and holds the small gears inside.', 'diff', 'case'],
  spider: ['גלגלי לוויין של הדיפרנציאל (Spider Gears)', 'Spider gears', 'שני גלגלים קוניים קטנים על פין בתוך הבית. בנסיעה ישרה הם לא מסתובבים. בפנייה הם מסתובבים ונותנים לגלגל אחד לרוץ מהר יותר.', 'Two small bevel gears on a pin inside the case. Going straight they do not turn; in a turn they spin and let one wheel run faster.', 'diff', 'spider'],
  side: ['גלגלי צד (Side Gears)', 'Side gears', 'שני גלגלים קוניים שמחוברים לצירים של הגלגלים, אחד לכל צד.', 'Two bevel gears attached to the wheel axles, one per side.', 'diff', 'side'],
  lsd: ['דיפרנציאל מוגבל החלקה (LSD)', 'Limited-slip diff (LSD)', 'דיפרנציאל עם דסקיות חיכוך. אם גלגל אחד על קרח, הוא עדיין מעביר כוח גם לגלגל השני.', 'A differential with friction plates. If one wheel is on ice, it still sends power to the other wheel.', 'diff', 'lsd'],
  axle: ['ציר גלגל (Axle Shaft)', 'Axle shaft', 'מוט פלדה שמחבר את גלגל הצד אל הגלגל של הרכב.', 'A steel bar connecting the side gear to the road wheel.', 'diff', 'axle']
};
window.MF_GLOSS = G;

// markup: {key|text} -> clickable span
const EN_OF = k => { const m = /\(([^()]*[A-Za-z][^()]*)\)\s*$/.exec(G[k][0]); return m ? m[1] : G[k][1]; };
const isHe = () => !EN;
window.mfGloss = s => { const seen = {}; return String(s).replace(/\{([a-z]+)\|([^}]+)\}(\s*\([^)]*[A-Za-z][^)]*\))?/g, (m, k, t, par) => {
  if (!G[k]) return t + (par || '');
  let en = '';
  if (isHe() && !par && !/[A-Za-z]/.test(t) && !seen[k]) en = ` <span class="gen">(${EN_OF(k)})</span>`;
  seen[k] = 1; return `<span class="gterm" data-g="${k}">${t}</span>${par || ''}${en}`; }); };
window.mfGlossPlain = s => String(s).replace(/\{([a-z]+)\|([^}]+)\}/g, '$2');

// ---------- shared renderer ----------
let R, scene, cam, ctl, root, anim = null, raf = 0;
const pop = document.createElement('div'); pop.id = 'gpop'; pop.dir = EN ? 'ltr' : 'rtl';
pop.innerHTML = `<div class="gh"><b id="gT"></b><button id="gX">✕</button></div><canvas id="gC"></canvas><p id="gP"></p><div class="gn">${L('גרור לסיבוב · גלגלת לזום', 'Drag to rotate · wheel to zoom')}</div>`;
document.body.appendChild(pop);
const MAT = {
  steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c9cf, metalness: 1, roughness: 0.28 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x5a6068, metalness: 0.85, roughness: 0.38 }),
  alu: new THREE.MeshPhysicalMaterial({ color: 0xa9afb7, metalness: 0.92, roughness: 0.4 }),
  brass: new THREE.MeshPhysicalMaterial({ color: 0xb59a6a, metalness: 1, roughness: 0.32 }),
  hi: new THREE.MeshPhysicalMaterial({ color: 0xff7a1a, metalness: 0.6, roughness: 0.35, emissive: 0x3a1500 }),
  ghost: new THREE.MeshPhysicalMaterial({ color: 0x8a9099, metalness: 0.5, roughness: 0.5, transparent: true, opacity: 0.22, depthWrite: false }),
  spring: new THREE.MeshPhysicalMaterial({ color: 0xd8b35a, metalness: 1, roughness: 0.3 })
};
function init() {
  if (R) return;
  R = new THREE.WebGLRenderer({ canvas: document.getElementById('gC'), antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x16181c);
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(R), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xdfe6ef, 0x15171a, 0.4));
  const k = new THREE.DirectionalLight(0xffffff, 2); k.position.set(5, 9, 7); scene.add(k);
  const r2 = new THREE.DirectionalLight(0x9fb6d6, 0.8); r2.position.set(-6, 3, -7); scene.add(r2);
  cam = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  ctl = new OrbitControls(cam, R.domElement); ctl.enableDamping = true; ctl.autoRotate = true; ctl.autoRotateSpeed = 1.2;
}
// ---------- geometry helpers ----------
function gearShape(z, m, inner) {
  const r = z * m / 2, ra = inner ? r - m : r + m, rf = inner ? r + 1.25 * m : r - 1.25 * m, s = new THREE.Shape(), pts = [];
  for (let i = 0; i < z; i++) { const a = i / z * Math.PI * 2, p = Math.PI * 2 / z;
    const A = [[rf, a - p * 0.5], [rf, a - p * 0.27], [ra, a - p * 0.13], [ra, a + p * 0.13], [rf, a + p * 0.27]];
    for (const [rr, aa] of A) pts.push(new THREE.Vector2(Math.cos(aa) * rr, Math.sin(aa) * rr)); }
  return pts;
}
function gear(z, m, w, o = {}) {
  const sh = new THREE.Shape(gearShape(z, m)); const hole = new THREE.Path(); hole.absarc(0, 0, o.bore || Math.max(m * 1.2, z * m * 0.12), 0, Math.PI * 2, true); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelSize: m * 0.06, bevelThickness: m * 0.06, steps: o.twist || o.cone ? 12 : 1, curveSegments: 6 });
  g.translate(0, 0, -w / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i); const zz = p.getZ(i);
    if (o.twist) { const a = zz / w * o.twist, c = Math.cos(a), s = Math.sin(a); [x, y] = [x * c - y * s, x * s + y * c]; }
    if (o.cone) { const k = 1 - (zz / w + 0.5) * o.cone; x *= k; y *= k; }
    p.setXYZ(i, x, y, zz); }
  g.computeVertexNormals();
  return new THREE.Mesh(g, o.mat || MAT.steel);
}
function ringGear(z, m, w, mat) {
  const r = z * m / 2, sh = new THREE.Shape(); sh.absarc(0, 0, r + 2.2 * m, 0, Math.PI * 2, false);
  sh.holes.push(new THREE.Path(gearShape(z, m, true).reverse()));
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, -w / 2);
  return new THREE.Mesh(g, mat || MAT.dark);
}
const cyl = (r, h, mat, seg = 40) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
function helix(r, pitch, turns, tube, mat) {
  class H extends THREE.Curve { getPoint(t) { const a = t * turns * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * pitch * turns, Math.sin(a) * r); } }
  return new THREE.Mesh(new THREE.TubeGeometry(new H(), turns * 40, tube, 10, false), mat);
}
// ---------- models ----------
const B = {
  spur(hl) { const g = new THREE.Group(), a = gear(20, 0.2, 0.8), b = gear(12, 0.2, 0.8); b.position.x = 3.2; b.rotation.z = Math.PI / 12; g.add(a, b);
    return { g, d: 7, tick: t => { a.rotation.z = t * 0.6; b.rotation.z = -t * 0.6 * 20 / 12 + Math.PI / 12; } }; },
  helical(hl) { const g = new THREE.Group(), a = gear(20, 0.2, 1.2, { twist: 0.45 }), b = gear(12, 0.2, 1.2, { twist: -0.75 }); b.position.x = 3.2; g.add(a, b);
    return { g, d: 10, tick: t => { a.rotation.z = t * 0.6; b.rotation.z = -t * 0.6 * 20 / 12 + Math.PI / 12; } }; },
  bevel(hl) { const g = new THREE.Group(), a = gear(20, 0.2, 0.8, { cone: 0.4 }), b = gear(20, 0.2, 0.8, { cone: 0.4, mat: MAT.alu });
    a.position.z = -1.75; const pb = new THREE.Group(); b.rotation.y = Math.PI / 2; b.position.x = -1.75; pb.add(b); g.add(a, pb);
    const sa = cyl(0.25, 2.5, MAT.dark, 20); sa.rotation.x = Math.PI / 2; sa.position.z = -2.8; const sb = cyl(0.25, 2.5, MAT.dark, 20); sb.rotation.z = Math.PI / 2; sb.position.x = -2.8; g.add(sa, sb);
    return { g, d: 9, tick: t => { a.rotation.z = t * 0.6; pb.rotation.x = -t * 0.6; } }; },
  worm(hl) { const g = new THREE.Group(), w = new THREE.Group(); w.add(cyl(0.45, 3, MAT.steel), helix(0.5, 0.38, 6, 0.13, MAT.steel)); w.rotation.z = Math.PI / 2; w.position.y = 1.95;
    const wh = gear(30, 0.12, 0.6, { mat: MAT.brass }); g.add(w, wh);
    return { g, d: 8, tick: t => { w.rotation.x = t * 3; wh.rotation.z = t * 3 / 30; } }; },
  planetary(hl) { const g = new THREE.Group(), m = 0.16, zs = 12, zp = 12, zr = 36, rc = (zs + zp) * m / 2;
    const S = hl === 'sun' ? MAT.hi : hl ? MAT.alu : MAT.steel, P = hl === 'planet' ? MAT.hi : MAT.steel, Rm = hl === 'ring' ? MAT.hi : hl ? MAT.ghost : MAT.dark, C = hl === 'carrier' ? MAT.hi : MAT.alu;
    const sun = gear(zs, m, 0.6, { mat: S }); const ring = ringGear(zr, m, 0.6, Rm); const car = new THREE.Group();
    const plate = cyl(rc + 0.45, 0.12, C, 48); plate.rotation.x = Math.PI / 2; plate.position.z = -0.45; car.add(plate);
    const pl = []; for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, p = gear(zp, m, 0.6, { mat: P }); p.position.set(Math.cos(a) * rc, Math.sin(a) * rc, 0); car.add(p); pl.push(p);
      const pin = cyl(0.12, 0.6, C, 16); pin.rotation.x = Math.PI / 2; pin.position.set(Math.cos(a) * rc, Math.sin(a) * rc, -0.2); car.add(pin); }
    g.add(sun, ring, car);
    return { g, d: 9, tick: t => { const ws = t * 1.2, wc = ws * zs / (zs + zr); sun.rotation.z = ws; car.rotation.z = wc; pl.forEach(p => p.rotation.z = -(ws - wc) * zs / zp + Math.PI / zp - wc); } }; },
  rack(hl) { const g = new THREE.Group(), m = 0.2, rk = new THREE.Group(), n = 26, base = new THREE.Mesh(new THREE.BoxGeometry(n * Math.PI * m, 0.5, 0.6), MAT.dark); base.position.y = -0.25 - 1.25 * m; rk.add(base);
    for (let i = 0; i < n; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(Math.PI * m * 0.45, 2.1 * m, 0.6), MAT.steel); t.position.set((i - n / 2) * Math.PI * m, -0.2 * m, 0); rk.add(t); }
    const p = gear(14, m, 0.6); p.position.y = 14 * m / 2 + 0.05; g.add(rk, p);
    return { g, d: 9, tick: t => { const a = Math.sin(t * 0.5) * 2.2; p.rotation.z = -a; rk.position.x = -a * 14 * m / 2; } }; },
  bearing(hl) { const g = new THREE.Group(), lathe = (r1, r2, w, mat) => { const pts = [new THREE.Vector2(r1, -w / 2), new THREE.Vector2(r2, -w / 2), new THREE.Vector2(r2, w / 2), new THREE.Vector2(r1, w / 2), new THREE.Vector2(r1, -w / 2)]; return new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat); };
    const out = lathe(1.55, 2, 0.8, MAT.steel), inn = lathe(0.7, 1.1, 0.8, MAT.steel), balls = new THREE.Group();
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), MAT.steel); b.position.set(Math.cos(a) * 1.33, 0, Math.sin(a) * 1.33); balls.add(b); }
    const cage = lathe(1.25, 1.42, 0.3, MAT.brass); cage.material = MAT.brass; g.add(out, inn, balls); g.rotation.x = Math.PI / 2 - 0.5;
    out.scale.set(1, 1, 1); const cut = out.clone(); cut.material = MAT.ghost;
    return { g, d: 7, tick: t => { inn.rotation.y = t; balls.rotation.y = t * 0.4; } }; },
  clutch(hl) { const g = new THREE.Group(), a = cyl(1.6, 0.25, MAT.alu, 64), b = cyl(1.6, 0.25, MAT.dark, 64); a.position.y = -0.5; b.position.y = 0.5;
    const balls = new THREE.Group(); for (let k = 0; k < 6; k++) { const q = k / 6 * Math.PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), MAT.steel); s.position.set(Math.cos(q) * 1.1, 0, Math.sin(q) * 1.1); balls.add(s); }
    const sp = helix(0.9, 0.3, 5, 0.07, MAT.spring); sp.position.y = 1.45; g.add(a, b, balls, sp);
    return { g, d: 8, tick: t => { const slip = (t % 4) > 2.5, ph = (t % 0.5) / 0.5; a.rotation.y = t; const lift = slip ? Math.sin(ph * Math.PI) * 0.18 : 0; b.position.y = 0.5 + lift; balls.position.y = lift * 0.5; sp.scale.y = 1 - lift * 0.8; balls.rotation.y = slip ? t * 0.5 : t; b.rotation.y = slip ? 0 : t; } }; },
  chuck(hl) { const g = new THREE.Group(), body = cyl(1, 2, MAT.dark, 48); body.rotation.z = Math.PI / 2; const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1, 0.8, 48), MAT.steel); nose.rotation.z = Math.PI / 2; nose.position.x = -1.4;
    const jaws = []; for (let k = 0; k < 3; k++) { const j = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.28), MAT.steel); g.add(j); jaws.push([j, k * Math.PI * 2 / 3]); }
    const bit = cyl(0.12, 3, MAT.alu, 16); bit.rotation.z = Math.PI / 2; bit.position.x = -2.4; g.add(body, nose, bit);
    return { g, d: 9, tick: t => { const r = 0.2 + (Math.sin(t) * 0.5 + 0.5) * 0.4; g.rotation.x = t * 0.5; jaws.forEach(([j, a]) => { j.position.set(-1.6, Math.cos(a) * r, Math.sin(a) * r); j.rotation.x = a; }); } }; },
  backlash(hl) { const g = new THREE.Group(), a = gear(16, 0.25, 0.6), b = gear(16, 0.25, 0.6, { mat: MAT.alu }); b.position.x = 4 + 0.08; g.add(a, b);
    return { g, d: 6, tick: t => { const s = Math.sin(t * 1.2) * 0.25, gap = 0.035; a.rotation.z = s; b.rotation.z = Math.PI / 16 - (Math.abs(s) > gap ? s - Math.sign(s) * gap : 0); } }; },
  motor(hl) { const g = new THREE.Group(), can = cyl(1, 2.4, MAT.alu, 48); can.rotation.z = Math.PI / 2; const cap = cyl(0.95, 0.3, MAT.dark, 48); cap.rotation.z = Math.PI / 2; cap.position.x = 1.35;
    const sh = cyl(0.1, 1.2, MAT.steel, 16); sh.rotation.z = Math.PI / 2; sh.position.x = -1.75; const pin = gear(10, 0.08, 0.3); pin.rotation.y = Math.PI / 2; pin.position.x = -2.2; g.add(can, cap, sh, pin);
    return { g, d: 7, tick: t => { sh.rotation.x = t * 6; pin.rotation.z = t * 6; } }; },
  diff(hl) { const g = new THREE.Group(), H = k => hl === k ? MAT.hi : (hl ? MAT.alu : MAT.steel);
    const crown = gear(36, 0.12, 0.45, { cone: 0.35, mat: H('crown') }); crown.rotation.y = -Math.PI / 2; crown.position.x = 1.1;
    const cr = new THREE.Group(); cr.add(crown);
    const pin = gear(10, 0.12, 0.45, { cone: 0.45, mat: H('pinion') }); const pg = new THREE.Group(); pin.position.z = 0; pg.add(pin); const psh = cyl(0.12, 2.2, H('pinion'), 16); psh.rotation.x = Math.PI / 2; psh.position.z = 1.1; pg.add(psh); pg.position.set(0.5, 0, 1.75);
    const cs = new THREE.Group(); const caseM = hl === 'case' ? MAT.hi : MAT.ghost; const shell = cyl(1.05, 1.8, caseM, 48); shell.rotation.z = Math.PI / 2; cs.add(shell);
    const spinM = H('spider'), sides = []; const sp = []; for (const s of [1, -1]) { const q = gear(10, 0.12, 0.35, { cone: 0.4, mat: spinM }); const gq = new THREE.Group(); q.rotation.x = s > 0 ? Math.PI / 2 : -Math.PI / 2; gq.add(q); gq.position.y = s * 0.55; cs.add(gq); sp.push([gq, s]); }
    const crossM = H('spider'); const cross = cyl(0.07, 1.6, crossM, 12); cs.add(cross);
    if (hl === 'lsd') for (const s of [1, -1]) for (let k = 0; k < 4; k++) { const d = cyl(0.8, 0.05, k % 2 ? MAT.hi : MAT.steel, 40); d.rotation.z = Math.PI / 2; d.position.x = s * (0.95 - k * 0.08); cs.add(d); }
    for (const s of [1, -1]) { const q = gear(14, 0.12, 0.35, { cone: 0.4, mat: H('side') }); q.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; const gq = new THREE.Group(); gq.add(q); gq.position.x = s * 0.55;
      const ax = cyl(0.1, 3, H('axle'), 16); ax.rotation.z = Math.PI / 2; ax.position.x = s * 2; gq.add(ax);
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.22, 16, 40), MAT.dark); wh.rotation.y = Math.PI / 2; wh.position.x = s * 3.4; gq.add(wh); g.add(gq); sides.push([gq, s]); }
    g.add(cr, cs, pg);
    return { g, d: 11, tick: t => { const wc = t * 0.8, dlt = Math.sin(t * 0.4) * 0.35 * Math.min(1, t); cr.rotation.x = wc; cs.rotation.x = wc; pin.rotation.z = -wc * 3.6;
      sides.forEach(([q, s]) => q.rotation.x = wc + s * dlt * t * 0 + s * Math.sin(t * 0.4) * 0.6);
      sp.forEach(([q, s]) => q.children[0].rotation.z = s * Math.sin(t * 0.4) * 0.84); } }; }
};
function open(key) {
  const d = G[key]; if (!d) return; init();
  if (root) { scene.remove(root); }
  const M = B[d[4]](d[5]); root = M.g; scene.add(root); anim = M;
  const box = new THREE.Box3().setFromObject(root), c = box.getCenter(new THREE.Vector3()); root.position.sub(c);
  cam.position.set(M.d * 0.55, M.d * 0.45, M.d * 0.75); ctl.target.set(0, 0, 0); ctl.update();
  document.getElementById('gT').textContent = L(d[0], d[1]); document.getElementById('gP').textContent = L(d[2], d[3]);
  pop.classList.toggle('part', key === '_p'); pop.classList.add('show');
  const cv = R.domElement, w = cv.clientWidth, h = cv.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  const t0 = performance.now(); cancelAnimationFrame(raf);
  const loop = () => { if (!pop.classList.contains('show')) return; anim.tick((performance.now() - t0) / 1000); ctl.update(); R.render(scene, cam); raf = requestAnimationFrame(loop); }; loop();
}
window.mfGlossOpen = open;
document.getElementById('gX').onclick = () => pop.classList.remove('show', 'part');
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.gterm'); if (t) { e.preventDefault(); e.stopPropagation(); open(t.dataset.g); } }, true);

// ---------- library-part explanations (plain language) ----------
const PARTS = {
  motor: ['motor', 'מנוע DC 18V (DC Motor)', '18 V electric motor', 'המנוע שמסובב את כל המברגה. מהיר מאוד (18,000 סיבובים בדקה), אבל חלש.', 'The motor that drives the whole drill – very fast (18,000 turns a minute) but weak.', 'הוא מתאים, וזה המנוע הנכון. רק צריך לחבר אחריו גלגלי שיניים שיאטו אותו פי 20 ויגבירו את הכוח.', 'It fits – this is the right motor. It just needs gears after it to slow it 20 times and boost the force.', 'בכל מברגה, מקדחה, אופניים חשמליים וצעצועים חזקים.', 'In every cordless drill, power tool, e-bike and strong toys.'],
  hobby: ['motor', 'מנוע צעצוע 3V (Toy Motor)', '3 V hobby motor', 'מנוע קטן וזול, כמו במכונית צעצוע.', 'A small cheap motor, like in a toy car.', 'הוא חלש פי 25 מהמנוע של המברגה. גם עם הגברה פי 20 יוצא כוח של בערך 1, וצריך 20. הבורג פשוט לא יזוז.', 'It is 25 times weaker than the drill motor. Even boosted 20 times it gives about 1 force unit – we need 20. The screw simply won\'t move.', 'בצעצועים, מאווררים קטנים ופרויקטים של ארדואינו.', 'In toys, small fans and Arduino projects.'],
  stepper: ['motor', 'מנוע צעד (Stepper Motor)', 'Stepper motor', 'מנוע שזז בצעדים קטנים ומדויקים.', 'A motor that moves in small precise steps.', 'הוא איטי וחלש. בלי גלגלים אין לו מספיק כוח, ועם גלגלים הוא יוצא איטי מדי. הוא טוב לדיוק, לא לכוח.', 'It is slow and weak – without gears it lacks force, with gears it is too slow. It is made for precision, not power.', 'במדפסות תלת-ממד, מכונות CNC ומצלמות אבטחה מסתובבות.', 'In 3D printers, CNC machines and rotating security cameras.'],
  pl4: ['planetary', 'שלב פלנטרי 4:1 (Planetary Stage)', 'Planetary stage 4:1', 'גלגל קטן באמצע, 3 גלגלים סביבו וטבעת. מאט פי 4 ומגביר את הכוח בערך פי 4.', 'Small middle gear, 3 around it and a ring – slows 4 times, boosts force about 4 times.', 'הוא מתאים! קטן, בקו אחד עם המנוע, ונכנס לגוף המברגה. ביחד עם 5:1 מקבלים פי 20.', 'It fits! Small, in line with the motor, fits the drill body. Together with 5:1 you get 20 times.', 'במברגות, בגירים של רובוטים, במנועי גלגלים ובתיבות הילוכים אוטומטיות.', 'In drills, robot gearboxes, wheel hub motors and automatic car gearboxes.'],
  pl5: ['planetary', 'שלב פלנטרי 5:1 (Planetary Stage)', 'Planetary stage 5:1', 'כמו 4:1, אבל עם טבעת גדולה יותר. מאט פי 5.', 'Like 4:1 but with a bigger ring – slows 5 times.', 'הוא מתאים! אחרי 4:1 מקבלים 4×5 = 20, בדיוק מה שצריך.', 'It fits! After 4:1 you get 4×5 = 20 – exactly what is needed.', 'בכל מקום שצריך האטה גדולה במקום קטן.', 'Anywhere a big slow-down must fit in a small space.'],
  clutch: ['clutch', 'מצמד מומנט (Torque Clutch)', 'Torque clutch', 'כדורים וקפיץ שמחליקים כשהכוח גדול מדי.', 'Balls and a spring that slip when force is too high.', 'הוא מתאים, ומומלץ! הוא מגן על הבורג ועל המנוע כשהבורג נכנס עד הסוף.', 'It fits and is recommended – it protects the screw and the motor when the screw is fully in.', 'בכל מברגה (הטבעת הממוספרת), ובמכונות שצריך להגן עליהן מעומס יתר.', 'In every drill (the numbered ring) and in machines that need overload protection.'],
  worm: ['worm', 'בורג אינסופי 30:1 (Worm Drive)', 'Worm drive 30:1', 'בורג שמסובב גלגל שיניים. מאט פי 30 בבת אחת.', 'A screw turning a gear wheel – slows 30 times in one go.', 'שתי בעיות: (1) הגלגל יוצא בזווית של 90 מעלות, כך שהצ׳אק היה מצביע הצידה ולא קדימה. (2) הרבה כוח הולך לאיבוד בחיכוך, עד חצי.', 'Two problems: (1) the wheel comes out at 90°, so the chuck would point sideways, not forward. (2) Lots of power is lost to friction – up to half.', 'במקומות שצריך האטה גדולה ושהמנגנון לא יסתובב אחורה לבד: מעליות, שערים חשמליים, מפתחות כיוון בגיטרה.', 'Where you need a big slow-down that can\'t back-drive by itself: lifts, electric gates, guitar tuning pegs.'],
  spur: ['spur', 'זוג גלגלי שיניים (Gear Pair)', 'Spur gear pair', 'שני גלגלי שיניים רגילים, אחד ליד השני.', 'Two ordinary gears side by side.', 'הוא מזיז את הציר הצידה (18 מ"מ), כך שהצ׳אק כבר לא בקו אחד עם המנוע והמברגה לא נכנסת לגוף הצר.', 'It shifts the shaft sideways (18 mm), so the chuck is no longer in line with the motor and won\'t fit the slim body.', 'בשעונים, במכונות כביסה, בתיבות הילוכים ידניות ובהמון מכונות.', 'In clocks, washing machines, manual gearboxes and countless machines.']
};
window.mfPartWhy = key => {
  const p = PARTS[key] || (window.MF_PARTS && window.MF_PARTS[key]); if (!p) return;
  G['_p'] = [p[1], p[2], '', '', p[0]]; open('_p');
  document.getElementById('gP').innerHTML = `<h6>${L('מה זה', 'What it is')}</h6>${L(p[3], p[4])}<h6>${L('מתאים כאן?', 'Does it fit here?')}</h6>${L(p[5], p[6])}<h6>${L('איפה כן משתמשים בו', 'Where it IS used')}</h6>${L(p[7], p[8])}`;
};
window.MF_GLOSS_OPEN_PART = window.mfPartWhy;

// Challenge 4 – Universal joint (Cardan) drive shaft
const D2R = Math.PI / 180, LEN = 4;
const ripple = st => { const a = st.p * D2R, two = st.has('cross1') && st.has('cross2') && st.has('mid'); const one = (1 / Math.cos(a) - Math.cos(a)) * 100; return !two ? one : st.flag ? 0 : one * 2; };
export default {
  key: 'c4', progKey: 'mf_prog_c4',
  title: ['אתגר 4: מפרק קרדן (Universal Joint)', 'Challenge 4: Universal Joint'],
  tag: ['בנו ציר הנעה שמתכופף בזווית ועדיין מסובב את הגלגלים בקצב אחיד', 'Build a drive shaft that bends at an angle and still turns the wheels smoothly'],
  brief: { task: ['משאית: תיבת ההילוכים גבוהה, והסרן האחורי נמוך ממנה. ציר ההנעה חייב להתכופף כדי להגיע אליו, והגלגלים חייבים להסתובב בקצב אחיד בלי רעידות.', 'A truck: the gearbox sits high and the rear axle low. The drive shaft must bend to reach it, and the wheels must turn smoothly without shaking.'],
    goals: [['בנו את 6 החלקים של ציר ההנעה', 'Build the 6 drive-shaft parts'], ['זווית של לפחות 20 מעלות כדי להגיע לסרן', 'An angle of at least 20° to reach the axle'], ['לא יותר מ-30 מעלות, אחרת המסבים נשחקים', 'No more than 30°, or the bearings wear out'], ['מהירות יציאה אחידה: שני מפרקים ומזלגות מיושרים', 'Even output speed: two joints with lined-up yokes'], ['⭐ בונוס: זווית קטנה (25 ומטה), ו-⭐ 20 בדיוק', '⭐ Bonus: a small angle (25 or less), and ⭐ exactly 20']] },
  badge: ['מהנדס ציר הנעה (Driveline Engineer)', 'Driveline Engineer'], tip: ['טיפ: זווית קטנה יותר = פחות שחיקה. נסו 20 מעלות', 'Tip: a smaller angle means less wear. Try 20°'],
  ORDER: ['inshaft', 'cross1', 'mid', 'cross2', 'outshaft', 'guard'], BAD: ['rigid', 'rubber', 'bevel'], inner: ['cross1', 'cross2', 'guard'],
  excl: [['rigid', 'cross1'], ['rubber', 'cross1'], ['bevel', 'cross1']],
  SUB: { inshaft: ['מתיבת ההילוכים', 'from the gearbox'], cross1: ['מפרק ראשון', 'first joint'], mid: ['ציר אמצעי עם החלקה', 'middle shaft, sliding'], cross2: ['מפרק שני', 'second joint'], outshaft: ['אל הסרן', 'to the axle'], guard: ['מגן שקוף ומסבים', 'see-through guard + bearings'], rigid: ['מצמד ישר', 'straight coupling'], rubber: ['דיסק גומי', 'rubber disc'], bevel: ['גלגלים קוניים', 'bevel gears'] },
  WHY_BAD: { rigid: ['מצמד קשיח לא מתכופף בכלל – הציר לא יגיע לסרן הנמוך.', 'A rigid coupling cannot bend at all – the shaft will not reach the lower axle.'], rubber: ['דיסק גומי מתכופף רק כמה מעלות. ב-20 מעלות הוא נקרע.', 'A rubber disc bends only a few degrees. At 20° it tears.'], bevel: ['גלגלים קוניים מסובבים בזווית קבועה של 90 מעלות, לא בזווית קטנה שמשתנה כשהמשאית קופצת.', 'Bevel gears turn a fixed 90°, not a small angle that changes as the truck bounces.'] },
  param: { label: ['זווית', 'Angle'], opts: [['10°', '10°', 10], ['20°', '20°', 20], ['25°', '25°', 25], ['30°', '30°', 30], ['40°', '40°', 40]], def: 2 },
  flag: ['מזלגות מיושרים (Phasing)', 'Yokes lined up (phasing)'],
  scen: { slow: ['סיבוב איטי', 'Slow turn'], fast: ['מהירות נסיעה', 'Road speed'], single: ['רק מפרק אחד', 'One joint only'] },
  cam: [2, 7, 16], target: [1.5, 0.8, 0], gridY: -2.4,
  stats: st => [[['זווית', 'Angle'], st.p + '°'], [['רעידות מהירות', 'Speed wobble'], ripple(st).toFixed(1) + '%']],
  live: st => { if (!st.running && st.placed.length < 3) return ''; const r = st.scen === 'single' ? (1 / Math.cos(st.p * D2R) - Math.cos(st.p * D2R)) * 100 : ripple(st); return `<b>${document.documentElement.lang === 'en' ? 'Output speed' : 'מהירות יציאה'}</b><div class="lbar"><i style="width:${Math.min(100, 50 + r * 2 * Math.sin(st.t * 4))}%"></i></div><small>±${(r / 2).toFixed(1)}%</small>`; },
  evaluate(st) { const r = ripple(st);
    return { ck: [
      { ok: st.p >= 20, t: ['מגיע לסרן הנמוך (לפחות 20°)', 'Reaches the low axle (at least 20°)'], v: st.p + '°' },
      { ok: st.p <= 30, t: ['המסבים לא נשחקים (עד 30°)', 'Bearings do not wear out (up to 30°)'], v: st.p + '°' },
      { ok: r < 1, t: ['מהירות יציאה אחידה', 'Even output speed'], v: r.toFixed(1) + '%' } ],
      bonus: [st.p <= 25, st.p === 20],
      fail: st.p < 20 ? ['זווית קטנה מדי: הציר לא מגיע לסרן.', 'Angle too small: the shaft does not reach the axle.'] : st.p > 30 ? ['זווית גדולה מדי: המסבים הקטנים בצלב נשחקים מהר, והרעידות גדולות.', 'Angle too big: the cross\'s small bearings wear fast and the shaking is large.'] : r >= 1 ? (st.flag ? ['עם מפרק אחד בלבד המהירות עולה ויורדת פעמיים בכל סיבוב.', 'With a single joint the speed rises and falls twice every turn.'] : ['המזלגות בציר האמצעי לא מיושרים: הרעידות של שני המפרקים מצטברות במקום לבטל זו את זו.', 'The middle shaft\'s yokes are not lined up: the two joints\' wobbles add up instead of cancelling.']) : '' }; },
  text(st) { if (st.scen === 'single') return ['מפרק אחד: הציר האמצעי מאיץ ומאט פעמיים בכל סיבוב – רואים ומרגישים רעידות', 'One joint: the middle shaft speeds up and slows down twice a turn – you see and feel it'];
    const r = ripple(st); return r < 1 ? ['שני מפרקים מיושרים: הרעידה של הראשון מתבטלת בשני – היציאה אחידה ✓', 'Two lined-up joints: the second cancels the first – smooth output ✓'] : ['היציאה לא אחידה – הגלגלים מאיצים ומאטים ✗', 'Output not even – the wheels speed up and slow down ✗']; },
  build({ THREE, M, mk, cyl, box, S }) {
    const yoke = (mat, earsOnZ) => { const y = new THREE.Group(); const base = box(0.3, 1.25, 0.45, mat); base.position.x = -0.42; y.add(base);
      for (const s of [1, -1]) { const arm = box(0.55, 0.16, 0.45, mat); arm.position.set(-0.15, s * 0.55, 0); const eye = cyl(0.2, 0.46, mat, 20); eye.rotation.x = Math.PI / 2; eye.position.set(0.08, s * 0.55, 0); y.add(arm, eye); }
      if (earsOnZ) y.rotation.x = Math.PI / 2; return y; };
    const crossM = () => { const c = new THREE.Group(); const a = cyl(0.09, 1.25, M.orange, 16), b = cyl(0.09, 1.25, M.orange, 16); b.rotation.x = Math.PI / 2; c.add(a, b, new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), M.orange));
      for (const [x, y, z] of [[0, 0.6, 0], [0, -0.6, 0], [0, 0, 0.6], [0, 0, -0.6]]) { const cap = cyl(0.13, 0.14, M.brass, 16); cap.position.set(x, y, z); if (z) cap.rotation.x = Math.PI / 2; c.add(cap); } return c; };
    { const g = mk('inshaft'); const sp = new THREE.Group(); const sh = cyl(0.22, 4, M.steel, 24); sh.rotation.z = Math.PI / 2; sh.position.x = -2.5; sp.add(sh, yoke(M.steel, false)); const gb = box(1.6, 1.6, 1.6, M.dark); gb.position.x = -5.2; g.add(sp, gb); S.in = sp; }
    { const g = mk('cross1'); S.c1 = crossM(); g.add(S.c1); }
    { const g = mk('mid'); const piv = new THREE.Group(); g.add(piv); S.midP = piv; const sp = new THREE.Group(); piv.add(sp); S.mid = sp;
      const y1 = yoke(M.alu, true); y1.rotation.y = Math.PI; y1.rotation.x = Math.PI / 2; const tube = cyl(0.28, LEN - 1.6, M.alu, 24); tube.rotation.z = Math.PI / 2; tube.position.x = LEN / 2; const slip = cyl(0.36, 0.7, M.dark, 24); slip.rotation.z = Math.PI / 2; slip.position.x = LEN * 0.68;
      const y2h = new THREE.Group(); y2h.position.x = LEN; const y2 = yoke(M.alu, false); y2h.add(y2); S.y2h = y2h; sp.add(y1, tube, slip, y2h); }
    { const g = mk('cross2'); S.c2w = new THREE.Group(); S.c2 = crossM(); S.c2w.add(S.c2); g.add(S.c2w); }
    { const g = mk('outshaft'); S.outW = new THREE.Group(); g.add(S.outW); const sp = new THREE.Group(); S.out = sp; S.outW.add(sp); const y = yoke(M.steel, false); y.rotation.y = Math.PI; const sh = cyl(0.22, 2.6, M.steel, 24); sh.rotation.z = Math.PI / 2; sh.position.x = 1.8; sp.add(y, sh);
      const ax = box(0.9, 1.2, 3.6, M.dark); ax.position.x = 3.4; S.outW.add(ax); for (const s of [1, -1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.32, 14, 36), M.rubber); w.position.set(3.4, 0, s * 2.2); for (let k = 0; k < 3; k++) { const sk = box(1.3, 0.12, 0.12, M.steel); sk.rotation.z = k * Math.PI / 3; w.add(sk); } S.outW.add(w); S.wheels = (S.wheels || []).concat(w); } }
    { const g = mk('guard'); S.gd = new THREE.Group(); g.add(S.gd); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, LEN - 1.4, 40, 1, true), M.caseM); t.rotation.z = Math.PI / 2; t.position.x = LEN / 2; S.gd.add(t);
      for (const x of [0.9, LEN - 0.9]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 40), M.dark); r.rotation.y = Math.PI / 2; r.position.x = x; S.gd.add(r); }
      const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), M.caseM); hb.rotation.z = Math.PI / 2; hb.position.x = LEN / 2; S.gd.add(hb); const ft = box(0.4, 1.4, 0.9, M.dark); ft.position.set(LEN / 2, -0.95, 0); S.gd.add(ft); }
    { const g = mk('rigid'); const c = cyl(0.45, 0.6, M.bad, 6); c.rotation.z = Math.PI / 2; g.add(c); }
    { const g = mk('rubber'); const c = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.2, 10, 6), M.bad); c.rotation.y = Math.PI / 2; g.add(c); }
    { const g = mk('bevel'); const c = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.5, 20), M.bad); c.rotation.z = -Math.PI / 2; g.add(c); } },
  animate(st, dt, { S }) { const a = st.p * D2R; S.midP.rotation.z = a; const J2 = [LEN * Math.cos(a), LEN * Math.sin(a)];
    S.c2w.position.set(...J2, 0); S.outW.position.set(...J2, 0); S.gd.rotation.z = a; S.y2h.rotation.x = st.flag ? 0 : Math.PI / 2;
    if (!st.running && st.placed.length < 2) return; const w = st.scen === 'fast' ? 6 : 1.4; S.th = (S.th || 0) + w * dt; const th = S.th;
    const ph1 = Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(a)), u = n => n + Math.round((th - n) / (2 * Math.PI)) * 2 * Math.PI;
    const p1 = u(ph1); let out = st.flag ? th : u(Math.atan2(Math.sin(p1), Math.cos(p1) * Math.cos(a)));
    if (st.scen === 'single') out = p1;
    S.in.rotation.x = th; S.mid.rotation.x = p1; S.c1.rotation.x = th; S.c2.rotation.x = out; S.out.rotation.x = out; (S.wheels || []).forEach(w => w.rotation.z = -out * 0.4); }
};

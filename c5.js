// Challenge 5 – Camshaft, followers, valves and springs (valve float)
const XS = [-3, -1, 1, 3], PH = [0, Math.PI, Math.PI / 2, Math.PI * 1.5], CY = 3.4, RB = 0.5;
const RPM = { idle: 800, cruise: 3000, red: 6500 };
const limit = st => 2500 * st.p * (st.flag ? 0.9 : 1);
const floats = st => st.has('springs') && RPM[st.scen || 'red'] > limit(st) || !st.has('springs');
export default {
  key: 'c5', progKey: 'mf_prog_c5',
  title: ['אתגר 5: גל זיזים (Camshaft)', 'Challenge 5: Camshaft'],
  tag: ['בנו את ראש המנוע שפותח וסוגר את השסתומים בזמן הנכון – גם בסל״ד גבוה', 'Build an engine head that opens and closes the valves on time – even at high revs'],
  brief: { task: ['מנוע של אופנוע מגיע ל-6,500 סיבובים בדקה. בכל סיבוב גל הזיזים צריך לפתוח ולסגור כל שסתום. אם הקפיצים חלשים, השסתומים לא מספיקים לחזור – זה נקרא "ריחוף שסתומים" והמנוע מאבד כוח ואפילו נהרס.', 'A motorbike engine reaches 6,500 turns per minute. Every turn the camshaft must open and close each valve. If the springs are weak the valves cannot keep up – that is "valve float", and the engine loses power or even breaks.'],
    goals: [['בנו את 6 החלקים של ראש המנוע', 'Build the 6 engine-head parts'], ['אין ריחוף שסתומים ב-6,500 סל״ד', 'No valve float at 6,500 rpm'], ['קפיץ לא קשה מדי – אחרת הזיזים נשחקים', 'Spring not too stiff – or the lobes wear out'], ['⭐ בונוס: זיז הרמה גבוהה (יותר אוויר), ו-⭐ קפיץ 3 בדיוק', '⭐ Bonus: high-lift lobes (more air), and ⭐ spring exactly 3']] },
  badge: ['מכוון מנועים (Engine Tuner)', 'Engine Tuner'], tip: ['טיפ: הריצו את תרחיש "סל״ד מקסימלי" וצפו בשסתומים', 'Tip: run the "Redline" scenario and watch the valves'],
  ORDER: ['head', 'shaft', 'followers', 'valves', 'springs', 'belt'], BAD: ['round', 'weak', 'vbelt'], inner: ['followers', 'valves', 'springs'],
  excl: [['round', 'shaft'], ['weak', 'springs'], ['vbelt', 'belt']],
  SUB: { head: ['ראש מנוע שקוף', 'see-through head'], shaft: ['4 זיזים בצורת ביצה', '4 egg-shaped lobes'], followers: ['כוסות על הזיזים', 'cups on the lobes'], valves: ['פותחים לאוויר', 'open for air'], springs: ['מחזירים את השסתום', 'close the valve'], belt: ['רצועה משוננת', 'toothed belt'], round: ['דיסקים עגולים', 'round discs'], weak: ['קפיצים רכים', 'soft springs'], vbelt: ['רצועה חלקה', 'smooth belt'] },
  WHY_BAD: { round: ['דיסק עגול לגמרי לא דוחף כלום – המרחק מהמרכז זהה בכל מקום, אז השסתום לא זז.', 'A perfectly round disc pushes nothing – it is the same distance from the centre all round, so the valve never moves.'], weak: ['קפיץ רך לא מספיק להחזיר את השסתום מהר – כבר בסל״ד בינוני יש ריחוף.', 'A soft spring cannot snap the valve shut fast enough – it floats even at medium revs.'], vbelt: ['רצועה חלקה מחליקה קצת, והזמן של השסתומים זז ביחס לבוכנה. צריך רצועה משוננת שלא מחליקה אף פעם.', 'A smooth belt slips a little, so valve timing drifts from the piston. A toothed belt never slips.'] },
  param: { label: ['קשיחות קפיץ', 'Spring stiffness'], opts: [['1 רך', '1 soft', 1], ['2', '2', 2], ['3', '3', 3], ['4', '4', 4], ['5 קשה', '5 stiff', 5]], def: 1 },
  flag: ['זיז הרמה גבוהה (High-lift)', 'High-lift lobes'],
  scen: { idle: ['סרק 800', 'Idle 800'], cruise: ['שיוט 3,000', 'Cruise 3,000'], red: ['סל״ד מקסימלי 6,500', 'Redline 6,500'] }, scenDef: 'idle',
  cam: [-8, 8, 20], target: [-1, 0.8, 0], gridY: -3.6,
  stats: st => [[['סל״ד עד ריחוף', 'Float rpm'], Math.round(limit(st)).toLocaleString()], [['סל״ד עכשיו', 'Rpm now'], RPM[st.scen || 'idle'].toLocaleString()]],
  live: st => { if (st.placed.length < 2) return ''; const en = document.documentElement.lang === 'en', f = st.has('springs') && RPM[st.scen || 'idle'] > limit(st);
    return `<b>${en ? 'Valves' : 'שסתומים'}</b><div style="color:${f ? '#ff5a5a' : '#5ad17a'}">${f ? (en ? '⚠ Valve float!' : '⚠ ריחוף שסתומים!') : (en ? '✓ Following the cam' : '✓ עוקבים אחרי הזיז')}</div><small>${RPM[st.scen || 'idle']} rpm</small>`; },
  evaluate(st) { const lim = limit(st);
    return { ck: [
      { ok: lim >= 6500, t: ['אין ריחוף ב-6,500 סל״ד', 'No float at 6,500 rpm'], v: Math.round(lim) + '' },
      { ok: st.p <= 4, t: ['הזיזים לא נשחקים (קפיץ עד 4)', 'Lobes do not wear (spring up to 4)'], v: st.p + '' } ],
      bonus: [st.flag, st.p === 3],
      fail: lim < 6500 ? ['הקפיצים חלשים מדי: בסל״ד גבוה השסתום לא חוזר בזמן, "מרחף", ויכול אפילו לפגוע בבוכנה.', 'Springs too weak: at high revs the valve does not close in time, it "floats" and can even hit the piston.'] : st.p > 4 ? ['קפיץ קשה מדי: הזיזים והעוקבים נלחצים חזק מאוד ונשחקים מהר, והמנוע מבזבז כוח על חיכוך.', 'Spring too stiff: lobes and followers press very hard and wear fast, and the engine wastes power on friction.'] : '' }; },
  text(st) { const f = st.has('springs') && RPM[st.scen || 'idle'] > limit(st); return f ? ['השסתומים לא מספיקים לחזור – ריחוף! ✗', 'The valves cannot keep up – float! ✗'] : ['כל זיז דוחף את השסתום שלו, והקפיץ מחזיר אותו ✓', 'Each lobe pushes its valve and the spring brings it back ✓']; },
  build({ THREE, M, mk, cyl, box, helix, S }) {
    const lobeGeo = () => { const s = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = RB + 0.42 * Math.max(0, Math.cos(a)) ** 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false }); };
    { const g = mk('head'); const blk = box(9.4, 1.6, 2.6, M.caseM); blk.position.y = 0.9; g.add(blk); const cov = box(9.4, 0.15, 2.6, M.caseM); cov.position.y = 4.5; g.add(cov);
      for (const z of [1.25, -1.25]) { const w = box(9.4, 2.9, 0.08, M.caseM); w.position.set(0, 3.05, z); g.add(w); }
      const low = box(9.4, 1.6, 2.6, M.dark); low.position.y = -1.3; g.add(low); for (const x of XS) { const bo = cyl(0.8, 1.5, M.steel, 28); bo.position.set(x, -1.3, 0); g.add(bo); } }
    { const g = mk('shaft'); const sp = new THREE.Group(); sp.position.y = CY; g.add(sp); S.cs = sp; const core = cyl(0.25, 9.2, M.steel, 20); core.rotation.z = Math.PI / 2; sp.add(core);
      XS.forEach((x, i) => { const l = new THREE.Mesh(lobeGeo(), M.steel); l.rotation.y = Math.PI / 2; l.position.x = x - 0.25; const h = new THREE.Group(); h.rotation.x = PH[i]; h.add(l); sp.add(h); }); }
    S.fol = []; S.val = []; S.spr = [];
    { const g = mk('followers'); XS.forEach(x => { const f = cyl(0.42, 0.45, M.orange, 24); f.position.x = x; g.add(f); S.fol.push(f); }); }
    { const g = mk('valves'); XS.forEach(x => { const v = new THREE.Group(); const st = cyl(0.08, 2.6, M.steel, 12); st.position.y = 1.3; const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.1, 0.18, 24), M.alu); v.add(st, hd); v.position.x = x; g.add(v); S.val.push(v); }); }
    { const g = mk('springs'); XS.forEach(x => { const s = helix(0.32, 0.17, 7, 0.045, M.spring); s.position.set(x, 1.7, 0); g.add(s); S.spr.push(s); }); }
    { const g = mk('belt'); const p1 = cyl(0.75, 0.4, M.dark, 32); p1.rotation.z = Math.PI / 2; p1.position.set(-5, CY, 0); const p2 = cyl(0.42, 0.4, M.dark, 32); p2.rotation.z = Math.PI / 2; p2.position.set(-5, -2.6, 0); g.add(p1, p2); S.pul = [p1, p2];
      for (const z of [0.6, -0.6]) { const b = box(0.38, CY + 2.6, 0.07, M.rubber); b.position.set(-5, (CY - 2.6) / 2, z * (z > 0 ? 1.2 : 1.2) * 0.62); g.add(b); }
      for (let i = 0; i < 12; i++) { const t = box(0.1, 0.4, 0.12, M.steel); const a = i / 12 * Math.PI * 2; t.position.set(Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75); t.rotation.y = -a; p1.add(t); } }
    { const g = mk('round'); const d = cyl(0.55, 0.4, M.bad, 32); d.rotation.z = Math.PI / 2; g.add(d); }
    { const g = mk('weak'); g.add(helix(0.3, 0.3, 4, 0.025, M.bad)); }
    { const g = mk('vbelt'); const t = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.07, 8, 32), M.bad); g.add(t); } },
  animate(st, dt, { S }) { const rpm = RPM[st.scen || 'idle'], spd = st.running || st.placed.length >= 2 ? rpm / 800 * 1.6 : 0; S.a = (S.a || 0) + spd * dt; const a = S.a;
    const hasCam = st.has('shaft'), fl = st.has('springs') && rpm > limit(st), L = st.flag ? 0.52 : 0.42; S.cs.rotation.x = a; S.pul[0].rotation.x = a; S.pul[1].rotation.x = 2 * a; S.lift = S.lift || [0, 0, 0, 0];
    XS.forEach((x, i) => { const th = a + PH[i]; let lift = hasCam ? L * Math.max(0, -Math.sin(th)) ** 2 : 0;
      if (fl) lift = Math.max(lift, S.lift[i] - dt * 0.6) + 0.04 * Math.abs(Math.sin(a * 9 + i)); S.lift[i] = lift;
      const top = CY - RB - lift; S.fol[i].position.y = top - 0.22; S.val[i].position.y = top - 3.0; S.spr[i].scale.y = Math.max(0.45, (top - 0.45 - 1.7) / (0.17 * 7)); }); }
};

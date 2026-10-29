// Challenge 6 – Four-bar linkage (windshield wiper)
const G = 4, B = 4, R = 2, D2 = -3.2;
const solve = (a, t) => { const Bx = a * Math.cos(t), By = a * Math.sin(t), dx = G - Bx, dy = -By, d = Math.hypot(dx, dy); if (d > B + R - 1e-6 || d < Math.abs(B - R) + 1e-6) return null;
  const l = (B * B - R * R + d * d) / (2 * d), h = Math.sqrt(Math.max(0, B * B - l * l)); const c1 = [Bx + dx * l / d - dy * h / d, By + dy * l / d + dx * h / d], c2 = [Bx + dx * l / d + dy * h / d, By + dy * l / d - dx * h / d]; return { B: [Bx, By], C: c1[1] > c2[1] ? c1 : c2 }; };
const sweep = a => { let mn = 999, mx = -999; for (let i = 0; i < 360; i++) { const s = solve(a, i / 360 * Math.PI * 2); if (!s) return 360; const f = Math.atan2(s.C[1], s.C[0] - G) * 180 / Math.PI; mn = Math.min(mn, f); mx = Math.max(mx, f); } return Math.round(mx - mn); };
const gras = a => { const L = [a, B, R, G].sort((x, y) => x - y); return { sl: +(L[0] + L[3]).toFixed(1), pq: +(L[1] + L[2]).toFixed(1), crank: a === L[0] }; };
const T = { 0.5: 0, 1: 0, 1.2: 0, 1.4: 0, 2: 0, 3: 0 };
export default {
  key: 'c6', progKey: 'mf_prog_c6',
  title: ['אתגר 6: מנגנון ארבעה מוטות (Four-Bar)', 'Challenge 6: Four-Bar Linkage'],
  tag: ['בנו מגב לשמשה: מנוע שמסתובב סביב-סביב, ומגב שמתנדנד הלוך וחזור', 'Build a windshield wiper: a motor that spins round and round, and a wiper that swings back and forth'],
  brief: { task: ['המנוע של המגב מסתובב כל הזמן באותו כיוון, אבל המגב צריך לנוע הלוך וחזור על השמשה. ארבעה מוטות מחוברים בצירים הופכים סיבוב לתנודה. בחרו את אורך הארכובה כך שהמגב ינקה מספיק מהשמשה ולא ייתקע.', 'The wiper motor spins one way all the time, but the wiper must swing back and forth over the glass. Four bars joined by pins turn spinning into swinging. Pick the crank length so the wiper cleans enough glass and never jams.'],
    goals: [['בנו את 6 החלקים של המגב', 'Build the 6 wiper parts'], ['הארכובה מסתובבת סיבוב שלם (כלל גרסהוף)', 'The crank turns a full circle (Grashof rule)'], ['המגב מנקה בין 60 ל-100 מעלות', 'The wiper sweeps between 60° and 100°'], ['⭐ בונוס: מגב שני מחובר, ו-⭐ ניקוי רחב (ארכובה 1.4)', '⭐ Bonus: a linked second wiper, and ⭐ a wide sweep (crank 1.4)']] },
  badge: ['מהנדס מנגנונים (Linkage Engineer)', 'Linkage Engineer'], tip: ['טיפ: ארכובה ארוכה יותר = תנודה רחבה יותר, אבל ארוכה מדי ננעלת', 'Tip: a longer crank swings wider, but too long jams'],
  ORDER: ['frame', 'motor', 'crank', 'coupler', 'rocker', 'wiper'], BAD: ['triangle', 'rope', 'band'], inner: ['crank', 'coupler', 'rocker'],
  excl: [['triangle', 'coupler'], ['rope', 'coupler'], ['band', 'coupler']],
  SUB: { frame: ['שמשה ומסגרת', 'glass & frame'], motor: ['מסתובב תמיד', 'always spinning'], crank: ['מוט קצר', 'short bar'], coupler: ['מוט מחבר ארוך', 'long link'], rocker: ['מתנדנד', 'swings'], wiper: ['זרוע ולהב גומי', 'arm & rubber blade'], triangle: ['משולש קשיח', 'rigid triangle'], rope: ['חבל', 'rope'], band: ['גומייה', 'rubber band'] },
  WHY_BAD: { triangle: ['שלושה מוטות בצורת משולש לא יכולים לזוז בכלל – משולש הוא צורה קשיחה. צריך ארבעה מוטות.', 'Three bars in a triangle cannot move at all – a triangle is rigid. You need four bars.'], rope: ['חבל יכול רק למשוך, לא לדחוף. בחצי מהסיבוב הוא מתרופף והמגב לא חוזר.', 'A rope can only pull, never push. For half of each turn it goes slack and the wiper does not come back.'], band: ['גומייה נמתחת, אז המגב מפגר ומקפץ במקום לנוע בצורה מדויקת.', 'A rubber band stretches, so the wiper lags and bounces instead of moving exactly.'] },
  param: { label: ['אורך ארכובה', 'Crank length'], opts: [['0.5', '0.5', 0.5], ['1.0', '1.0', 1], ['1.2', '1.2', 1.2], ['1.4', '1.4', 1.4], ['2.0', '2.0', 2], ['3.0', '3.0', 3]], def: 0 },
  flag: ['מגב שני מחובר (Second Wiper)', 'Linked second wiper'],
  scen: { slow: ['מהירות 1', 'Speed 1'], fast: ['מהירות 2 (גשם חזק)', 'Speed 2 (heavy rain)'] }, scenDef: 'slow',
  cam: [1.5, 3, 21], target: [1.5, 2.4, 0], gridY: -2.2,
  stats: st => { const g = gras(st.p), s = sweep(st.p); return [[['ניקוי', 'Sweep'], s >= 360 ? '—' : s + '°'], [['קצר+ארוך', 'Short+long'], '\u2066' + g.sl + (g.sl < g.pq ? ' < ' : g.sl === g.pq ? ' = ' : ' > ') + g.pq + '\u2069']]; },
  live: st => { if (st.placed.length < 3) return ''; const en = document.documentElement.lang === 'en', g = gras(st.p), s = sweep(st.p);
    const ok = g.sl < g.pq && g.crank; return `<b>${en ? 'Grashof check' : 'בדיקת גרסהוף'}</b><div>${en ? 'shortest + longest' : 'קצר + ארוך'} = ${g.sl}<br>${en ? 'other two' : 'שני האחרים'} = ${g.pq}</div><div style="color:${ok ? '#5ad17a' : '#ff5a5a'}">${ok ? (en ? '✓ crank turns fully' : '✓ הארכובה מסתובבת') : g.sl === g.pq ? (en ? '⚠ change point – may flip' : '⚠ נקודת מעבר – עלול להתהפך') : (en ? '✗ crank jams' : '✗ הארכובה נתקעת')}</div><small>${en ? 'Sweep' : 'ניקוי'}: ${s >= 360 ? '—' : s + '°'}</small>`; },
  evaluate(st) { const g = gras(st.p), s = sweep(st.p), full = g.sl < g.pq && g.crank;
    return { ck: [
      { ok: full, t: ['הארכובה מסתובבת סיבוב שלם', 'The crank turns a full circle'], v: g.sl + ' / ' + g.pq },
      { ok: full && s >= 60, t: ['המגב מנקה מספיק (60° ומעלה)', 'The wiper cleans enough (60° or more)'], v: s >= 360 ? '—' : s + '°' },
      { ok: full && s <= 100, t: ['המגב לא יוצא מהשמשה (עד 100°)', 'The wiper stays on the glass (up to 100°)'], v: s >= 360 ? '—' : s + '°' } ],
      bonus: [st.flag, st.p === 1.4],
      fail: !full ? (g.sl === g.pq ? ['ארכובה 2.0: הקצר והארוך יחד שווים בדיוק לשני האחרים. כל המוטות נהיים ישרים בשורה אחת, והמגב יכול "להתהפך" לצד הלא נכון.', 'Crank 2.0: shortest plus longest exactly equal the other two. All bars line up flat and the wiper can flip to the wrong side.'] : ['הארכובה ארוכה מדי: הקצר והארוך יחד יותר מהשניים האחרים, אז המוטות לא מגיעים והארכובה נתקעת באמצע הסיבוב.', 'Crank too long: shortest plus longest are more than the other two, so the bars cannot reach and the crank jams mid-turn.']) : s < 60 ? ['ארכובה קצרה מדי: המגב זז רק קצת ומנקה פס צר.', 'Crank too short: the wiper barely moves and cleans a thin strip.'] : '' }; },
  text(st) { const g = gras(st.p), full = g.sl < g.pq && g.crank; return full ? ['המנוע מסתובב סביב-סביב, והמגב מתנדנד הלוך וחזור ✓', 'The motor spins round, the wiper swings back and forth ✓'] : ['המוטות לא מגיעים – המנגנון נתקע ✗', 'The bars cannot reach – the linkage jams ✗']; },
  build({ THREE, M, mk, cyl, box, bar, S }) {
    const pin = (x, y, z = 0.25) => { const p = cyl(0.14, 0.6, M.brass, 16); p.rotation.x = Math.PI / 2; p.position.set(x, y, z); return p; };
    { const g = mk('frame'); const gl = box(15, 6.5, 0.12, M.caseM); gl.position.set(0.5, 4, -0.7); const cowl = box(15, 1.2, 0.5, M.caseM); cowl.position.set(0.5, -0.1, -0.25); const fr = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 4), M.dark); g.add(gl, cowl);
      for (const [x, y, w, h] of [[0.5, 7.3, 15.2, 0.2], [-7.1, 4, 0.2, 6.8], [8.1, 4, 0.2, 6.8]]) { const e = box(w, h, 0.25, M.dark); e.position.set(x, y, -0.7); g.add(e); } }
    { const g = mk('motor'); const m = cyl(0.6, 1.2, M.dark, 24); m.rotation.x = Math.PI / 2; m.position.z = -0.6; const gb = box(1.1, 1.1, 0.5, M.alu); gb.position.z = -0.1; g.add(m, gb); }
    { const g = mk('crank'); S.cr = bar(0.32, 0.18, M.orange); S.cr.g.position.z = 0.3; g.add(S.cr.g, pin(0, 0)); S.pB = pin(0, 0, 0.45); g.add(S.pB); }
    { const g = mk('coupler'); S.co = bar(0.26, 0.14, M.steel); S.co.g.position.z = 0.55; g.add(S.co.g); S.pC = pin(0, 0, 0.55); g.add(S.pC); }
    { const g = mk('rocker'); S.ro = bar(0.32, 0.18, M.orange); S.ro.g.position.z = 0.3; g.add(S.ro.g, pin(G, 0)); }
    { const g = mk('wiper'); const mkW = () => { const w = new THREE.Group(); const arm = box(5.6, 0.16, 0.12, M.steel); arm.position.x = 2.8; const bl = box(0.12, 0.12, 0.3, M.rubber); const blade = box(4.6, 0.22, 0.22, M.orange); blade.position.set(4.3, 0, -0.45); w.add(arm, blade); return w; };
      S.w1 = mkW(); S.w1.position.set(G, 0, 0.05); S.w2 = mkW(); S.w2.position.set(D2, 0, 0.05); S.lk = bar(0.12, 0.08, M.steel); S.lk.g.position.z = 0.75; S.p2 = pin(D2, 0); g.add(S.w1, S.w2, S.lk.g, S.p2); }
    { const g = mk('triangle'); const t = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 6, 3), M.bad); g.add(t); }
    { const g = mk('rope'); const t = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 24), M.bad); g.add(t); }
    { const g = mk('band'); const t = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.1, 8, 24), M.bad); t.scale.y = 0.4; g.add(t); } },
  animate(st, dt, { S }) { const a = st.p, V = (x, y) => ({ x, y }); S.dir = S.dir || 1; S.th = S.th ?? 1.2;
    const w = (st.running || st.placed.length >= 3) ? (st.scen === 'fast' ? 3.2 : 1.6) : 0; let nt = S.th + S.dir * w * dt, s = solve(a, nt);
    if (!s) { S.dir *= -1; nt = S.th; s = solve(a, nt) || S.last; } S.th = nt; if (!s) return; S.last = s;
    S.cr.set(V(0, 0), V(...s.B)); S.co.set(V(...s.B), V(...s.C)); S.ro.set(V(G, 0), V(...s.C)); S.pB.position.set(...s.B, 0.45); S.pC.position.set(...s.C, 0.6);
    const f = Math.atan2(s.C[1], s.C[0] - G); S.w1.rotation.z = f; S.w2.rotation.z = f; S.w2.visible = st.flag; S.lk.g.visible = st.flag; S.p2.visible = st.flag;
    S.lk.set(V(...s.C), V(D2 + R * Math.cos(f), R * Math.sin(f))); }
};

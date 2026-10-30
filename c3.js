// Challenge 3 – Ratchet wrench + torque clutch
export default {
  key: 'c3', progKey: 'mf_prog_c3',
  title: ['אתגר 3: ראצ׳ט ומצמד (Ratchet & Clutch)', 'Challenge 3: Ratchet & Clutch'],
  tag: ['בנו מפתח ראצ׳ט שמסובב בורג לכיוון אחד, ומצמד שמחליק לפני שהבורג נשבר', 'Build a ratchet wrench that turns one way, with a clutch that slips before the bolt breaks'],
  brief: { task: ['מפתח לבורג של אופניים. הבורג צריך להיות מהודק בכוח 12 N·m. מעל 18 N·m הבורג נשבר. אין מקום לסובב את הידית סיבוב שלם.', 'A wrench for a bicycle bolt. It must be tightened to 12 N·m; above 18 N·m it breaks. There is no room to swing the handle a full turn.'],
    goals: [['בנו את 6 החלקים של המפתח', 'Build the 6 wrench parts'], ['תנועת הידית חזרה לא משחררת את הבורג', 'The return swing must not loosen the bolt'], ['כוון את המצמד כך שהבורג יהיה הדוק אבל לא יישבר', 'Set the clutch so the bolt is tight but does not break'], ['⭐ בונוס: גלגל עם 72 שיניים (תנועה קטנה מספיקה)', '⭐ Bonus: a 72-tooth wheel (a small swing is enough)'], ['⭐ בונוס: מצמד מכוון בדיוק ל-12', '⭐ Bonus: clutch set to exactly 12']] },
  badge: ['מהנדס ראצ׳ט (Ratchet Engineer)', 'Ratchet Engineer'], tip: ['טיפ: נסו 72 שיניים, וכוונו את המצמד בדיוק ל-12', 'Tip: try 72 teeth and set the clutch to exactly 12'],
  ORDER: ['head', 'wheel', 'pawl', 'spring', 'clutch', 'drive'], BAD: ['gearpair', 'friction', 'rigid'], inner: ['wheel', 'pawl', 'spring', 'clutch'],
  excl: [['rigid', 'clutch'], ['gearpair', 'wheel'], ['friction', 'wheel']],
  SUB: { head: ['בית שקוף עם ידית', 'see-through head + handle'], wheel: ['גלגל עם שיניים משופעות', 'saw-tooth wheel'], pawl: ['לשונית שננעלת בשן', 'catch that locks a tooth'], spring: ['לוחץ את הלשונית', 'presses the pawl'], clutch: ['מחליק בכוח שנבחר', 'slips at the set force'], drive: ['ראש מרובע, בוקסה ובורג', 'square drive, socket, bolt'], gearpair: ['גלגלי שיניים רגילים', 'plain gears'], friction: ['דסקית חיכוך', 'friction pad'], rigid: ['חיבור קשיח', 'solid coupling'] },
  WHY_BAD: { gearpair: ['גלגלי שיניים רגילים נועלים לשני הכיוונים: בתנועה חזרה הבורג משתחרר. צריך גלגל ראצ׳ט ולשונית.', 'Plain gears lock both ways: the return swing undoes the bolt. You need a ratchet wheel and pawl.'], friction: ['דסקית חיכוך מחליקה לשני הכיוונים ולא מחזיקה כוח גדול. הבורג לא יתהדק.', 'A friction pad slips both ways and cannot hold much force. The bolt will not get tight.'], rigid: ['חיבור קשיח לא מחליק אף פעם. אפשר להמשיך ללחוץ עד שהבורג נשבר.', 'A solid coupling never slips. You can keep pushing until the bolt snaps.'] },
  param: { label: ['כיוון המצמד', 'Clutch setting'], opts: [['6 N·m', '6 N·m', 6], ['9 N·m', '9 N·m', 9], ['12 N·m', '12 N·m', 12], ['15 N·m', '15 N·m', 15], ['20 N·m', '20 N·m', 20]], def: 0 },
  flag: ['גלגל עדין 72 שיניים', 'Fine 72-tooth wheel'],
  scen: { tight: ['הידוק', 'Tighten'], back: ['תנועה חזרה', 'Return swing'], seat: ['הבורג הגיע לסוף', 'Bolt seated'] },
  cam: [2.5, 3.5, 11], target: [0.6, 0.3, 0.8], gridY: -2.2,
  stats: st => [[['כיוון המצמד', 'Clutch'], st.p + ' N·m'], [['זווית לכל קליק', 'Angle per click'], (st.flag ? 5 : 15) + '°']],
  evaluate(st) { const ok = st.has('wheel') && st.has('pawl') && st.has('spring'), cl = st.has('clutch');
    return { ck: [
      { ok, t: ['תנועה חזרה לא משחררת את הבורג', 'Return swing does not loosen the bolt'], v: st.has('gearpair') ? 'gears lock both ways' : '' },
      { ok: cl && st.p >= 10, t: ['הבורג מהודק לפחות 10 N·m', 'Bolt tightened to at least 10 N·m'], v: cl ? st.p + ' N·m' : '' },
      { ok: cl && st.p <= 18, t: ['הבורג לא נשבר (עד 18 N·m)', 'Bolt does not break (up to 18 N·m)'], v: !cl ? (st.has('rigid') ? 'no slip' : '') : st.p + ' N·m' } ],
      bonus: [st.flag, st.p === 12],
      fail: !cl ? ['בלי מצמד אין שום דבר שעוצר את הכוח – קל לשבור את הבורג.', 'Without a clutch nothing limits the force – it is easy to snap the bolt.'] : st.p < 10 ? ['המצמד מחליק מוקדם מדי: הבורג נשאר רופף ויכול ליפול.', 'The clutch slips too early: the bolt stays loose and may fall out.'] : st.p > 18 ? ['המצמד מחליק מאוחר מדי: הבורג נשבר לפני שהמצמד מחליק.', 'The clutch slips too late: the bolt snaps before the clutch slips.'] : '' }; },
  text(st) { const r = st.has('wheel') && st.has('pawl') && st.has('spring');
    if (st.scen === 'back') return r ? ['תנועה חזרה: הלשונית קופצת מעל השיניים (קליק-קליק) והבורג לא זז ✓', 'Return: the pawl skips over the teeth (click-click), the bolt stays ✓'] : st.has('gearpair') ? ['תנועה חזרה עם גלגלים רגילים: הבורג משתחרר! ✗', 'Return with plain gears: the bolt comes undone! ✗'] : ['חסרים גלגל ראצ׳ט, לשונית או קפיץ', 'Ratchet wheel, pawl or spring missing'];
    if (st.scen === 'seat') return st.has('clutch') ? (st.p > 18 ? ['המצמד מכוון גבוה מדי – הבורג נשבר! ✗', 'Clutch set too high – the bolt snaps! ✗'] : st.p < 10 ? ['המצמד מחליק לפני שהבורג הדוק ✗', 'The clutch slips before the bolt is tight ✗'] : ['הבורג הדוק – הכדורים קופצים והמצמד מחליק ✓', 'Bolt tight – the balls jump and the clutch slips ✓']) : ['אין מצמד – הכוח ממשיך לגדול עד שמשהו נשבר ✗', 'No clutch – force keeps rising until something breaks ✗'];
    return ['הידוק: דוחפים את הידית קדימה, הלשונית תופסת שן והבורג מסתובב', 'Tighten: push the handle, the pawl catches a tooth and the bolt turns']; },
  build({ THREE, M, mk, cyl, box, helix, S }) {
    const saw = (n, rt, rr, d, mat) => { const s = new THREE.Shape(); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2; const p = [Math.cos(a) * rt, Math.sin(a) * rt], q = [Math.cos(b) * rr, Math.sin(b) * rr]; i ? s.lineTo(...p) : s.moveTo(...p); s.lineTo(...q); }
      const h = new THREE.Path(); h.absarc(0, 0, 0.3, 0, Math.PI * 2, true); s.holes.push(h); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return new THREE.Mesh(g, mat); };
    { const g = mk('head'); const sh = cyl(1.55, 0.8, M.caseM, 56); sh.rotation.x = Math.PI / 2; g.add(sh); const hd = box(5.2, 0.55, 0.5, M.dark); hd.position.x = 4.1; g.add(hd); const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 2.6, 6, 16), M.rubber); grip.rotation.z = Math.PI / 2; grip.position.x = 5.2; g.add(grip);
      const sw = cyl(0.22, 0.2, M.orange, 20); sw.rotation.x = Math.PI / 2; sw.position.set(0.2, 1.2, 0.45); g.add(sw); }
    { const g = mk('wheel'); S.w24 = saw(24, 1.0, 0.82, 0.42, M.steel); S.w72 = saw(72, 1.0, 0.93, 0.42, M.steel); S.w72.visible = false; g.add(S.w24, S.w72); const hub = cyl(0.32, 0.6, M.alu, 24); hub.rotation.x = Math.PI / 2; g.add(hub); S.wheel = g; }
    { const g = mk('pawl'); const pv = new THREE.Group(); pv.position.set(0.75, 1.15, 0); const arm = box(0.95, 0.2, 0.36, M.orange); arm.position.set(-0.45, -0.05, 0); arm.rotation.z = 0.35; pv.add(arm); const pin = cyl(0.09, 0.6, M.brass, 12); pin.rotation.x = Math.PI / 2; pv.add(pin); g.add(pv); S.pawl = pv; }
    { const g = mk('spring'); const sp = helix(0.09, 0.08, 6, 0.025, M.spring); sp.position.set(0.25, 1.32, 0); sp.rotation.z = 0.2; g.add(sp); S.spr = sp; }
    { const g = mk('clutch'); const a = cyl(0.75, 0.12, M.steel, 40), b = cyl(0.75, 0.12, M.alu, 40); a.rotation.x = b.rotation.x = Math.PI / 2; a.position.z = 0.55; b.position.z = 0.95; g.add(a, b); S.balls = [];
      for (let k = 0; k < 6; k++) { const ba = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), M.steel); const an = k / 6 * Math.PI * 2; ba.position.set(Math.cos(an) * 0.5, Math.sin(an) * 0.5, 0.75); g.add(ba); S.balls.push(ba); }
      const sp = helix(0.45, 0.07, 5, 0.03, M.spring); sp.rotation.x = Math.PI / 2; sp.position.z = 1.0; g.add(sp); S.clB = b; }
    { const g = mk('drive'); const sq = box(0.42, 0.42, 0.5, M.steel); sq.position.z = 1.55; const so = cyl(0.5, 0.9, M.alu, 6); so.rotation.x = Math.PI / 2; so.position.z = 2.1; const bolt = new THREE.Group(); const hh = cyl(0.36, 0.3, M.dark, 6); hh.rotation.x = Math.PI / 2; const th = helix(0.16, 0.08, 14, 0.03, M.steel); th.rotation.x = Math.PI / 2; th.position.z = 0.15; const core = cyl(0.14, 1.2, M.steel, 12); core.rotation.x = Math.PI / 2; core.position.z = 0.75; bolt.add(hh, th, core); bolt.position.z = 2.45;
      const pm = M.dark.clone(); pm.transparent = true; pm.opacity = 0.28; pm.depthWrite = false; const plate = box(2.6, 2.6, 0.3, pm); plate.position.z = 3.1; g.add(sq, so, bolt, plate); S.drive = [sq, so, bolt]; }
    { const g = mk('gearpair'); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.4, 20), M.bad); s.rotation.x = Math.PI / 2; g.add(s); const s2 = cyl(0.45, 0.4, M.bad, 12); s2.rotation.x = Math.PI / 2; s2.position.set(0.9, 1.0, 0); g.add(s2); }
    { const g = mk('friction'); const d = cyl(0.95, 0.25, M.bad, 40); d.rotation.x = Math.PI / 2; g.add(d); }
    { const g = mk('rigid'); const c = cyl(0.55, 0.6, M.bad, 6); c.rotation.x = Math.PI / 2; c.position.z = 0.75; g.add(c); } },
  animate(st, dt, { G, S }) { S.w24.visible = !st.flag; S.w72.visible = st.flag;
    if (!st.running && !st.placed.length) return; const om = st.scen === 'back' ? -1 : 1, t = st.t;
    const h = Math.sin(t * 1.8) * (st.flag ? 0.2 : 0.45), dh = h - (S.ph ?? h); S.ph = h;
    for (const k of ['head', 'pawl', 'spring']) G[k].rotation.z = h;
    const ratchet = st.has('wheel') && st.has('pawl') && st.has('spring'), fwd = dh * om > 0;
    let wd = 0; if (st.has('gearpair')) wd = dh; else if (ratchet && st.scen !== 'back') wd = fwd ? dh : 0; else if (ratchet) wd = 0; else if (st.has('friction')) wd = dh * 0.15;
    S.wa = (S.wa || 0) + wd; G.wheel.rotation.z = S.wa;
    S.pawl.rotation.z = ratchet && ((st.scen !== 'back' && !fwd) || st.scen === 'back') ? Math.abs(Math.sin(t * 30)) * 0.12 : 0;
    const slip = st.scen === 'seat' && st.has('clutch');
    G.clutch.rotation.z = S.wa; const ba = slip ? Math.abs(Math.sin(t * 22)) * 0.08 : 0; S.balls.forEach(b => b.position.z = 0.75 + ba);
    if (slip) S.clB.rotation.z = -S.wa; else S.clB.rotation.z = 0;
    const out = st.scen === 'seat' ? (st.has('rigid') ? S.wa : 0) : S.wa;
    S.drive.forEach(o => o.rotation.z = out); G.rigid.rotation.z = S.wa; G.gearpair.rotation.z = S.wa;
    G.drive.position.x = st.scen === 'seat' && (st.has('rigid') || (st.has('clutch') && st.p > 18)) ? Math.sin(t * 50) * 0.02 : 0; }
};

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
  axle: ['ציר גלגל (Axle Shaft)', 'Axle shaft', 'מוט פלדה שמחבר את גלגל הצד אל הגלגל של הרכב.', 'A steel bar connecting the side gear to the road wheel.', 'diff', 'axle'],
  brushed: ['מנוע עם מברשות (Brushed Motor)', 'Brushed motor', 'בתוך המנוע יש מגנטים קבועים מסביב, ובאמצע סליל שמסתובב (רוטור). שתי "מברשות" פחם נוגעות בטבעת נחושת מחולקת (קומוטטור) ומחליפות את כיוון החשמל בכל חצי סיבוב. זול ופשוט, אבל המברשות נשחקות.', 'Fixed magnets around, a spinning coil (rotor) in the middle. Two carbon "brushes" rub on a split copper ring (commutator) and flip the current every half turn. Cheap and simple, but the brushes wear out.', 'brushed'],
  brushless: ['מנוע בלי מברשות (Brushless Motor)', 'Brushless motor', 'הסלילים עומדים במקום (סטטור), והמגנטים מסתובבים. כרטיס אלקטרוני מדליק את הסלילים אחד אחרי השני, והמגנטים "רודפים" אחריהם. אין מה שיישחק: יעיל ומחזיק שנים.', 'The coils stay still (stator) and the magnets spin. An electronic board switches the coils on one after another and the magnets "chase" them. Nothing rubs: efficient and long-lasting.', 'brushless'],
  stator: ['סטטור (Stator)', 'Stator', 'החלק של המנוע שלא זז. במנוע בלי מברשות אלה הסלילים שמסביב.', 'The part of the motor that stays still. In a brushless motor, the ring of coils.', 'brushless'],
  rotor: ['רוטור (Rotor)', 'Rotor', 'החלק של המנוע שמסתובב, עם הציר.', 'The part of the motor that spins, with the shaft.', 'brushed', 'rotor'],
  magnet: ['מגנט (Magnet)', 'Magnet', 'מגנט קבוע: צד אדום (צפון) וצד כחול (דרום). הסליל נמשך ונדחף ממנו, וכך נוצר סיבוב.', 'A permanent magnet: red (north) and blue (south). The coil is pulled and pushed by it, which makes the spin.', 'brushed', 'magnet'],
  commutator: ['קומוטטור (Commutator)', 'Commutator', 'טבעת נחושת מחולקת לחתיכות על ציר המנוע. המברשות נוגעות בה, והיא מחליפה את כיוון החשמל בסליל בכל חצי סיבוב.', 'A copper ring split into segments on the motor shaft. The brushes touch it and it flips the coil current every half turn.', 'brushed', 'commutator'],
  brush: ['מברשת פחם (Carbon Brush)', 'Carbon brush', 'קובייה קטנה של פחם שקפיץ לוחץ על הקומוטטור. מעבירה חשמל לחלק המסתובב, ונשחקת עם הזמן.', 'A small carbon block pressed by a spring onto the commutator. It feeds current to the spinning part and wears over time.', 'brushed', 'brush'],
  controller: ['בקר (Controller)', 'Controller', 'כרטיס אלקטרוני שקובע כמה חשמל נכנס למנוע. כשהמנוע נתקע, הבקר מגביל את החשמל (הנקודות הכתומות מאטות) כדי שהמנוע לא יישרף.', 'An electronic board that decides how much current goes to the motor. When the motor stalls, it limits the current (the orange dots slow down) so the motor will not burn.', 'controller'],
  fuse: ['נתיך חום (Thermal Fuse)', 'Thermal fuse', 'חוט דק בתוך שפופרת. כשהוא מתחמם יותר מדי הוא נמס ונפתח, והחשמל נעצר. ככה המנוע או הסוללה לא נשרפים.', 'A thin wire in a tube. When it gets too hot it melts open and the current stops – so the motor or battery does not burn.', 'fuse'],
  spring: ['קפיץ (Spring)', 'Spring', 'סליל מתכת שנלחץ וחוזר. במצמד הוא לוחץ על הכדורים, ובמתג הוא מחזיר את ההדק.', 'A metal coil that squeezes and springs back. In the clutch it presses the balls; in the switch it returns the trigger.', 'spring'],
  ratchet: ['ראצ׳ט (Ratchet)', 'Ratchet', 'גלגל עם שיניים משופעות ולשונית. לכיוון אחד הלשונית קופצת על השיניים (קליק-קליק), לכיוון השני היא נתפסת ועוצרת.', 'A wheel with slanted teeth and a pawl. One way the pawl clicks over the teeth; the other way it catches and stops.', 'ratchet'],
  trigger: ['הדק (Trigger)', 'Trigger', 'המתג שלוחצים עליו. ככל שלוחצים חזק יותר, הבקר שולח יותר חשמל והמנוע מהיר יותר. קפיץ מחזיר אותו.', 'The switch you squeeze. The harder you press, the more current the controller sends and the faster the motor. A spring returns it.', 'trigger'],
  battery: ['סוללה (Battery)', 'Battery', 'כמה תאים קטנים (כמו סוללות AA גדולות) מחוברים יחד. 5 תאים של 3.6 וולט נותנים 18 וולט.', 'Several small cells (like big AA batteries) joined together. 5 cells of 3.6 V give 18 V.', 'battery'],
  bushing: ['תותב (Bushing)', 'Bushing', 'שרוול מתכת חלק בלי כדורים. הציר מסתובב בתוכו עם קצת שמן. זול וקטן.', 'A smooth metal sleeve without balls. The shaft turns inside it with a little oil. Cheap and small.', 'bearing'],
  pawl: ['לשונית (Pawl)', 'Pawl', 'מוט קטן על ציר שנתקע בשיניים של גלגל ראצ׳ט לכיוון אחד, ומחליק מעליהן לכיוון השני.', 'A small pivoting lever that catches a ratchet wheel\'s teeth one way and slides over them the other way.', 'ratchet'],
  yoke: ['מזלג (Yoke)', 'Yoke', 'חלק בצורת U בקצה הציר, שמחזיק שתי זרועות של הצלב.', 'A U-shaped end on a shaft that holds two arms of the cross.', 'ujoint'],
  cross: ['צלב (Cross / Spider)', 'Cross', 'צלב עם ארבע זרועות במרכז מפרק הקרדן. כל זוג זרועות יושב במזלג אחר.', 'A four-armed cross at the centre of a universal joint; each pair of arms sits in a different yoke.', 'ujoint'],
  lobe: ['זיז (Cam Lobe)', 'Cam lobe', 'בליטה בצורת ביצה על גל הזיזים. החלק הבולט דוחף את השסתום.', 'An egg-shaped bump on the camshaft; its tip pushes the valve.', 'camshaft'],
  follower: ['עוקב (Follower)', 'Follower', 'כוס קטנה שיושבת על הזיז ועולה ויורדת לפי הצורה שלו.', 'A small cup riding on the lobe that rises and falls with its shape.', 'camshaft'],
  valve: ['שסתום (Valve)', 'Valve', 'פקק בצורת פטרייה שפותח וסוגר את הכניסה של אוויר למנוע.', 'A mushroom-shaped plug that opens and closes the engine\'s air port.', 'camshaft'],
  crank: ['ארכובה (Crank)', 'Crank', 'המוט הקצר שמסתובב סיבוב שלם סביב הציר שלו.', 'The short bar that turns a full circle around its pivot.', 'fourbar'],
  rocker: ['מתנדנד (Rocker)', 'Rocker', 'מוט שלא מסתובב סיבוב שלם, רק מתנדנד הלוך וחזור.', 'A bar that does not turn fully; it only swings back and forth.', 'fourbar'],
  coupler: ['מוט מחבר (Coupler)', 'Coupler', 'המוט באמצע שמחבר בין הארכובה למתנדנד.', 'The middle bar linking the crank to the rocker.', 'fourbar'],
  grashof: ['כלל גרסהוף (Grashof Rule)', 'Grashof rule', 'כלל פשוט: אם הקצר ביותר ועוד הארוך ביותר יוצאים לא יותר מהשניים האחרים יחד, המוט הקצר יכול להסתובב סיבוב שלם.', 'A simple rule: if the shortest plus the longest bar are no more than the other two together, the shortest bar can turn a full circle.', 'fourbar'],
  drill: ['מברגה אלחוטית (Cordless Drill)', 'Cordless drill', 'כלי עם סוללה, מנוע, תמסורת פלנטרית, מצמד וצ׳אק. המנוע מהיר וחלש, והתמסורת הופכת אותו לאיטי וחזק.', 'A battery tool with a motor, planetary gearbox, clutch and chuck. The gearbox turns fast-and-weak into slow-and-strong.', 'drill'],
  ujoint: ['מפרק קרדן (Universal Joint)', 'Universal joint', 'שני מזלגות וצלב באמצע. מעביר סיבוב בין שני צירים שלא נמצאים על אותו קו, כמו בציר ההנעה של משאית.', 'Two yokes and a cross. Passes rotation between two shafts at an angle, like a truck drive shaft.', 'ujoint'],
  camshaft: ['גל זיזים (Camshaft)', 'Camshaft', 'ציר עם בליטות בצורת ביצה. כשהוא מסתובב, כל בליטה דוחפת שסתום למעלה ולמטה בזמן הנכון.', 'A shaft with egg-shaped lobes. As it turns, each lobe pushes a valve up and down at the right moment.', 'camshaft'],
  fourbar: ['מנגנון ארבע מוטות (Four-Bar Linkage)', 'Four-bar linkage', 'ארבעה מוטות מחוברים בצירים. מוט אחד מסתובב סביב, ומוט אחר רק מתנדנד הלוך וחזור.', 'Four bars joined by pins. One bar turns all the way round while another only swings back and forth.', 'fourbar'],
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
const SYN = [['לשונית', 'pawl'], ['מזלג', 'yoke'], ['זיז', 'lobe'], ['עוקב', 'follower'], ['שסתום', 'valve'], ['ארכובה', 'crank'], ['מתנדנד', 'rocker'], ['מוט מחבר', 'coupler'], ['מפרק קרדן', 'ujoint'], ['גל זיזים', 'camshaft'], ['בלי מברשות', 'brushless'], ['עם מברשות', 'brushed'], ['מצמד', 'clutch'], ['צ׳אק', 'chuck'], ["צ'אק", 'chuck'], ['מסבים', 'bearing'], ['מסב', 'bearing'], ['קפיץ', 'spring'], ['בקר', 'controller'], ['נתיך', 'fuse'], ['סוללה', 'battery'], ['מגנטים', 'magnet'], ['הדק', 'trigger'], ['ראצ׳ט', 'ratchet'], ['פלנטרי', 'planetary'], ['בורג אינסופי', 'worm'], ['פיניון', 'pinion'], ['גלגל הכתר', 'crown'], ['גלגלי הצד', 'side'], ['גלגלי צד', 'side'], ['תותב', 'bushing'], ['קומוטטור', 'commutator'], ['סטטור', 'stator'], ['רוטור', 'rotor'], ['משחק בין שיניים', 'backlash'], ['שמש', 'sun'], ['נשא', 'carrier'], ['טבעת שיניים', 'ring'], ['קוני', 'bevel'], ['משופע', 'helical'], ['LSD', 'lsd'], ['Brushless', 'brushless'], ['Brushed', 'brushed'], ['Chuck', 'chuck'], ['Bearing', 'bearing'], ['Ratchet', 'ratchet'], ['Torque Clutch', 'clutch'], ['clutch', 'clutch'], ['chuck', 'chuck'], ['bearing', 'bearing'], ['controller', 'controller'], ['fuse', 'fuse'], ['spring', 'spring'], ['battery', 'battery'], ['trigger', 'trigger'], ['magnet', 'magnet'], ['planetary', 'planetary'], ['pinion', 'pinion'], ['crown', 'crown'], ['brushes', 'brushed'], ['ratchet', 'ratchet'], ['bushing', 'bushing']];
const KW = () => { const sp = window.MF_C2 ? 'spider' : 'planet'; return [...SYN, ['גלגלי לוויין', sp], ['גלגלי הלוויין', sp], ['דיפרנציאל', 'diff']].filter(([w, k]) => G[k]).sort((a, b) => b[0].length - a[0].length); };
window.mfAuto = s => { const seen = {}; String(s).replace(/\{([a-z]+)\|/g, (m, k) => seen[k] = 1); const kws = KW();
  return String(s).split(/(\{[^}]*\}|<[^>]+>)/).map(part => { if (/^[{<]/.test(part)) return part; for (const [w, k] of kws) { if (seen[k]) continue; const i = part.indexOf(w); if (i < 0) continue; const before = part.slice(0, i); if ((before.match(/\(/g) || []).length > (before.match(/\)/g) || []).length) continue; part = before + `{${k}|${w}}` + part.slice(i + w.length); seen[k] = 1; } return part; }).join(''); };
window.mfFirstKey = s => { const m = /\{([a-z]+)\|/.exec(window.mfAuto(s)); return m ? m[1] : null; };
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
  spring: new THREE.MeshPhysicalMaterial({ color: 0xd8b35a, metalness: 1, roughness: 0.3 }),
  copper: new THREE.MeshPhysicalMaterial({ color: 0xc8743a, metalness: 1, roughness: 0.3, emissive: 0x000000 }),
  red: new THREE.MeshPhysicalMaterial({ color: 0xb23a3a, metalness: 0.4, roughness: 0.45 }),
  blue: new THREE.MeshPhysicalMaterial({ color: 0x3a5ab2, metalness: 0.4, roughness: 0.45 }),
  pcb: new THREE.MeshPhysicalMaterial({ color: 0x1f3a2c, metalness: 0.2, roughness: 0.6 }),
  chip: new THREE.MeshPhysicalMaterial({ color: 0x1a1b1e, metalness: 0.3, roughness: 0.5 }),
  carbon: new THREE.MeshPhysicalMaterial({ color: 0x2a2b2e, metalness: 0.1, roughness: 0.9 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdfe8f0, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false }),
  led: new THREE.MeshPhysicalMaterial({ color: 0x40ff90, emissive: 0x20ff70, emissiveIntensity: 1 }),
  sleeve: new THREE.MeshPhysicalMaterial({ color: 0x3a3f46, metalness: 0.85, roughness: 0.4, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide })
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
    g.rotation.set(0.35, -0.75, 0); a.position.z = -1.75; const pb = new THREE.Group(); b.rotation.y = Math.PI / 2; b.position.x = -1.75; pb.add(b); g.add(a, pb);
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
  chuck(hl) { const g = new THREE.Group();
    const body = cyl(1.05, 1.6, MAT.dark, 48); body.rotation.z = Math.PI / 2; body.position.x = 1.2;
    const sleeve = new THREE.Group(); const sl = cyl(1.18, 1.8, MAT.sleeve, 48); sl.rotation.z = Math.PI / 2; sleeve.add(sl);
    for (let k = 0; k < 24; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.07, 0.07), MAT.dark); const a = k / 24 * Math.PI * 2; r.position.set(0, Math.cos(a) * 1.2, Math.sin(a) * 1.2); sleeve.add(r); }
    sleeve.position.x = -0.3;
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.0, 1.0, 48, 1, true), MAT.sleeve); nose.rotation.z = Math.PI / 2; nose.position.x = -1.7;
    const bit = new THREE.Group(); const sh = cyl(0.13, 2.4, MAT.alu, 20); sh.rotation.z = Math.PI / 2; const tw = helix(0.11, 0.35, 5, 0.05, MAT.alu); tw.rotation.z = Math.PI / 2; tw.position.x = -2.0; const sh2 = cyl(0.09, 1.8, MAT.alu, 12); sh2.rotation.z = Math.PI / 2; sh2.position.x = -2.0; bit.add(sh, tw, sh2); bit.position.x = -1.9;
    const AN = 0.26, jaws = [];
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, jg = new THREE.Group(), j = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.3), MAT.steel); j.rotation.z = AN; jg.add(j); jg.rotation.x = a; g.add(jg); jaws.push(j); }
    g.add(body, sleeve, nose, bit);
    return { g, d: 9, tick: t => { const c = t % 6, close = c < 2 ? c / 2 : c < 3.5 ? 1 : c < 5.5 ? 1 - (c - 3.5) / 2 : 0, e = close * close * (3 - 2 * close);
      sleeve.rotation.x = (c < 2 ? c : c < 3.5 ? 2 : c < 5.5 ? 2 - (c - 3.5) : 0) * 1.6;
      const o = 1 - e; jaws.forEach(j => { j.position.set(-2.55 + o * 1.0, 0.42 + o * 0.3, 0); }); } }; },
  brushed(hl) { const g = new THREE.Group(), H = (k, m) => hl === k ? MAT.hi : m;
    const can = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.4, 48, 1, true), MAT.ghost); can.rotation.z = Math.PI / 2;
    for (const [s, m] of [[1, MAT.red], [-1, MAT.blue]]) { const mg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.0, 32, 1, true, 0, Math.PI * 0.7), H('magnet', m)); mg.material.side = THREE.DoubleSide; mg.rotation.z = Math.PI / 2; mg.rotation.x = s > 0 ? -Math.PI * 0.35 : Math.PI * 0.65; g.add(mg); }
    const rot = new THREE.Group(); const core = cyl(0.25, 3.6, MAT.steel, 16); core.rotation.z = Math.PI / 2; rot.add(core);
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.35), H('rotor', MAT.dark)); arm.position.set(0, Math.cos(a) * 0.7, Math.sin(a) * 0.7); arm.rotation.x = -a; rot.add(arm);
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 10, 24), H('rotor', MAT.copper)); coil.rotation.y = Math.PI / 2; coil.position.copy(arm.position).multiplyScalar(1.0); coil.rotation.x = -a; rot.add(coil);
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 16, 1, false, a + 0.1, Math.PI * 2 / 3 - 0.2), H('commutator', MAT.copper)); seg.rotation.z = Math.PI / 2; seg.position.x = 1.6; rot.add(seg); }
    const brushes = []; for (const s of [1, -1]) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), H('brush', MAT.carbon)); br.position.set(1.6, s * 0.66, 0); const sp = helix(0.1, 0.12, 4, 0.025, MAT.spring); sp.position.set(1.6, s * 1.1, 0); g.add(br, sp); brushes.push(br); }
    g.add(can, rot);
    return { g, d: 8, tick: t => { rot.rotation.x = t * 2.5; brushes.forEach((b, i) => b.position.x = 1.6 + Math.sin(t * 40 + i) * 0.006); } }; },
  brushless(hl) { const g = new THREE.Group(), coils = [];
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.18, 12, 48), MAT.dark); g.add(ring);
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, tooth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.6), MAT.dark); tooth.position.set(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0); tooth.rotation.z = a; const m = MAT.copper.clone(); const c = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.08, 8, 16), m); c.position.copy(tooth.position); c.rotation.set(0, Math.PI / 2, a); g.add(tooth, c); coils.push([m, a]); }
    const rot = new THREE.Group(); const can = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.8, 48, 1, true), MAT.sleeve); can.rotation.x = Math.PI / 2; rot.add(can);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, mg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.7), k % 2 ? MAT.red : MAT.blue); mg.position.set(Math.cos(a) * 1.85, Math.sin(a) * 1.85, 0); mg.rotation.z = a; rot.add(mg); }
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.08), MAT.pcb); pcb.position.set(0, -3.0, -0.6); const chip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), MAT.chip); chip.position.set(0.4, -3.0, -0.52); const led = new THREE.Mesh(new THREE.SphereGeometry(0.08), MAT.led); led.position.set(-0.7, -2.6, -0.5);
    g.add(rot, pcb, chip, led);
    return { g, d: 9, tick: t => { const ph = t * 2; rot.rotation.z = ph; coils.forEach(([m, a]) => { const on = Math.cos(a - ph * 1.0) > 0.75; m.emissive.setHex(on ? 0xff5a10 : 0x000000); }); led.visible = (t * 4 | 0) % 2 === 0; } }; },
  controller(hl) { const g = new THREE.Group(), pcb = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 2.6), MAT.pcb); g.add(pcb);
    const mos = []; for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.5), MAT.chip); m.position.set(-1.4 + k * 0.56, 0.18, -0.8); g.add(m); mos.push(m); }
    const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), MAT.chip); mcu.position.set(0.6, 0.12, 0.5); const cap = cyl(0.25, 0.7, MAT.alu, 20); cap.position.set(-1.3, 0.45, 0.6);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.1), MAT.led); led.position.set(1.6, 0.15, 0.9); g.add(mcu, cap, led);
    const dots = []; for (let k = 0; k < 10; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.07), MAT.hi); g.add(d); dots.push(d); }
    const wire = cyl(0.06, 3, MAT.copper, 8); wire.rotation.z = Math.PI / 2; wire.position.set(-3.5, 0.1, 0); g.add(wire);
    return { g, d: 8, tick: t => { const lim = (t % 6) > 3; dots.forEach((d, i) => { const u = ((t * (lim ? 0.4 : 1.2) + i / 10) % 1); d.position.set(-5 + u * 5, 0.2, 0); }); led.material.emissiveIntensity = lim ? (Math.sin(t * 12) > 0 ? 2 : 0.1) : 1; mos.forEach((m, i) => m.position.y = 0.18 + (Math.sin(t * 20 + i) > 0.6 ? 0.02 : 0)); } }; },
  fuse(hl) { const g = new THREE.Group(), tube = cyl(0.45, 2.6, MAT.glass, 32); tube.rotation.z = Math.PI / 2; const c1 = cyl(0.5, 0.5, MAT.steel, 32), c2 = c1.clone(); c1.rotation.z = c2.rotation.z = Math.PI / 2; c1.position.x = 1.45; c2.position.x = -1.45;
    const wm = MAT.copper.clone(), wa = cyl(0.04, 1.3, wm, 8), wb = wa.clone(); wa.rotation.z = wb.rotation.z = Math.PI / 2; wa.position.x = 0.65; wb.position.x = -0.65; const blob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), wm); g.add(tube, c1, c2, wa, wb, blob);
    return { g, d: 6, tick: t => { const c = t % 6, heat = Math.min(1, c / 3), open = c > 3 && c < 5.5; wm.emissive.setRGB(heat * 1.0, heat * 0.25, 0); const gap = open ? Math.min(0.35, (c - 3) * 0.6) : 0; wa.scale.y = wb.scale.y = 1 - gap / 1.3 * 1.6; wa.position.x = 0.65 + gap * 0.5; wb.position.x = -0.65 - gap * 0.5; blob.visible = !open; } }; },
  spring(hl) { const g = new THREE.Group(), sp = helix(0.6, 0.45, 8, 0.07, MAT.spring), top = cyl(0.8, 0.12, MAT.dark, 32); g.add(sp, top);
    return { g, d: 7, tick: t => { const k = 0.7 + 0.3 * Math.cos(t * 2); sp.scale.y = k; top.position.y = 1.8 * k + 0.08; } }; },
  ratchet(hl) { const g = new THREE.Group(), sh = new THREE.Shape(), z = 18, r1 = 1.0, r2 = 1.3;
    for (let k = 0; k < z; k++) { const a = k / z * Math.PI * 2, b = (k + 1) / z * Math.PI * 2; if (!k) sh.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); sh.lineTo(Math.cos(b - 0.02) * r2, Math.sin(b - 0.02) * r2); sh.lineTo(Math.cos(b) * r1, Math.sin(b) * r1); }
    const wh = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false }), MAT.steel); wh.geometry.translate(0, 0, -0.2);
    const pw = new THREE.Group(), p = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.3), MAT.hi); p.position.x = -0.5; pw.add(p); pw.position.set(0.9, 1.55, 0); g.add(wh, pw);
    return { g, d: 6, tick: t => { const fw = (t % 6) < 3; const a = fw ? t * 0.8 : 0; if (fw) wh.rotation.z = -a; const ph = (wh.rotation.z * -z / (Math.PI * 2)) % 1; pw.rotation.z = fw ? -0.35 + (1 - ((ph + 1) % 1)) * 0.3 : -0.35; } }; },
  trigger(hl) { const g = new THREE.Group(), grip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6, 0.7), MAT.dark); grip.position.set(0.3, -1.2, 0); grip.rotation.z = -0.2;
    const tg = new THREE.Group(), tr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.4), MAT.hi); tr.position.y = -0.5; tg.add(tr); tg.position.set(-0.55, 0, 0);
    const sp = helix(0.12, 0.12, 5, 0.03, MAT.spring); sp.rotation.z = Math.PI / 2; sp.position.set(-0.15, -0.4, 0); const led = new THREE.Mesh(new THREE.SphereGeometry(0.12), MAT.led); led.position.set(0.3, 0.4, 0.3);
    const fan = gear(10, 0.1, 0.2); fan.position.set(1.4, 0.6, 0); g.add(grip, tg, sp, led, fan); let sp_ = 0;
    return { g, d: 7, tick: t => { const pr = (Math.sin(t * 1.3) * 0.5 + 0.5); tg.rotation.z = -pr * 0.35; sp.scale.x = 1 - pr * 0.4; led.material.emissiveIntensity = pr * 2; sp_ += pr * 0.4; fan.rotation.z = sp_; } }; },
  battery(hl) { const g = new THREE.Group(), box = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 2.0), MAT.sleeve); g.add(box);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const c = cyl(0.3, 1.0, MAT.blue, 20); c.position.set(-1.2 + i * 0.6, 0, -0.45 + j * 0.9); g.add(c); }
    const bars = []; for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.2), MAT.led.clone()); b.position.set(-0.75 + i * 0.5, 0.66, 1.0); g.add(b); bars.push(b); }
    return { g, d: 7, tick: t => { const lv = Math.floor(((t * 0.6) % 5)); bars.forEach((b, i) => b.material.emissiveIntensity = i < lv ? 1.5 : 0.02); } }; },
  backlash(hl) { const g = new THREE.Group(), a = gear(16, 0.25, 0.6), b = gear(16, 0.25, 0.6, { mat: MAT.alu }); b.position.x = 4 + 0.08; g.add(a, b);
    return { g, d: 6, tick: t => { const s = Math.sin(t * 1.2) * 0.25, gap = 0.035; a.rotation.z = s; b.rotation.z = Math.PI / 16 - (Math.abs(s) > gap ? s - Math.sign(s) * gap : 0); } }; },
  motor(hl) { const g = new THREE.Group(), can = cyl(1, 2.4, MAT.alu, 48); can.rotation.z = Math.PI / 2; const cap = cyl(0.95, 0.3, MAT.dark, 48); cap.rotation.z = Math.PI / 2; cap.position.x = 1.35;
    const sh = cyl(0.1, 1.2, MAT.steel, 16); sh.rotation.z = Math.PI / 2; sh.position.x = -1.75; const pin = gear(10, 0.08, 0.3); pin.rotation.y = Math.PI / 2; pin.position.x = -2.2; g.add(can, cap, sh, pin);
    return { g, d: 7, tick: t => { sh.rotation.x = t * 6; pin.rotation.z = t * 6; } }; },
  drill(hl) { const g = new THREE.Group();
    const body = cyl(0.75, 3.2, MAT.dark, 40); body.rotation.z = Math.PI / 2; body.position.set(0.3, 1.6, 0);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 16), MAT.dark); back.position.set(1.9, 1.6, 0);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.8), MAT.carbon); grip.position.set(0.9, 0.2, 0); grip.rotation.z = -0.18;
    const bat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.3), MAT.dark); bat.position.set(1.1, -1.2, 0);
    const trig = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.55, 0.35), MAT.hi); trig.position.set(0.3, 0.75, 0);
    const ring = cyl(0.8, 0.35, MAT.hi, 40); ring.rotation.z = Math.PI / 2; ring.position.set(-1.45, 1.6, 0);
    const ch = new THREE.Group(); const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.0, 32), MAT.steel); cs.rotation.z = Math.PI / 2; ch.add(cs);
    for (let k = 0; k < 12; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.05), MAT.dark); const a = k / 12 * Math.PI * 2; r.position.set(0.05, Math.cos(a) * 0.52, Math.sin(a) * 0.52); ch.add(r); }
    const bit = helix(0.07, 0.25, 6, 0.04, MAT.alu); bit.rotation.z = Math.PI / 2; bit.position.x = -0.9; ch.add(bit);
    ch.position.set(-2.1, 1.6, 0); g.add(body, back, grip, bat, trig, ring, ch);
    return { g, d: 9, tick: t => { ch.rotation.x = t * 6; } }; },
  ujoint(hl) { const g = new THREE.Group(), ANG = 0.45;
    const yoke = m => { const y = new THREE.Group(); const sh = cyl(0.22, 2.6, m, 24); sh.rotation.z = Math.PI / 2; sh.position.x = -1.5; const base = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.3, 0.4), m); base.position.x = -0.35;
      y.add(sh, base); for (const s of [1, -1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.4), m); arm.position.set(-0.1, s * 0.56, 0); const eye = cyl(0.2, 0.42, m, 20); eye.rotation.x = Math.PI / 2; eye.position.set(0.12, s * 0.56, 0); y.add(arm, eye); } return y; };
    const a = yoke(MAT.steel), bWrap = new THREE.Group(), b = yoke(MAT.alu); b.rotation.y = Math.PI; bWrap.add(b); bWrap.rotation.z = ANG;
    const cross = new THREE.Group(); const c1 = cyl(0.1, 1.3, MAT.hi, 16), c2 = cyl(0.1, 1.3, MAT.hi, 16); c2.rotation.x = Math.PI / 2; cross.add(c1, c2, new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), MAT.hi));
    g.add(a, bWrap, cross);
    return { g, d: 7, tick: t => { const th = t * 1.6; a.rotation.x = th; const ob = Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(ANG)); b.rotation.x = -ob + Math.PI / 2; cross.rotation.set(th, 0, 0); cross.children[1].rotation.set(Math.PI / 2, 0, 0); } }; },
  camshaft(hl) { const g = new THREE.Group(), N = 4, lobes = [], vs = [];
    const sh = cyl(0.18, 6, MAT.steel, 24); sh.rotation.z = Math.PI / 2; g.add(sh);
    const s = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = 0.5 + 0.38 * Math.pow(Math.max(0, Math.cos(a)), 3); i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }); geo.translate(0, 0, -0.2);
    for (let k = 0; k < N; k++) { const x = -2.1 + k * 1.4, l = new THREE.Mesh(geo, MAT.alu); l.rotation.y = Math.PI / 2; const lg = new THREE.Group(); lg.add(l); lg.position.x = x; g.add(lg); lobes.push([lg, k * Math.PI / 2]);
      const v = new THREE.Group(); const stem = cyl(0.08, 1.8, MAT.steel, 12); stem.position.y = 0.9; const tap = cyl(0.3, 0.25, MAT.hi, 24); const head = cyl(0.42, 0.08, MAT.dark, 24); head.position.y = 1.8; v.add(stem, tap, head); v.position.x = x; g.add(v); vs.push(v); }
    return { g, d: 9, tick: t => { const th = t * 1.5; lobes.forEach(([lg, ph], i) => { lg.rotation.x = th + ph; const a = Math.PI / 2 - (th + ph); let best = 0; for (let j = 0; j < 24; j++) { const b = j / 24 * Math.PI * 2, r = 0.5 + 0.38 * Math.pow(Math.max(0, Math.cos(b)), 3); best = Math.max(best, r * Math.cos(b - a)); } vs[i].position.y = best + 0.12; }); } }; },
  fourbar(hl) { const g = new THREE.Group(), A = [-1.5, 0], D = [1.5, 0], a = 0.9, b = 3.0, c = 2.2;
    const bar = (m, w) => { const o = new THREE.Group(); const bx = new THREE.Mesh(new THREE.BoxGeometry(1, w, 0.18), m); bx.position.x = 0.5; o.add(bx); o.userData.bx = bx; return o; };
    const set = (o, p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); o.position.set(p[0], p[1], o.position.z); o.rotation.z = Math.atan2(dy, dx); o.userData.bx.scale.x = L; o.userData.bx.position.x = L / 2; };
    const gr = bar(MAT.dark, 0.3); gr.position.z = -0.25; set(gr, [A[0] - 0.3, A[1]], [D[0] + 0.3, D[1]]);
    const cr = bar(MAT.hi, 0.22), cp = bar(MAT.steel, 0.2), rk = bar(MAT.alu, 0.22); cp.position.z = 0.2; g.add(gr, cr, cp, rk);
    const pins = [0, 1, 2, 3].map(() => { const p = cyl(0.13, 0.7, MAT.brass, 16); p.rotation.x = Math.PI / 2; g.add(p); return p; });
    for (const P of [A, D]) { const blk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), MAT.dark); blk.position.set(P[0], P[1] - 0.35, -0.25); g.add(blk); }
    return { g, d: 8, tick: t => { const th = t * 1.4, B = [A[0] + a * Math.cos(th), A[1] + a * Math.sin(th)], dx = D[0] - B[0], dy = D[1] - B[1], d = Math.hypot(dx, dy), aa = (b * b - c * c + d * d) / (2 * d), h = Math.sqrt(Math.max(0, b * b - aa * aa)), mx = B[0] + aa * dx / d, my = B[1] + aa * dy / d, C = [mx - h * dy / d, my + h * dx / d];
      set(cr, A, B); set(cp, B, C); set(rk, D, C); [A, B, C, D].forEach((P, i) => pins[i].position.set(P[0], P[1], 0)); } }; },
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
window.mfGlossOpen = open; window.MF_B = B; window.MF_MAT = MAT;
const THC = {};
window.mfGlossThumb = key => { if (THC[key]) return THC[key]; const d = G[key]; if (!d || !B[d[4]]) return ''; init();
  const prev = root; if (prev) scene.remove(prev); const M = B[d[4]](d[5]); M.tick(1.3); const bx = new THREE.Box3().setFromObject(M.g); M.g.position.sub(bx.getCenter(new THREE.Vector3())); scene.add(M.g);
  cam.position.set(M.d * 0.55, M.d * 0.45, M.d * 0.75); cam.lookAt(0, 0, 0); cam.aspect = 4 / 3; cam.updateProjectionMatrix(); R.setSize(160, 120, false); R.render(scene, cam);
  const url = R.domElement.toDataURL('image/png'); scene.remove(M.g); if (prev) scene.add(prev); THC[key] = url; return url; };
document.getElementById('gX').onclick = () => pop.classList.remove('show', 'part');
addEventListener('keydown', e => { if (e.key === 'Escape') pop.classList.remove('show', 'part'); });
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
  const p = (window.MF_PARTS && window.MF_PARTS[key]) || PARTS[key]; if (!p) return;
  let [mk, mh] = p[0].split(':'); const sc = window.MF_SCENE_PART && window.MF_SCENE_PART(key); if (sc) { B._scene = () => sc; mk = '_scene'; mh = undefined; } G['_p'] = [p[1], p[2], '', '', mk, mh]; open('_p');
  document.getElementById('gP').innerHTML = `<h6>${L('מה זה', 'What it is')}</h6>${L(p[3], p[4])}<h6>${L('מתאים כאן?', 'Does it fit here?')}</h6>${L(p[5], p[6])}<h6>${L('איפה כן משתמשים בו', 'Where it IS used')}</h6>${L(p[7], p[8])}`;
};
window.MF_GLOSS_OPEN_PART = window.mfPartWhy;

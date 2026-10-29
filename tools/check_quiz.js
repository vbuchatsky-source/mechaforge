// node tools/check_quiz.js — fails if the correct option is the longest in >40% of questions, or one position holds >60%
const fs = require('fs'), D = __dirname + '/../'; let bad = 0;
const sets = [['C1', ['iv1.js'], w => w.MF_UNITS], ['C2', ['c2data.js'], w => w.MF_C2.units]];
for (const [n, f] of [['C3', 'c3data.js'], ['C4', 'c4data.js'], ['C5', 'c5data.js'], ['C6', 'c6data.js']]) if (fs.existsSync(D + f)) sets.push([n, ['mkit.js', f], w => w.MF_C2.units]);
for (const [name, files, get] of sets) { global.window = {}; files.forEach(f => eval(fs.readFileSync(D + f, 'utf8'))); const U = get(window);
  let n = 0, L = 0; const pos = [0, 0, 0];
  U.forEach(u => u.items.forEach(q => { n++; const c = q[6]; pos[c]++; const l = q[4].map(s => s.length); if (l[c] > Math.max(...l.filter((_, i) => i !== c))) L++; }));
  const p = L / n; console.log(name, 'units', U.length, 'questions', n, 'correct longest', L, (p * 100).toFixed(0) + '%', 'positions', pos.join('/'));
  if (p > 0.4 || pos.some(x => x > n * 0.6) || n !== 50) bad = 1; }
console.log(bad ? 'FAIL' : 'PASS'); process.exit(bad);

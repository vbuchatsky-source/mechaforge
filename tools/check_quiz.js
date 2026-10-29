// node tools/check_quiz.js — fails if the correct option is the (strictly) longest in >40% of questions, or is always in one position
const fs=require('fs');global.window={};
for(const f of ['iv1.js','c2data.js'])eval(fs.readFileSync(__dirname+'/../'+f,'utf8'));
let bad=0;
for(const [name,U] of [['C1',window.MF_UNITS],['C2',window.MF_C2.units]]){
  let n=0,L=0,pos=[0,0,0];
  U.forEach(u=>u.items.forEach(q=>{n++;const c=q[6];pos[c]++;const l=q[4].map(s=>s.length);if(l[c]>Math.max(...l.filter((_,i)=>i!==c)))L++;}));
  const p=L/n;console.log(name,'questions',n,'correct longest',L,(p*100).toFixed(0)+'%','positions',pos.join('/'));
  if(p>0.4||pos.some(x=>x>n*0.6))bad=1;
}
console.log(bad?'FAIL':'PASS');process.exit(bad);

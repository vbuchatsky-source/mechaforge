// shared helper for challenge data files: it(question, answer, options[correct first]) → shuffled item with stored correct index
window.MF_IT = (function () { let n = 0; const P = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 1, 2], [2, 1, 0], [1, 0, 2]];
  return (qh, qe, ah, ae, oh, oe) => { const p = P[n++ % P.length]; return [qh, qe, ah, ae, p.map(i => oh[i]), p.map(i => oe[i]), p.indexOf(0)]; }; })();

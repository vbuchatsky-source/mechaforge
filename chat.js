// MechaForge AI chat – calls the LLM directly from the browser with the user's own key (localStorage only)
(function () {
  const EN = (localStorage.getItem('mf_lang') || 'he') === 'en' || new URLSearchParams(location.search).get('lang') === 'en';
  const L = (h, e) => EN ? e : h;
  const PROV = {
    xai: { name: 'xAI Grok', url: 'https://api.x.ai/v1/chat/completions', model: 'grok-3-mini', keyUrl: 'https://console.x.ai' },
    openai: { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', keyUrl: 'https://platform.openai.com/api-keys' }
  };
  const ls = (k, v) => v === undefined ? localStorage.getItem(k) : (v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v));
  let prov = ls('mf_ai_prov') || 'xai';
  const keyOf = p => ls('mf_ai_key_' + p) || '';
  const modelOf = p => ls('mf_ai_model_' + p) || PROV[p].model;
  const hist = JSON.parse(sessionStorage.getItem('mf_ai_hist') || '[]');
  const saveHist = () => sessionStorage.setItem('mf_ai_hist', JSON.stringify(hist.slice(-40)));

  const SYS = `You are an expert mechanical-design tutor inside "MechaForge", a 3D web game. Challenge 1: design the drivetrain of an 18 V cordless drill/screwdriver.
Parts: DC motor 18 V (18,000 rpm no-load, stall torque 1.6 N·m, stall current 80 A, no-load 1.5 A), hobby motor 3 V (12,000 rpm, 0.06 N·m), stepper NEMA17 (1,200 rpm, 0.45 N·m), planetary stage 4:1 (sun 12, planets 12, ring 36, η 95%), planetary stage 5:1 (sun 12, planets 18, ring 48, η 95%), torque clutch (slips on overload, η 98%), chuck. Rejected parts: worm 30:1 (90° output, η~50%), spur pair (offsets the axis).
Targets: no-load output 500–1200 rpm (sweet spot 800–1000), max torque ≥ 20 N·m, current at 10 N·m load ≤ 50 A; clutch earns a star.
Formulas: planetary ratio i = 1 + Zring/Zsun; total i = product of stages; n_out = n_motor / i; T_out = T_motor · i · η_total; η_total = product of η; P = T·ω, ω = 2πn/60; DC motor linear: T = Ts(1 − n/n0), I = I0 + T/Kt, Kt = Ts/Is; motor torque under load T_m = T_load/(i·η). Stall = load torque exceeds max torque → speed 0, max current, heat; the clutch prevents it.
Reference good answer: motor + 4:1 + 5:1 + clutch → i = 20, 900 rpm, ≈28.4 N·m.
Answer in the user's language (Hebrew or English), concisely, with numbers. Use the live context below. If mode is "test", give only hints and guiding questions, never the full solution or the exact part list.`;

  function ctx() {
    const M = window.__mf; if (!M) return 'App state unavailable.';
    try {
      const A = M.acad && M.acad(); const a = M.analyse(); const ev = M.evaluate(a);
      const chain = M.chain.map(c => M.PT[c.type].en).join(' → ') || '(empty)';
      const s = M.sel && M.sel(); const st = document.getElementById('sideT'); const sb = document.getElementById('sideB');
      const step = st && st.closest('.show') ? (st.textContent + ' — ' + (sb ? sb.textContent.slice(0, 400) : '')) : '';
      const lr = M.last && M.last();
      return `LIVE CONTEXT\nAcademy mode: ${A ? A.mode : 'none (free build)'}${A && A.k != null ? ', step ' + (A.k + 1) : ''}\nApp state: ${M.mode}\nCurrent panel/task: ${step || '-'}\nChain: ${chain}\nSelected part: ${s ? M.PT[s.type].en : 'none'}\nStats: ratio ${a.i.toFixed(1)}:1, η ${(a.eta * 100).toFixed(1)}%, no-load ${Math.round(ev.free)} rpm, max torque ${ev.tmax.toFixed(1)} N·m, current@10N·m ${ev.I.toFixed(0)} A, cost $${a.cost}, clutch ${a.clutch ? 'yes' : 'no'}, passes ${ev.pass}\nLast test: ${lr ? (lr.ev.pass ? 'PASS ' + lr.ev.stars + '★' : 'FAIL') : 'none'}`;
    } catch (e) { return 'Context error: ' + e.message; }
  }
  window.__mfChatCtx = ctx;

  const $ = id => document.getElementById(id);
  const box = document.createElement('div'); box.id = 'chat'; box.dir = EN ? 'ltr' : 'rtl';
  box.innerHTML = `<div class="ch"><b>💬 ${L('שאל את ה-AI', 'Ask the AI')}</b><button id="cSetB">⚙ ${L('הגדרות', 'Settings')}</button><button id="cNew">${L('נקה', 'Clear')}</button><button id="cX">✕</button></div>
<div id="chatSet"><label>${L('ספק', 'Provider')}</label><select id="cProv"><option value="xai">xAI Grok (${L('ברירת מחדל', 'default')})</option><option value="openai">OpenAI</option></select>
<label>${L('מודל', 'Model')}</label><input id="cModel" dir="ltr">
<label>${L('מפתח API', 'API key')}</label><input id="cKey" type="password" dir="ltr" autocomplete="off" placeholder="xai-… / sk-…">
<div style="display:flex;gap:6px"><button id="cSave" class="pr">${L('שמור', 'Save')}</button><button id="cClr">${L('מחק מפתח', 'Clear key')}</button></div>
<div class="note">🔒 ${L('המפתח נשמר רק בדפדפן הזה (localStorage) ונשלח ישירות לספק. לא עובר דרך שום שרת אחר.', 'The key is stored only in this browser (localStorage) and sent directly to the provider.')}</div>
<div class="note">${L('קבל מפתח:', 'Get a key:')} <a id="cKeyLink" target="_blank" rel="noopener"></a></div></div>
<div class="note" style="padding:6px 12px">📖 ${L('תשובות מוכנות לשאלות נפוצות:', 'Ready answers to common questions:')} <a href="#" id="cFaq">${L('פתח שאלות ותשובות', 'Open FAQ')}</a></div><div id="chatLog"></div>
<div class="cf"><textarea id="cIn" placeholder="${L('שאל על המברגה… (Enter לשליחה)', 'Ask about the drill… (Enter to send)')}"></textarea><button id="cSend" class="pr">${L('שלח', 'Send')}</button></div>`;
  document.body.appendChild(box);

  const btn = document.createElement('button'); btn.className = 'tb'; btn.id = 'bChat'; btn.textContent = L('💬 שאל את ה-AI', '💬 Ask the AI');
  const tb = document.querySelector('#top .tbtns'); tb.insertBefore(btn, tb.firstChild);

  function fillSet() { $('cProv').value = prov; $('cModel').value = modelOf(prov); $('cKey').value = keyOf(prov); const a = $('cKeyLink'); a.href = PROV[prov].keyUrl; a.textContent = PROV[prov].keyUrl.replace('https://', ''); }
  function msg(cls, t) { const d = document.createElement('div'); d.className = 'm ' + cls; d.textContent = t; $('chatLog').appendChild(d); $('chatLog').scrollTop = 1e9; return d; }
  function render() { $('chatLog').innerHTML = ''; if (!hist.length) msg('a', L('שלום! אני מורה למכניקה של המברגה. שאל אותי על המנוע, השלבים הפלנטריים, המצמד, יחסי תמסורת, מומנט או סל"ד. אני רואה את השלב שלך ואת השרשרת שבנית.', 'Hi! Ask me about the motor, planetary stages, clutch, gear ratios, torque or rpm. I can see your current step and chain.')); hist.forEach(h => msg(h.role === 'user' ? 'u' : 'a', h.content)); }
  function open(o) { box.classList.toggle('show', o); btn.classList.toggle('on', o); if (o) { ['faq','theory'].forEach(i => { const f = document.getElementById(i); if (f) f.classList.remove('show'); }); fillSet(); if (!keyOf(prov)) $('chatSet').classList.add('show'); render(); $('cIn').focus(); } }
  btn.onclick = () => open(!box.classList.contains('show'));
  $('cX').onclick = () => open(false);
  $('cSetB').onclick = () => { $('chatSet').classList.toggle('show'); fillSet(); };
  $('cProv').onchange = () => { prov = $('cProv').value; ls('mf_ai_prov', prov); fillSet(); };
  $('cSave').onclick = () => { const k = $('cKey').value.trim(); if (k) ls('mf_ai_key_' + prov, k); const m = $('cModel').value.trim(); ls('mf_ai_model_' + prov, m && m !== PROV[prov].model ? m : null); ls('mf_ai_prov', prov); $('chatSet').classList.remove('show'); msg('a', L('✓ נשמר', '✓ Saved')); };
  $('cClr').onclick = () => { ls('mf_ai_key_' + prov, null); $('cKey').value = ''; msg('a', L('המפתח נמחק', 'Key cleared')); };
  $('cNew').onclick = () => { hist.length = 0; saveHist(); render(); };
  $('cIn').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  ['keyup', 'keypress'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));
  $('cSend').onclick = send;
  $('cFaq').onclick = e => { e.preventDefault(); open(false); window.__mfFaqOpen && window.__mfFaqOpen(true); };

  function buildRequest(text) {
    const P = PROV[prov];
    const messages = [{ role: 'system', content: SYS + '\n\nFAQ (reference knowledge, reuse when relevant):\n' + (window.__mfFAQ || '') + '\n\nINTERVIEW Q&A:\n' + (window.__mfInterview || '') + '\n\n' + ctx() }, ...hist.slice(-16), { role: 'user', content: text }];
    return { url: P.url, init: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keyOf(prov) }, body: JSON.stringify({ model: modelOf(prov), messages, stream: true, temperature: 0.4 }) } };
  }
  window.__mfChatBuild = buildRequest;
  let busy = false;
  async function send() {
    const text = $('cIn').value.trim(); if (!text || busy) return;
    if (!keyOf(prov)) { $('chatSet').classList.add('show'); fillSet(); msg('e', L('צריך להזין מפתח API בהגדרות קודם.', 'Enter an API key in Settings first.')); return; }
    $('cIn').value = ''; msg('u', text); const out = msg('a', '…'); busy = true; $('cSend').disabled = true;
    const { url, init } = buildRequest(text); let acc = '';
    try {
      const r = await fetch(url, init);
      if (!r.ok) { let d = ''; try { const j = await r.json(); d = (j.error && (j.error.message || j.error)) || JSON.stringify(j); } catch (_) { d = r.statusText; }
        const hint = r.status === 401 || r.status === 403 ? L('מפתח API שגוי או ללא הרשאה. בדוק בהגדרות.', 'Invalid or unauthorized API key. Check Settings.') : r.status === 429 ? L('חריגה ממגבלת שימוש/קרדיט.', 'Rate limit or no credit.') : r.status === 404 ? L('שם מודל לא קיים – בדוק בהגדרות.', 'Model not found – check Settings.') : L('שגיאה מהשרת.', 'Server error.');
        throw new Error(`${hint} (${r.status}) ${String(d).slice(0, 200)}`); }
      const ct = r.headers.get('content-type') || '';
      if (r.body && ct.includes('event-stream')) {
        const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '';
        for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop();
          for (const ln of lines) { const s = ln.trim(); if (!s.startsWith('data:')) continue; const p = s.slice(5).trim(); if (p === '[DONE]') continue;
            try { const d = JSON.parse(p).choices[0].delta; if (d && d.content) { acc += d.content; out.textContent = acc; $('chatLog').scrollTop = 1e9; } } catch (_) {} } }
      } else { const j = await r.json(); acc = j.choices[0].message.content; out.textContent = acc; }
      if (!acc) acc = L('(תשובה ריקה)', '(empty reply)'), out.textContent = acc;
      hist.push({ role: 'user', content: text }, { role: 'assistant', content: acc }); saveHist();
    } catch (e) { out.className = 'm e'; out.textContent = '⚠ ' + (e instanceof TypeError ? L('שגיאת רשת – בדוק חיבור אינטרנט / חסימת CORS.', 'Network error – check connection / CORS.') + ' ' + e.message : e.message); }
    busy = false; $('cSend').disabled = false;
  }
})();

/* 隐藏：私密来信（连点 LOGO 5 次 · MS-DOS 终端 · Formspree 提交） */
(function(){
  'use strict';
  var ENDPOINT = 'https://formspree.io/f/mljelzge';
  var NEED = 5, RESET_MS = 3000;

  var logo = document.querySelector('.nav-logo');
  var term = document.getElementById('mail-term');
  var boot = document.getElementById('mail-boot');
  var body = document.getElementById('mail-body');
  var tray = document.getElementById('mail-tray');
  var promptEl = document.getElementById('mail-prompt');
  var input = document.getElementById('mail-input');
  var area = document.getElementById('mail-area');
  var sendBtn = document.getElementById('mail-send');
  var closeBtn = document.getElementById('mail-close');

  var clicks = 0, timer = null;
  var gen = 0;                 /* 会话代号：open/close 自增以取消旧动画 */
  var visible = false;
  var phase = null;            /* null | name | email | message | transmit | retry | done */
  var data = { name:'', email:'', message:'' };

  /* ---- 基础工具 ---- */
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  function appendLine(el){ body.appendChild(el); body.scrollTop = body.scrollHeight; return el; }
  function line(cls, text){
    var d = document.createElement('div');
    d.className = 'mail-line' + (cls ? ' ' + cls : '');
    d.textContent = text || '';
    return appendLine(d);
  }
  function typeLine(text, cls){
    var g = gen;
    return new Promise(function(res){
      if(!text || g !== gen){ res(); return; }
      var d = document.createElement('div');
      d.className = 'mail-line' + (cls ? ' ' + cls : '');
      appendLine(d);
      var cur = document.createElement('span');
      cur.className = 'mail-cursor';
      d.appendChild(cur);
      var i = 0;
      (function step(){
        if(g !== gen){ d.remove(); body.scrollTop = body.scrollHeight; res(); return; }
        if(i >= text.length){ cur.remove(); body.scrollTop = body.scrollHeight; res(); return; }
        d.insertBefore(document.createTextNode(text.charAt(i)), cur);
        i++; body.scrollTop = body.scrollHeight;
        setTimeout(step, 12 + Math.random() * 14);
      })();
    });
  }

  /* ---- 音效 ---- */
  var AC = null;
  function ensureAudio(){
    try{
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if(AC.state === 'suspended') AC.resume();
    }catch(e){}
  }
  function tone(type, f0, f1, dur, vol, delay){
    try{
      ensureAudio();
      if(!AC) return;
      var t = AC.currentTime + (delay || 0);
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type;
      if(f1 && f1 !== f0){ o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); }
      else o.frequency.setValueAtTime(f0, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(AC.destination);
      o.start(t); o.stop(t + dur + 0.06);
    }catch(e){}
  }
  function noise(dur, vol, delay){
    try{
      ensureAudio();
      if(!AC) return;
      var t = AC.currentTime + (delay || 0);
      var len = Math.max(1, Math.floor(AC.sampleRate * dur));
      var buf = AC.createBuffer(1, len, AC.sampleRate);
      var ch = buf.getChannelData(0);
      for(var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = AC.createBufferSource(); src.buffer = buf;
      var f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
      var g = AC.createGain();
      g.gain.setValueAtTime(vol || 0.03, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(AC.destination);
      src.start(t); src.stop(t + dur + 0.05);
    }catch(e){}
  }
  function playBoot(){
    tone('sine', 50, 60, 0.6, 0.05, 0);
    noise(0.2, 0.05, 0);
    tone('square', 990, 990, 0.12, 0.06, 0.35);
  }
  function playSend(){ tone('square', 1180, 1180, 0.05, 0.05, 0); }

  /* ---- 表单各阶段 ---- */
  function showControls(opts){
    opts = opts || {};
    input.hidden = !opts.input;
    area.hidden = !opts.area;
    sendBtn.hidden = !opts.send;
    tray.hidden = false;
    if(opts.input) input.value = '';
    if(opts.area) area.value = '';
    if(opts.placeholder) input.placeholder = opts.placeholder;
  }
  function focusInput(){ setTimeout(function(){ if(visible && !input.hidden) input.focus(); }, 30); }
  function focusArea(){ setTimeout(function(){ if(visible && !area.hidden) area.focus(); }, 30); }

  function promptName(){ phase = 'name'; promptEl.textContent = '>'; showControls({input:true, placeholder:'CALLSIGN_（回车跳过）'}); focusInput(); }
  function promptEmail(){ phase = 'email'; promptEl.textContent = '>'; showControls({input:true, placeholder:'you@example.com（回车跳过）'}); focusInput(); }
  function promptMsg(){ phase = 'message'; promptEl.textContent = '>'; showControls({area:true, send:true}); focusArea(); }

  /* ---- 启动序列（复古开机自检） ---- */
  async function bootSequence(){
    var g = gen;
    playBoot();
    boot.hidden = false;
    await wait(1650);
    if(g !== gen) return;
    boot.hidden = true;

    await typeLine('> 恭喜，你找到了藏在这里的老机器。', 'accent');
    await typeLine('  ✦ 成就「老机器的秘密」已解锁', 'ok');
    await typeLine('');
    await typeLine('MAKE STUDIO PRIVATE UPLINK v1.0', 'ok');
    await typeLine('(C) 2026 MAKE STUDIO // 未加密信道不予受理', 'dim');
    await typeLine('');
    await typeLine('Initializing secure tunnel ...', 'dim');
    await wait(340);
    await typeLine('Handshake with relay ......... OK', 'ok');
    await wait(140);
    await typeLine('Cipher :: X25519 + AES-256-GCM');
    await typeLine('Channel :: POINT-TO-POINT / ESTABLISHED');
    await typeLine('');
    await wait(120);
    await typeLine('此信道不记录、不存档、不实名。', 'hint');
    await typeLine('按提示输入，回车确认；留完即走。', 'dim');
    await typeLine('──────────────────────────', 'dim');
    await typeLine('');
    if(g !== gen) return;
    line('hint', '> 你的称呼（可空 · 回车跳过）');
    promptName();
  }

  /* ---- 发送 ---- */
  async function transmit(){
    var g = gen;
    phase = 'transmit';
    tray.hidden = true;
    line('', '');
    line('accent', '── 加密并发送中 ──');
    await wait(560);
    if(g !== gen) return;

    var fd = new FormData();
    fd.append('_gotcha', '');
    fd.append('_subject', '来自官网隐藏来信');
    fd.append('name', data.name || '');
    fd.append('email', data.email || '');
    fd.append('message', data.message || '');

    var failed = false;
    try{
      var r = await fetch(ENDPOINT, { method:'POST', body: fd, headers:{ 'Accept':'application/json' } });
      if(g !== gen) return;
      if(!r.ok){ var err = {}; try{ err = await r.json(); }catch(e){} throw err; }
    }catch(e){ failed = true; }

    if(g !== gen) return;
    if(failed){
      line('err', '× 发送失败，信道抖动。');
      line('dim', '按 Enter 重试 · Esc 离开');
      phase = 'retry';
      tray.hidden = true;
    }else{
      playSend();
      line('ok', '✓ 已送达，感谢来信。');
      line('dim', '本条消息已从本机内存中抹除。');
      line('hint', '按 Enter 再写一封 · Esc 离开');
      phase = 'done';
      tray.hidden = true;
    }
  }
  function submitMessage(){
    if(phase !== 'message') return;
    var v = area.value.replace(/\s+$/, '');
    if(!v.trim()){
      line('err', '！ 消息不能为空。');
      focusArea();
      return;
    }
    data.message = v.trim();
    line('', '  ' + v.replace(/\n/g, ' ↵ '));
    transmit();
  }

  /* ---- 打开 / 关闭 ---- */
  function open(){
    if(visible) return;
    visible = true;
    gen++;
    phase = null;
    data = { name:'', email:'', message:'' };
    body.innerHTML = '';
    tray.hidden = true;
    input.value = ''; area.value = '';
    term.hidden = false;
    requestAnimationFrame(function(){ term.classList.add('show'); });
    bootSequence();
    if(window.__ach) window.__ach.unlock('mail_terminal');
  }
  function close(){
    if(!visible) return;
    visible = false;
    gen++;                    /* 取消进行中的动画 */
    term.classList.remove('show');
    setTimeout(function(){ if(!visible){ term.hidden = true; body.innerHTML = ''; } }, 450);
  }

  /* ---- 触发：连点 LOGO ---- */
  if(logo){
    logo.addEventListener('click', function(){
      clicks++;
      clearTimeout(timer);
      if(clicks >= NEED){ clicks = 0; clearTimeout(timer); open(); }
      else timer = setTimeout(function(){ clicks = 0; }, RESET_MS);
    });
  }

  if(closeBtn) closeBtn.addEventListener('click', close);

  /* ---- 输入事件 ---- */
  input.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    e.preventDefault();
    if(phase === 'name'){
      data.name = input.value.trim();
      line('dim', '  ' + (data.name || '(anonymous)'));
      line('hint', '> 回信地址（可空 · 回车跳过）');
      promptEmail();
    }else if(phase === 'email'){
      data.email = input.value.trim();
      line('dim', '  ' + (data.email || '(无)'));
      line('hint', '> 想说的话（必填 · Ctrl+Enter 发送 / Enter 换行）');
      promptMsg();
    }
  });

  area.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      submitMessage();
    }
  });

  if(sendBtn) sendBtn.addEventListener('click', submitMessage);

  /* ---- 全局键盘（终端可见时） ---- */
  document.addEventListener('keydown', function(e){
    if(!visible) return;
    if(e.key === 'Escape'){ e.preventDefault(); close(); return; }
    if(phase === 'done' && e.key === 'Enter'){ e.preventDefault(); close(); }
    else if(phase === 'retry' && e.key === 'Enter'){ e.preventDefault(); transmit(); }
  });
})();

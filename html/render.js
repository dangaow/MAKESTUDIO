// 《谎话》MV 渲染进度页（html/render.html）
// 按固定的预计时间实时走：10:09 开始，13:00 预计完成（香港时间）。
// 到 13:00：整页闪回一次 MV（6 张画面，每张几十毫秒，像录像带倒带），停在「谎话」上，CRT 关机 → Stand by. + 倒计时按钮。
// 过了 13:00 再打开：直接黑屏 → 闪回 → Stand by.；闪回每个浏览器只放一次，看过的人再打开直接是 Stand by.
// 试看：?demo 把时钟拨到 13:00 前 8 秒（每次都放闪回）；?standby 直接看 Stand by.
(function () {
  'use strict';
  var HK = '+08:00';
  var START = Date.parse('2026-10-09T10:09:00' + HK);
  var END = Date.parse('2026-10-09T13:00:00' + HK);
  var STEPS = [
    { name: '第一段渲染 · 0:00–0:54', from: '10:09', to: '11:25' },
    { name: '第二段渲染 · 0:54–1:48', from: '11:25', to: '12:40' },
    { name: '拼接、配上整首歌的音轨、压 720p 手机版', from: '12:40', to: '13:00' }
  ];
  // 闪回用的画面（assets/render/fb-N.jpg，按播放顺序：从片尾倒回片头），在 MV 里的时间（秒）和处理方式
  var FB_T = [96.5, 80.6, 64.5, 33.5, 14.4, 2.2];
  var FB_HOW = ['none', 'invert', 'none', 'red', 'flip', 'none'];
  var FB_MS = [55, 60, 50, 65, 55, 260];                                         // 每张停多久（毫秒），最后一张「谎话」停久一点
  var FILTERS = { invert: 'invert(1)', red: 'grayscale(1) sepia(1) saturate(7) hue-rotate(-38deg) brightness(.9)', sick: 'hue-rotate(70deg) saturate(1.5)' };

  var q = location.search;
  var offset = /[?&]demo\b/.test(q) ? END - 8000 - Date.now() : 0;
  var demo = offset !== 0, forceStandby = /[?&]standby\b/.test(q), SEEN = 'make-studio-render-flashback-seen';
  function seen() { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  function markSeen() { if (demo) return; try { localStorage.setItem(SEEN, '1'); } catch (e) {} }
  var now = function () { return Date.now() + offset; };
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var hms = function (s) { s = Math.max(0, Math.floor(s)); return pad(s / 3600 | 0) + ':' + pad((s % 3600) / 60 | 0) + ':' + pad(s % 60); };
  var at = function (hm) { return Date.parse('2026-10-09T' + hm + ':00' + HK); };
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function hkStamp(ms) {
    var d = new Date(ms + 8 * 3600e3);
    return MON[d.getUTCMonth()] + ' ' + pad(d.getUTCDate()) + ' ' + d.getUTCFullYear() + '  ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' HKT';
  }

  // ---------------------------------------------------------------- 进度（每秒）
  [at(STEPS[1].from), at(STEPS[2].from)].forEach(function (t) {
    var m = document.createElement('div'); m.className = 'mark'; m.style.left = ((t - START) / (END - START) * 100).toFixed(2) + '%'; $('track').appendChild(m);
  });
  var phase = 'live';                                                            // live → flashback → standby
  function tick() {
    var t = now();
    $('stamp').textContent = hkStamp(t);
    if (phase !== 'live') return;
    var k = Math.min(1, Math.max(0, (t - START) / (END - START)));
    $('left').textContent = hms((END - t) / 1000);
    $('fill').style.width = (k * 100).toFixed(2) + '%'; $('headR').style.left = (k * 100).toFixed(2) + '%';
    $('pct').textContent = Math.floor(k * 100) + '%';
    var html = '';
    STEPS.forEach(function (s) {
      var a = at(s.from), b = at(s.to), st = t >= b ? 'done' : t >= a ? 'run' : 'wait';
      html += '<li class="step ' + st + '"><span class="led"></span><h2>' + s.name + '</h2>' +
        '<span class="chip">' + (st === 'done' ? '完成' : st === 'run' ? '进行中' : '排队') + '</span>' +
        '<span class="when">' + s.from + ' – ' + s.to + '</span></li>';
    });
    $('steps').innerHTML = html;
    if (t >= END) {
      phase = 'flashback';
      if (loaded && (seen() || still)) { standby(); return; }                       // 看过了：直接 Stand by.
      setTimeout(flashback, loaded ? 0 : 450);                                    // 页面开着时走到 13:00：进度条到头后停一下再闪回
    }
  }

  // ---------------------------------------------------------------- 倒计时弹窗
  var cd = $('cd'), frame = $('cdFrame'), lastFocus = null;
  function openCd() { lastFocus = document.activeElement; frame.src = 'countdown.html'; cd.hidden = false; document.body.style.overflow = 'hidden'; $('cdClose').focus(); }
  function closeCd() { cd.hidden = true; frame.src = 'about:blank'; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  Array.prototype.forEach.call(document.querySelectorAll('.cd-open'), function (b) { b.addEventListener('click', openCd); });
  $('cdClose').addEventListener('click', closeCd);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cd.hidden) closeCd(); });

  // ---------------------------------------------------------------- Stand by.
  function standby() {
    phase = 'standby'; document.documentElement.classList.remove('pre');
    $('main').hidden = true; $('fb').hidden = true; $('sb').hidden = false;
    $('rec').className = 'rec stby'; $('recTxt').textContent = 'STBY'; $('hudMode').textContent = '■ STOP';
    document.title = '谎话 · Stand by. | MAKE STUDIO';
  }

  // ---------------------------------------------------------------- MV 闪回
  var imgs = FB_T.map(function (_, i) { var im = new Image(); im.decoding = 'async'; im.src = '../assets/render/fb-' + i + '.jpg'; return im; });
  function ready() {
    return Promise.race([
      Promise.all(imgs.map(function (im) { return (im.decode ? im.decode() : Promise.resolve()).catch(function () {}); })),
      new Promise(function (r) { setTimeout(r, 5000); })
    ]);
  }
  function flashback() {
    if (still) { standby(); return; }
    ready().then(function () {
      var seq = [];
      for (var i = 0; i < imgs.length; i++) if (imgs[i].complete && imgs[i].naturalWidth) seq.push(i);
      if (!seq.length) { standby(); return; }
      var durs = seq.map(function (i) { return FB_MS[i]; });
      var fb = $('fb'), cv = $('fbc'), c = cv.getContext('2d');
      fb.hidden = false; document.body.style.overflow = 'hidden'; markSeen();
      var dpr = Math.min(1.5, window.devicePixelRatio || 1), cw, ch;
      function size() { cw = cv.width = Math.round(innerWidth * dpr); ch = cv.height = Math.round(innerHeight * dpr); }
      size(); window.addEventListener('resize', size);
      var sl = document.createElement('canvas'); sl.width = 1; sl.height = 3;                 // 扫描线
      var sx = sl.getContext('2d'); sx.fillStyle = 'rgba(0,0,0,.28)'; sx.fillRect(0, 0, 1, 1);
      var scan = c.createPattern(sl, 'repeat');
      var CRT = 420, BLACK = 500, total = durs.reduce(function (a, b) { return a + b; }, 0), t0 = performance.now(), f = 0;
      function rnd(a) { var x = Math.sin(a * 12.9898 + f * 78.233) * 43758.5453; return x - Math.floor(x); }
      function cover(im, dx, dy, s) {
        var r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight) * (s || 1), w = im.naturalWidth * r, h = im.naturalHeight * r;
        c.drawImage(im, (cw - w) / 2 + dx, (ch - h) / 2 + dy, w, h);
      }
      function tc(sec) { sec = Math.max(0, sec); var fr = Math.floor(sec * 30); return 'TC 00:' + pad(fr / 1800 | 0) + ':' + pad((fr / 30 | 0) % 60) + ':' + pad(fr % 30); }
      function hud(text, sec) {
        var fs = Math.round(Math.max(12, ch * .026));
        c.font = '700 ' + fs + "px 'R Pixel', monospace"; c.textBaseline = 'top'; c.fillStyle = 'rgba(240,244,255,.92)';
        if ((f >> 3) % 2 === 0) { c.textAlign = 'left'; c.fillText(text, fs * 1.6, fs * 1.4); }
        c.textAlign = 'right'; c.fillText('TAPE 01', cw - fs * 1.6, fs * 1.4);
        c.textBaseline = 'bottom'; c.fillText(tc(sec), cw - fs * 1.6, ch - fs * 1.4);
      }
      function vhs(since) {
        // 往上扫的跟踪噪声带
        for (var b = 0; b < 3; b++) {
          var bh = ch * (.025 + .02 * b), y = ((ch * 1.2 - ((performance.now() - t0) * .0011 * ch + b * ch * .41)) % (ch * 1.2) + ch * 1.2) % (ch * 1.2) - ch * .1;
          c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(0, y, cw, bh);
          for (var j = 0; j < 30; j++) { c.fillStyle = 'rgba(255,255,255,' + (.3 + rnd(j + b * 50) * .6) + ')'; c.fillRect(rnd(j * 3 + b) * cw, y + rnd(j * 7 + b) * bh, 20 + rnd(j * 11 + b) * cw * .08, 1.5 * dpr); }
        }
        // 底部磁头噪声
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, ch * .955, cw, ch * .035);
        for (var k = 0; k < 6; k++) { c.fillStyle = 'rgba(230,235,255,' + (.15 + rnd(k + 90) * .35) + ')'; c.fillRect(rnd(k + 70) * cw * .2 - cw * .1, ch * .957 + k * ch * .005, cw, 1.5 * dpr); }
        c.fillStyle = scan; c.fillRect(0, 0, cw, ch);
        if (since < 25) { c.fillStyle = 'rgba(255,255,255,' + (.3 * (1 - since / 25)) + ')'; c.fillRect(0, 0, cw, ch); }   // 换画面时闪一下
        var g = c.createRadialGradient(cw / 2, ch / 2, ch * .35, cw / 2, ch / 2, ch * .95);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = g; c.fillRect(0, 0, cw, ch);
      }
      function draw() {
        f++;
        var el = performance.now() - t0;
        c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.globalAlpha = 1;
        c.fillStyle = '#000'; c.fillRect(0, 0, cw, ch);
        if (el < total) {
          var acc = 0, j = 0; while (j < seq.length - 1 && acc + durs[j] <= el) { acc += durs[j]; j++; }
          var i = seq[j], since = el - acc, how = FB_HOW[i], im = imgs[i], last = j === seq.length - 1;
          var jx = (rnd(1) - .5) * 10 * dpr * (last ? .4 : 1), roll = since < 40 ? (1 - since / 40) * ch * .05 * (rnd(2) - .3) : 0;
          c.save();
          if (how === 'flip') { c.translate(cw, 0); c.scale(-1, 1); }
          if (FILTERS[how]) c.filter = FILTERS[how];
          cover(im, jx, roll, 1.02 + (last ? since / 4000 : 0));
          c.restore(); c.filter = 'none';
          if (!last || since < 50) for (var s = 0; s < 3; s++) {                          // 撕裂：几条横切错开
            var y0 = rnd(s + 20) * ch, h0 = ch * (.03 + rnd(s + 30) * .08), dx = (rnd(s + 40) - .5) * cw * .12;
            c.drawImage(cv, 0, y0, cw, h0, dx, y0, cw, h0);
          }
          vhs(since);
          hud(last ? '▶ PLAY' : '◀◀ REW', FB_T[i] - since / 1000 * 1.5);
        } else if (el < total + CRT) {                                           // CRT 关机：压成一条线，再缩成一个点
          var k2 = (el - total) / CRT, syk = Math.max(.004, 1 - Math.min(1, k2 / .55)), sxk = k2 < .55 ? 1 : Math.max(.003, 1 - (k2 - .55) / .45);
          c.save(); c.translate(cw / 2, ch / 2); c.scale(sxk, syk); c.translate(-cw / 2, -ch / 2);
          c.filter = 'brightness(' + (1 + k2 * 3) + ')'; cover(imgs[seq[seq.length - 1]], 0, 0, 1.02); c.restore(); c.filter = 'none';
          c.fillStyle = 'rgba(255,255,255,' + (.6 * k2) + ')'; c.fillRect(cw / 2 - cw * sxk / 2, ch / 2 - Math.max(2, ch * syk) / 2, cw * sxk, Math.max(2, ch * syk));
        } else if (el < total + CRT + BLACK) {
          if (el < total + CRT + 140) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(cw / 2, ch / 2, 3 * dpr, 0, 7); c.fill(); }
        } else { window.removeEventListener('resize', size); document.body.style.overflow = ''; standby(); return; }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    });
  }

  // ---------------------------------------------------------------- 雨：和 MV 里同一场雨（斜着下，风 0.22），远处几盏路灯的光斑
  var cv = $('rain'), c = cv.getContext('2d'), W = 0, H = 0;
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rnd(1), drops = [], r2 = rnd(5), lights = [];
  for (var i = 0; i < 220; i++) drops.push({ x: R(), y: R(), l: .5 + R(), v: .8 + R() * .5, a: .25 + R() * .55 });
  for (var j = 0; j < 12; j++) lights.push({ x: r2(), y: .25 + r2() * .6, r: 30 + r2() * 90, warm: r2() < .25, ph: r2() * 6.28, a: .04 + r2() * .08 });
  function size() { var d = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); }
  function draw(t) {
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#010309'); g.addColorStop(1, '#0a1430');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    lights.forEach(function (L) {
      var x = L.x * W + Math.sin(t * .00007 + L.ph) * 30, y = L.y * H, a = L.a * (.75 + .25 * Math.sin(t * .0005 + L.ph));
      var rg = c.createRadialGradient(x, y, 0, x, y, L.r);
      rg.addColorStop(0, L.warm ? 'rgba(255,170,90,' + a + ')' : 'rgba(90,124,255,' + a + ')'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = rg; c.fillRect(x - L.r, y - L.r, L.r * 2, L.r * 2);
    });
    var span = H + 140, wind = .22;
    c.lineWidth = 1; c.lineCap = 'round';
    drops.forEach(function (d) {
      var y = ((d.y * span + t * .9 * d.v) % span) - 70, x = ((d.x * (W + 200) + y * wind) % (W + 200)) - 100, L = 34 * d.l;
      c.strokeStyle = 'rgba(205,212,230,' + (d.a * .5) + ')'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L * wind, y + L); c.stroke();
    });
  }
  function loop(t) { draw(t); if (!still) requestAnimationFrame(loop); }
  size(); window.addEventListener('resize', function () { size(); if (still) draw(0); });
  requestAnimationFrame(loop);

  // ---------------------------------------------------------------- 开始
  var loaded = true;                                                             // 第一次 tick：这时已经过了 13:00 说明是之后才打开的
  if (forceStandby) standby();
  else if (now() < END) document.title = '谎话 · 渲染中 | MAKE STUDIO';
  tick(); loaded = false; setInterval(tick, 1000);
})();

/* 站点交互：开场、NIGHT/DAY、日期戳、导航、走带（时间码 / FF / REW / STOP）、出现动画、复制、下一盘带、时间线 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pad(n) { return String(n).padStart(2, '0'); }
  function $(id) { return document.getElementById(id); }

  /* ---- 开场：录像机蓝屏 PLAY ▶（这次打开只放一次） ---- */
  (function () {
    var seen = false;
    try { seen = sessionStorage.getItem('make-studio-boot') === '1'; sessionStorage.setItem('make-studio-boot', '1'); } catch (e) {}
    if (seen || reduce) { root.classList.add('ready'); return; }
    root.classList.add('boot');
    setTimeout(function () { root.classList.remove('boot'); root.classList.add('ready'); }, 650);
  })();

  /* ---- NIGHT / DAY ---- */
  (function () {
    var KEY = 'make-studio-theme', btn = $('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', t);
      try { localStorage.setItem(KEY, t); } catch (e) {}
    });
  })();

  /* ---- 摄像机日期戳 ---- */
  (function () {
    var d = $('clk-d'), t = $('clk-t'), clk = $('clk');
    if (!t) return;
    function tick() {
      var n = new Date();
      t.textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds());
      if (d) d.textContent = n.getFullYear() + '.' + pad(n.getMonth() + 1) + '.' + pad(n.getDate());
    }
    tick(); setInterval(tick, 1000);
    if (clk) clk.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clk.click(); } });
    var y = $('foot-year'); if (y) y.textContent = new Date().getFullYear();
  })();

  /* ---- 导航：手机菜单 ---- */
  var nav = $('nav');
  (function () {
    var btn = $('nav-burger');
    if (!nav || !btn) return;
    function set(o) {
      nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      btn.setAttribute('aria-label', o ? '关闭菜单' : '打开菜单'); btn.textContent = o ? 'CLOSE' : 'MENU';
      document.body.style.overflow = o ? 'hidden' : '';
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!nav.classList.contains('open')); });
    nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) set(false); });
  })();

  /* ---- 走带：时间码跟着滚动；快速往下 FF、往上 REW，到底 STOP；左上角 TAPE 号跟着章节 ---- */
  (function () {
    var tc = $('hud-tc'), mode = $('hud-mode'), tapeNo = $('tape-no');
    var links = nav ? nav.querySelectorAll('.nav-links a') : [];
    var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-ch]')).filter(function (el) { return el.tagName !== 'A'; });
    var lastY = window.scrollY, lastT = performance.now(), cur = '', idleTimer = null, ticking = false;
    var PX_PER_FRAME = 3;                                        // 每滚 3px 走一帧（30 帧 = 1 秒）
    function fmtTC(f) { var s = Math.floor(f / 30); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(f % 30); }
    function setMode(m) {
      if (!mode || mode.dataset.m === m) return;
      mode.dataset.m = m; mode.className = 'hud-mode ' + m;
      mode.textContent = { play: '▶ PLAY', ff: '▶▶ FF', rew: '◀◀ REW', stop: '■ STOP' }[m];
    }
    function update() {
      ticking = false;
      var y = window.scrollY, now = performance.now(), v = (y - lastY) / Math.max(16, now - lastT);
      lastY = y; lastT = now;
      if (tc) tc.textContent = fmtTC(Math.max(0, Math.round(y / PX_PER_FRAME)));
      var atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atEnd) setMode('stop');
      else if (v > 1.2) setMode('ff');
      else if (v < -1.2) setMode('rew');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { if (!(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)) setMode('play'); }, 260);
      if (nav) nav.classList.toggle('scrolled', y > 30);
      /* 当前章节：屏幕 40% 高度处落在哪一章 */
      var mid = window.innerHeight * .4, ch = '00';
      for (var i = 0; i < chapters.length; i++) { if (chapters[i].getBoundingClientRect().top <= mid) ch = chapters[i].getAttribute('data-ch'); }
      if (ch !== cur) {
        cur = ch;
        if (tapeNo) tapeNo.textContent = ch === 'END' ? 'END' : 'TAPE ' + ch;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-ch') === ch); });
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update(); setMode('play');
  })();

  /* ---- 出现：滚到才"接上信号" ---- */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-in], .mani'));
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      var batch = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.style.setProperty('--d', (batch++ * .08) + 's');
        e.target.classList.add('in');
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---- 点一下复制 ---- */
  (function () {
    var toast = $('copy-toast'), txt = $('ct-text'), timer = null;
    function show(t) { if (!toast) return; var v = String(t || ''); if (v.length > 28) v = v.slice(0, 28) + '…'; txt.textContent = 'COPIED ✓ ' + v; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(function () { toast.classList.remove('show'); }, 1800); }
    function fallback(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }
    document.querySelectorAll('[data-copy]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var t = el.getAttribute('data-copy'); if (!t) return;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { show(t); }).catch(function () { fallback(t); show(t); });
        else { fallback(t); show(t); }
        var c = el.querySelector('.row-c');
        el.classList.add('copied'); if (c) c.textContent = 'COPIED ✓';
        setTimeout(function () { el.classList.remove('copied'); if (c) c.textContent = 'COPY'; }, 1500);
      });
    });
  })();

  /* ---- 下一盘带：《谎话》2026-10-17 00:00（香港时间）倒数；到点变 OUT NOW ---- */
  (function () {
    var rel = $('rel'); if (!rel) return;
    var END = Date.UTC(2026, 9, 16, 16, 0, 0);
    var k = $('rel-k'), d = $('rel-d'), cd = $('rel-cd'), tlNext = $('tl-next');
    function tick() {
      var ms = END - Date.now();
      if (ms <= 0) {
        rel.classList.add('out'); k.textContent = 'OUT NOW'; d.textContent = '10.17 已首发'; cd.textContent = '去看 MV';
        rel.setAttribute('aria-label', '《谎话》MV 已首发');
        if (tlNext) tlNext.textContent = 'OUT NOW · 去看 →';
        return;
      }
      var s = Math.floor(ms / 1000);
      cd.textContent = 'T-' + Math.floor(s / 86400) + 'D ' + pad(Math.floor(s % 86400 / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
      setTimeout(tick, 1000 - Date.now() % 1000);
    }
    tick();
  })();

  /* ---- 时间线：按真实日期摆位置；红色播放头停在"今天" ---- */
  (function () {
    var tl = $('tl'); if (!tl) return;
    var A = Date.UTC(2023, 6, 1), B = Date.UTC(2027, 6, 1);
    function x(t) { return Math.max(0, Math.min(100, (t - A) / (B - A) * 100)); }
    tl.querySelectorAll('.mk').forEach(function (m) { var p = m.getAttribute('data-date').split('-'); m.style.setProperty('--x', x(Date.UTC(+p[0], +p[1] - 1, +p[2])).toFixed(2) + '%'); });
    var years = tl.querySelectorAll('.tl-ruler span');
    years.forEach(function (s) { s.style.setProperty('--x', x(Date.UTC(+s.textContent, 0, 1)).toFixed(2) + '%'); });
    var head = $('tl-head'); if (head) head.style.setProperty('--x', x(Date.now()).toFixed(2) + '%');
  })();

  /* ---- 答录机：有人在打字时亮 ● REC ---- */
  (function () {
    var m = $('machine'); if (!m) return;
    var t = null;
    m.addEventListener('input', function () { m.classList.add('rec'); clearTimeout(t); t = setTimeout(function () { m.classList.remove('rec'); }, 1600); });
    m.addEventListener('focusin', function (e) { if (e.target.matches('textarea, input')) m.classList.add('rec'); });
    m.addEventListener('focusout', function () { clearTimeout(t); t = setTimeout(function () { m.classList.remove('rec'); }, 300); });
  })();
})();

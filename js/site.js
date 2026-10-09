/* 站点交互：首页画面轮换、夜 / 昼、时钟、导航、淡入、复制、《谎话》首发倒数 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pad(n) { return String(n).padStart(2, '0'); }
  function $(id) { return document.getElementById(id); }

  /* ---- 首页：三帧《谎话》MV 画面慢慢切换（字幕连起来是一小段） ---- */
  (function () {
    var box = $('stills'); if (!box) return;
    var frames = Array.prototype.slice.call(box.querySelectorAll('.still')), tc = $('still-tc'), i = 0, timer = null;
    var first = frames[0].querySelector('img');
    function ready() { root.classList.add('ready'); }
    if (first.complete) ready(); else { first.addEventListener('load', ready); first.addEventListener('error', ready); setTimeout(ready, 1200); }
    if (reduce || frames.length < 2) return;
    /* 第一帧出来后再去加载另外两帧 */
    window.addEventListener('load', function () { frames.forEach(function (f) { var im = f.querySelector('img[data-src]'); if (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); } }); });
    function show(n) {
      var next = frames[n], im = next.querySelector('img');
      if (!im.complete || !im.naturalWidth) return false;
      frames[i].classList.remove('on'); next.classList.add('on'); i = n;
      if (tc) tc.textContent = next.getAttribute('data-tc');
      return true;
    }
    function tick() { show((i + 1) % frames.length); }
    function start() { stop(); timer = setInterval(tick, 7000); }
    function stop() { clearInterval(timer); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  })();

  /* ---- 夜 / 昼 ---- */
  (function () {
    var KEY = 'make-studio-theme', btn = $('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', t);
      try { localStorage.setItem(KEY, t); } catch (e) {}
    });
  })();

  /* ---- 时钟（点 3 下有成就，点 6 下进倒数页——在 achievements.js 里） ---- */
  (function () {
    var t = $('clk-t'), clk = $('clk');
    if (t) { var tick = function () { var n = new Date(); t.textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds()); }; tick(); setInterval(tick, 1000); }
    if (clk) clk.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clk.click(); } });
    var y = $('foot-year'); if (y) y.textContent = new Date().getFullYear();
  })();

  /* ---- 导航：翻过首页画面后变实底；当前章节下划线；手机菜单 ---- */
  (function () {
    var nav = $('nav'), hero = $('hero'), btn = $('nav-burger');
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links a'));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('data-ch')); });
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY, h = hero ? hero.offsetHeight : 0;
      nav.classList.toggle('solid', y > h - 80);
      var mid = window.innerHeight * .35, cur = -1;
      secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top <= mid) cur = k; });
      links.forEach(function (a, k) { a.classList.toggle('on', k === cur); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    if (!btn) return;
    function set(o) {
      nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); btn.setAttribute('aria-label', o ? '关闭菜单' : '打开菜单');
      document.body.style.overflow = o ? 'hidden' : '';
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!nav.classList.contains('open')); });
    links.forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) set(false); });
  })();

  /* ---- 淡入：滚到才出现（同一批错开一点） ---- */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-in]'));
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      var batch = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.style.setProperty('--d', (batch++ * .08) + 's');
        e.target.classList.add('in');
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---- 点一行复制 ---- */
  (function () {
    var toast = $('copy-toast'), txt = $('ct-text'), timer = null;
    function show(t) { if (!toast) return; txt.textContent = '已复制  ' + t; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(function () { toast.classList.remove('show'); }, 1800); }
    function fallback(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }
    document.querySelectorAll('[data-copy]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var t = el.getAttribute('data-copy'); if (!t) return;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { show(t); }).catch(function () { fallback(t); show(t); });
        else { fallback(t); show(t); }
        var c = el.querySelector('.row-c');
        el.classList.add('copied'); if (c) c.textContent = '已复制 ✓';
        setTimeout(function () { el.classList.remove('copied'); if (c) c.textContent = '复制'; }, 1600);
      });
    });
  })();

  /* ---- 《谎话》首发倒数：2026-10-17 00:00（香港时间）；进度条从官宣（10-09 12:16）走到首发；到点变 OUT NOW ---- */
  (function () {
    var rel = $('rel'); if (!rel) return;
    var START = Date.UTC(2026, 9, 9, 4, 16, 0), END = Date.UTC(2026, 9, 16, 16, 0, 0);
    var cd = $('rel-cd'), bar = $('rel-bar'), k = $('rel-k'), tag = $('rel-tag'), go = $('rel-go'), tlNext = $('tl-next');
    function tick() {
      var now = Date.now(), ms = END - now;
      bar.style.width = (Math.max(0, Math.min(1, (now - START) / (END - START))) * 100).toFixed(2) + '%';
      if (ms <= 0) {
        rel.classList.add('out'); k.textContent = 'OUT NOW'; tag.textContent = '已首发'; cd.textContent = '2026.10.17 首发'; go.textContent = '去看 MV →';
        rel.setAttribute('aria-label', '《谎话》MV 已首发');
        if (tlNext) tlNext.textContent = '已首发 · 去看 →';
        return;
      }
      var s = Math.floor(ms / 1000);
      cd.textContent = '还剩 ' + Math.floor(s / 86400) + ' 天 ' + pad(Math.floor(s % 86400 / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
      setTimeout(tick, 1000 - Date.now() % 1000);
    }
    tick();
  })();
})();

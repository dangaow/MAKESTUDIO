/* 首页背景：雨夜的玻璃——失焦的路灯光斑 + 斜雨，12 帧/秒抽帧（和《谎话》MV 的雨夜一样）
   只在首页看得见时才画；系统开了"减少动态效果"就只画一张静止的 */
(function () {
  'use strict';
  var cv = document.getElementById('rain');
  if (!cv || !cv.getContext) return;
  var c = cv.getContext('2d'), root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, bokeh = [], drops = [], visible = true, t0 = performance.now(), timer = null;

  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var COLS = [[74, 108, 255], [74, 108, 255], [205, 216, 255], [205, 216, 255], [255, 196, 140], [255, 42, 60]];

  function build() {
    var r = rng(7), n = Math.max(18, Math.round(W * H / 24000)), m = Math.round(W / 10);
    bokeh = []; drops = [];
    for (var i = 0; i < n; i++) {
      var col = COLS[r() < .06 ? 5 : r() < .14 ? 4 : Math.floor(r() * 4)];
      bokeh.push({ x: r() * W, y: r() * H * .9, rad: 12 + r() * r() * 70, col: col, a: .07 + r() * .26, ph: r() * 6.28, sp: .3 + r() * .6, dx: (r() - .5) * 10 });
    }
    for (var j = 0; j < m; j++) drops.push({ x: r() * (W + 200) - 100, y: r() * H, len: 24 + r() * 70, spd: 700 + r() * 900, a: .05 + r() * .18, w: .6 + r() * 1.1 });
  }
  function resize() {
    var dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(); draw();
  }
  function draw() {
    var t = (performance.now() - t0) / 1000, day = root.getAttribute('data-theme') === 'light';
    var g = c.createLinearGradient(0, 0, 0, H);
    if (day) { g.addColorStop(0, '#dfe2ea'); g.addColorStop(1, '#c9d0e0'); }
    else { g.addColorStop(0, '#04050a'); g.addColorStop(.6, '#070b18'); g.addColorStop(1, '#0b1532'); }
    c.globalCompositeOperation = 'source-over'; c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = day ? 'multiply' : 'lighter';
    for (var i = 0; i < bokeh.length; i++) {
      var b = bokeh[i], a = b.a * (.7 + .3 * Math.sin(t * b.sp + b.ph)) * (day ? .6 : 1);
      var x = b.x + Math.sin(t * .2 + b.ph) * b.dx, rg = c.createRadialGradient(x, b.y, 0, x, b.y, b.rad);
      var col = b.col.join(',');
      rg.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); rg.addColorStop(.7, 'rgba(' + col + ',' + (a * .55).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = rg; c.beginPath(); c.arc(x, b.y, b.rad, 0, 6.283); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = day ? 'rgba(40,52,90,.5)' : 'rgba(200,214,255,1)';
    for (var j = 0; j < drops.length; j++) {
      var d = drops[j], y = (d.y + d.spd * t) % (H + d.len) - d.len, x0 = d.x + y * .18;
      c.globalAlpha = d.a; c.lineWidth = d.w;
      c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + d.len * .18, y + d.len); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function loop() {
    clearTimeout(timer);
    if (!visible || document.hidden || reduce) return;
    draw();
    timer = setTimeout(loop, 1000 / 12);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(cv);
  }
  document.addEventListener('visibilitychange', loop);
  window.addEventListener('resize', function () { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
  new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  resize(); loop();
})();

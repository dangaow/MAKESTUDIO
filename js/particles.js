/* 背景粒子画布：颜色随主题（MS.theme）实时切换；移动端跳过连线以降低 CPU 开销 */
(function(){
  'use strict';
  var MS = window.MS = window.MS || {};
  var cvs = document.getElementById('bg-canvas'); if(!cvs) return;
  var ctx = cvs.getContext('2d'); if(!ctx) return;

  var PALETTE = {
    dark:  { cols:['rgba(99,102,241,','rgba(236,72,153,','rgba(34,211,238,','rgba(168,85,247,','rgba(250,204,21,'], core:'rgba(255,255,255,.8)', line:'rgba(168,85,247,' },
    light: { cols:['rgba(91,91,214,','rgba(217,70,136,','rgba(14,116,144,','rgba(109,40,217,','rgba(180,83,9,'],   core:'rgba(28,28,40,.45)', line:'rgba(109,40,217,' }
  };
  function palette(){ return MS.theme === 'light' ? PALETTE.light : PALETTE.dark; }

  var W, H, pt = [], dpr = 1, maxD = 100, maxD2 = 10000, isMobile = false;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cvs.width = window.innerWidth * dpr; H = cvs.height = window.innerHeight * dpr;
    cvs.style.width = window.innerWidth + 'px'; cvs.style.height = window.innerHeight + 'px';
    var mob = window.innerWidth < 720; isMobile = mob; maxD = (mob ? 70 : 100) * dpr; maxD2 = maxD * maxD;
    var glowR = mob ? 5 : 8, n = Math.min(mob ? 35 : 60, Math.floor((window.innerWidth * window.innerHeight) / (mob ? 30000 : 22000)));
    var nCols = palette().cols.length;
    pt = [];
    for(var i = 0; i < n; i++) pt.push({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.3*dpr, vy:(Math.random()-.5)*.3*dpr, r:(Math.random()*1.2+.4)*dpr, gr:glowR, cIdx:Math.floor(Math.random()*nCols), a:Math.random()*.5+.15 });
  }
  resize(); window.addEventListener('resize', resize);
  if(window.visualViewport) window.visualViewport.addEventListener('resize', resize);

  function draw(){
    var pal = palette(), COLS = pal.cols;
    ctx.clearRect(0, 0, W, H);
    for(var i = 0; i < pt.length; i++){
      var p = pt[i]; p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*p.gr);
      g.addColorStop(0, COLS[p.cIdx] + (p.a*.6) + ')'); g.addColorStop(1, COLS[p.cIdx] + '0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r*p.gr, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = pal.core; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.lineWidth = .5 * dpr;
    if(!isMobile){
      for(var a = 0; a < pt.length; a++) for(var b = a + 1; b < pt.length; b++){
        var dx = pt[a].x - pt[b].x, dy = pt[a].y - pt[b].y, d2 = dx*dx + dy*dy;
        if(d2 < maxD2){ ctx.strokeStyle = pal.line + ((1 - Math.sqrt(d2)/maxD) * .2) + ')'; ctx.beginPath(); ctx.moveTo(pt[a].x, pt[a].y); ctx.lineTo(pt[b].x, pt[b].y); ctx.stroke(); }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

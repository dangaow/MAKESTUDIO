/* 页面基础交互：时钟、移动端菜单、导航滚动、标题尺寸、区块渐显 + 理念打字机、点击复制 */
(function(){
  'use strict';

  /* ---- 首屏时钟 ---- */
  (function(){
    var clk = document.getElementById('clk'); if(!clk) return;
    function pad(n){ return String(n).padStart(2, '0'); }
    function tick(){ var d = new Date(); clk.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
    tick(); setInterval(tick, 1000);
  })();

  /* ---- 移动端汉堡菜单 ---- */
  (function(){
    var nav = document.getElementById('nav'), btn = document.getElementById('nav-burger');
    if(!nav || !btn) return;
    function set(o){
      nav.classList.toggle('open', o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      btn.setAttribute('aria-label', o ? '关闭菜单' : '打开菜单');
    }
    btn.addEventListener('click', function(e){ e.stopPropagation(); set(!nav.classList.contains('open')); });
    nav.querySelectorAll('.nav-links a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && nav.classList.contains('open')) set(false); });
    document.addEventListener('click', function(e){ if(nav.classList.contains('open') && !nav.contains(e.target)) set(false); });
  })();

  /* ---- 导航随滚动收紧 + 标题视差淡出 ---- */
  (function(){
    var nav = document.getElementById('nav'), ht = document.getElementById('h-t'), ticking = false;
    var isMob = window.innerWidth < 700, BASE = isMob ? 14 : 20, SCROLLED = isMob ? 12 : 16;
    function onScroll(){
      var y = window.scrollY, vh = window.innerHeight;
      if(nav){
        var p = Math.min(1, Math.max(0, y / 150)), e = 1 - Math.pow(1 - p, 3), pad = BASE - (BASE - SCROLLED) * e;
        nav.style.transform = 'translateY(' + (-4 * e).toFixed(1) + 'px)';
        nav.style.paddingTop = 'calc(' + pad.toFixed(1) + 'px + env(safe-area-inset-top))';
        nav.style.paddingBottom = pad.toFixed(1) + 'px';
        nav.style.setProperty('--nav-bg-alpha', (0.72 * e).toFixed(3));
        nav.style.setProperty('--nav-blur', Math.round(20 * e) + 'px');
      }
      if(ht && y < vh){ ht.style.transform = 'translateY(' + (y * .2) + 'px)'; ht.style.opacity = String(Math.max(0, 1 - y / (vh * .65))); }
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, { passive:true });
    onScroll();
  })();

  /* ---- 首屏标题：按视口宽度定字号，入场动画结束后切换为渐变流动 ---- */
  (function(){
    var ht = document.getElementById('h-t'); if(!ht) return;
    function fit(){ var w = window.innerWidth; ht.style.fontSize = (w < 600 ? Math.floor(w / 4.8) : Math.min(Math.floor(w / 6.5), 200)) + 'px'; }
    fit(); window.addEventListener('resize', fit);
    ht.addEventListener('animationend', function(e){
      if(e.animationName === 'fadeUp'){ ht.style.animation = 'hueShift 12s ease infinite'; ht.style.opacity = '1'; ht.style.transform = 'translateY(0)'; }
    });
  })();

  /* ---- 区块进入视口渐显；理念区块进入视口时才开始打字 ---- */
  (function(){
    var LINES = [
      [{c:'M',cls:'c-m'},'u','c','h',' ','l','u','v','v'],
      [{c:'A',cls:'c-a'},'n','d'],
      [{c:'K',cls:'c-k'},'e','e','p',' ','g','o','i','n','g'],
      ['c','a','n',' ',{c:'M',cls:'c-m'},{c:'A',cls:'c-a'},{c:'K',cls:'c-k'},{c:'E',cls:'c-e'}],
      [{c:'E',cls:'c-e'},'v','e','r','y','t','h','i','n','g']
    ];
    var SHIFTED = [false, false, false, true, false];
    var typed = false, phil = document.getElementById('phil-body');

    function typeLines(){
      if(typed || !phil) return;
      typed = true; phil.innerHTML = '';
      var li = 0, ci = 0, cur = null, caret = document.createElement('span');
      caret.className = 'type-cursor';
      function nextLine(){
        if(li >= LINES.length){ caret.style.cssText = 'animation:none;opacity:1;background:rgba(34,211,238,.4);width:20px;height:2px;margin-left:8px;box-shadow:none'; return; }
        cur = document.createElement('div');
        cur.className = 'pl' + (SHIFTED[li] ? ' pl-shift' : '');
        phil.appendChild(cur); cur.appendChild(caret); ci = 0;
        setTimeout(nextChar, 250);
      }
      function nextChar(){
        if(ci >= LINES[li].length){ li++; setTimeout(nextLine, 400); return; }
        var ch = LINES[li][ci];
        if(typeof ch === 'string') cur.insertBefore(document.createTextNode(ch), caret);
        else{ var s = document.createElement('span'); s.className = ch.cls; s.textContent = ch.c; cur.insertBefore(s, caret); }
        ci++; setTimeout(nextChar, 60 + Math.random() * 40);
      }
      setTimeout(nextLine, 300);
    }

    var secs = document.querySelectorAll('.sec');
    function show(s){
      if(s.classList.contains('vis')) return;
      s.classList.add('vis');
      if(s.id === 'sec-phil') typeLines();
    }
    /* 区块顶部进入视口下方 88% 范围才算可见 */
    function isVisible(el){
      var r = el.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.88 && r.bottom > 0;
    }
    function check(){ secs.forEach(function(s){ if(isVisible(s)) show(s); }); }

    if('IntersectionObserver' in window){
      var o = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) show(e.target); }); }, { threshold:0, rootMargin:'0px 0px -12% 0px' });
      secs.forEach(function(s){ o.observe(s); });
    }
    var tick = false;
    window.addEventListener('scroll', function(){ if(!tick){ requestAnimationFrame(function(){ check(); tick = false; }); tick = true; } }, { passive:true });
    window.addEventListener('resize', check);
    /* 稍微延后首次检查，避免在用户看到之前就触发 */
    setTimeout(check, 100);
  })();

  /* ---- 页脚年份 + 联系方式点击复制 ---- */
  (function(){
    var year = document.getElementById('foot-year');
    if(year) year.textContent = new Date().getFullYear();

    var toast = document.getElementById('copy-toast'), toastTxt = document.getElementById('ct-text'), timer = null;
    function show(t){
      if(!toast) return;
      var v = String(t || '文本'); if(v.length > 26) v = v.slice(0, 26) + '…';
      toastTxt.textContent = 'cp "' + v + '" → clipboard ✓';
      toast.classList.add('show');
      clearTimeout(timer); timer = setTimeout(function(){ toast.classList.remove('show'); }, 2000);
    }
    function fallback(t){
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(ta);
    }
    document.querySelectorAll('.con-card[data-copy]').forEach(function(card){
      card.addEventListener('click', function(e){
        e.preventDefault();
        var t = card.getAttribute('data-copy'); if(!t) return;
        if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ show(t); }).catch(function(){ fallback(t); show(t); });
        else{ fallback(t); show(t); }
        card.style.transform = 'scale(.97)'; setTimeout(function(){ card.style.transform = ''; }, 150);
      });
    });
  })();
})();

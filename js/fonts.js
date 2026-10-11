/* 字体：Cache API + FontFace 本地加载（首次下载后缓存，二次秒开） */
(function(){
  'use strict';
  var CACHE_NAME = 'make-studio-fonts-v1';
  var FONT_LIST = [
    { family:'Saira Extra Condensed', weight:'100', url:'assets/fonts/saira-100.woff2' },
    { family:'Caveat', weight:'400 700', url:'assets/fonts/caveat-var.woff2' },
    { family:'JetBrains Mono', weight:'100 800', url:'assets/fonts/jbm-var.woff2' },
    { family:'Orbitron', weight:'400 900', url:'assets/fonts/orbitron-var.woff2' }
  ];

  async function fetchFontBytes(url){
    var absoluteUrl = new URL(url, window.location.href).href;
    var cache = null;

    if(window.caches){
      try{
        cache = await caches.open(CACHE_NAME);
        var hit = await cache.match(absoluteUrl);
        if(hit){ console.log('[FONT] 命中缓存:', url); return await hit.arrayBuffer(); }
      }catch(e){ console.warn('[FONT] 缓存读取失败', e && e.name, e && e.message); }
    }else{
      console.warn('[FONT] 当前环境不支持 Cache API，字体无法本地缓存');
    }

    var res = await fetch(url);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    var buf = await res.arrayBuffer();

    if(cache){
      try{
        await cache.put(absoluteUrl, new Response(buf));
        console.log('[FONT] 已写入缓存:', url);
      }catch(e){ console.warn('[FONT] 缓存写入失败', e && e.name, e && e.message); }
    }
    return buf;
  }

  if(!('FontFace' in window) || !document.fonts) return;
  FONT_LIST.forEach(function(f){
    fetchFontBytes(f.url).then(function(buf){
      var face = new FontFace(f.family, buf, { style:'normal', weight:f.weight });
      document.fonts.add(face);
      return face.load();
    }).then(function(){
      console.log('[FONT] 已加载:', f.family, f.weight);
    }).catch(function(e){
      console.warn('[FONT] 加载失败:', f.url, e && e.message);
    });
  });
})();

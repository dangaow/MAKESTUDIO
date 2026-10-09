/* 成就：彩蛋成就 + 隐藏成就，进度存在本地（键名沿用旧版，已解锁的不会丢） */
(function(){
  'use strict';
  var KEY = 'make-studio-achievements';

  var DEF = [
    {id:'mail_terminal', name:'老机器的秘密', desc:'发现墙角的收信终端', secret:false},
    {id:'hack_log',       name:'系统入侵',     desc:'在更新日志里窥见被拦截的信号', secret:false},
    {id:'play_all',       name:'从头到尾',     desc:'听完整站每一首歌', secret:false},
    {id:'theme_master',   name:'明暗之间',     desc:'切换主题 10 次', secret:false},
    {id:'hidden_konami',  name:'上上下下',     desc:'经典秘籍，心照不宣', secret:true},
    {id:'hidden_lurker',  name:'耐心的潜伏者', desc:'在这个页面安静停留一分钟', secret:true},
    {id:'hidden_clock',   name:'时间旅人',     desc:'在时间的刻度上敲了三下', secret:true},
    {id:'hidden_brand',   name:'署名之后',     desc:'反复读过工作室的铭牌', secret:true}
  ];

  var state = { achievements: [], totalUnlocked: 0, lastChecked: 0 };

  function load(){
    try{
      var raw = localStorage.getItem(KEY);
      if(raw){
        var saved = JSON.parse(raw);
        if(saved && saved.achievements && saved.achievements.length){
          var map = {};
          saved.achievements.forEach(function(a){ map[a.id] = a; });
          state.achievements = DEF.map(function(d){
            var s = map[d.id];
            return {
              id:d.id, name:d.name, desc:d.desc, secret:d.secret,
              unlocked: !!(s && s.unlocked), time:(s && s.time)||0
            };
          });
          state.totalUnlocked = state.achievements.filter(function(a){return a.unlocked}).length;
          state.lastChecked = saved.lastChecked || 0;
          return;
        }
      }
    }catch(e){}
    state.achievements = DEF.map(function(d){
      return {id:d.id, name:d.name, desc:d.desc, secret:d.secret, unlocked:false, time:0};
    });
    state.totalUnlocked = 0;
    state.lastChecked = Date.now();
    save();
  }

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
  }

  function get(id){
    for(var i=0;i<state.achievements.length;i++) if(state.achievements[i].id===id) return state.achievements[i];
    return null;
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  /* ---- 解锁 ---- */
  function unlock(id, opts){
    var a = get(id);
    if(!a || a.unlocked) return;
    a.unlocked = true;
    a.time = Date.now();
    state.totalUnlocked = state.achievements.filter(function(x){return x.unlocked}).length;
    state.lastChecked = Date.now();
    save();
    toast(a, opts && opts.silent);
    render();
  }

  /* ---- 解锁提示（DOS 打字机风格） ---- */
  var queue = [], showing = false;
  function toast(a, silent){
    if(silent) return;
    queue.push(a);
    pump();
  }
  function pump(){
    if(showing || !queue.length) return;
    var a = queue.shift();
    showing = true;
    var stack = document.getElementById('ach-toasts');
    if(!stack){ showing = false; pump(); return; }
    var el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML =
      '<div class="ach-ti"><span class="ach-star">◆</span><span class="ach-tag">ACHIEVEMENT UNLOCKED</span></div>' +
      '<div class="ach-body">' +
        '<div class="ach-name"><span class="ach-n"></span><span class="cursor"></span></div>' +
        '<div class="ach-desc"></div>' +
        '<div class="ach-prog">当前进度 <b>' + state.totalUnlocked + '</b> / ' + state.achievements.length + '</div>' +
      '</div>';
    stack.appendChild(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('show'); }); });

    var nEl = el.querySelector('.ach-n');
    var dEl = el.querySelector('.ach-desc');
    var i = 0;
    var t = setInterval(function(){
      i++;
      nEl.textContent = a.name.slice(0, i);
      if(i >= a.name.length){ clearInterval(t); dEl.textContent = a.desc; }
    }, 32);

    var life = setTimeout(dismiss, 4200);
    function dismiss(){
      clearTimeout(life);
      clearInterval(t);
      el.classList.remove('show');
      setTimeout(function(){
        if(el.parentNode) el.parentNode.removeChild(el);
        showing = false;
        pump();
      }, 450);
    }
    el.addEventListener('click', dismiss);
  }

  /* ---- 总览渲染 ---- */
  function render(){
    var total = state.achievements.length;
    var done = state.totalUnlocked;
    var pct = Math.round(done / total * 100);
    var doneEl = document.getElementById('ach-done');
    var totalEl = document.getElementById('ach-total');
    var pctEl = document.getElementById('ach-pct');
    var fillEl = document.getElementById('ach-fill');
    var listEl = document.getElementById('ach-list');
    var entryEl = document.getElementById('ach-entry');
    if(entryEl) entryEl.textContent = '成就 · ' + done + '/' + total;
    if(doneEl) doneEl.textContent = done;
    if(totalEl) totalEl.textContent = total;
    if(pctEl) pctEl.textContent = pct + '%';
    if(fillEl) fillEl.style.width = pct + '%';
    if(listEl){
      var html = '';
      state.achievements.forEach(function(a){
        if(a.unlocked){
          html += '<div class="ach-row done">' +
            '<span class="ach-mark">✓</span>' +
            '<div><div class="ach-rn">' + esc(a.name) + '</div><div class="ach-rd">' + esc(a.desc) + '</div></div>' +
          '</div>';
        }else{
          html += '<div class="ach-row lock">' +
            '<span class="ach-mark">✕</span>' +
            '<div><div class="ach-rn' + (a.secret ? ' ach-secret' : '') + '">' + (a.secret ? '???' : esc(a.name)) + '</div>' +
            '<div class="ach-rd' + (a.secret ? ' ach-secret' : '') + '">' + (a.secret ? '???' : esc(a.desc)) + '</div></div>' +
          '</div>';
        }
      });
      listEl.innerHTML = html;
    }
  }

  /* ---- 主题切换计数（10 次） ---- */
  var themeCount = 0;
  var themeBtn = document.getElementById('theme-toggle');
  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      themeCount++;
      if(themeCount >= 10) unlock('theme_master');
    });
  }

  /* ---- 听完所有歌曲 ---- */
  var listened = {};
  var EXPECT_SONGS = ['灰烬','枷锁'];
  var audio = document.getElementById('mp-audio');
  if(audio){
    audio.addEventListener('ended', function(){
      var nameEl = document.getElementById('mp-name');
      if(nameEl && nameEl.textContent) listened[nameEl.textContent] = true;
      if(EXPECT_SONGS.every(function(s){ return listened[s]; })) unlock('play_all');
    });
  }

  /* ---- 隐藏成就：经典秘籍 ---- */
  (function(){
    var SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var idx = 0;
    document.addEventListener('keydown', function(e){
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if(k === SEQ[idx]){
        idx++;
        if(idx >= SEQ.length){ unlock('hidden_konami'); idx = 0; }
      }else{
        idx = (k === SEQ[0]) ? 1 : 0;
      }
    });
  })();

  /* ---- 隐藏成就：停留一分钟（累计可见时长） ---- */
  (function(){
    var acc = 0, last = Date.now();
    setInterval(function(){
      var now = Date.now();
      if(!document.hidden){
        acc += (now - last) / 1000;
        if(acc >= 60) unlock('hidden_lurker');
      }
      last = now;
    }, 1000);
  })();

  /* ---- 隐藏入口：连点导航时钟 ---- */
  /* 3 次解锁「时间旅人」成就；在意的人继续敲到 6 次，会被送去倒计时 */
  (function(){
    var el = document.getElementById('clk');
    if(!el) return;
    var n = 0, t = null, got = false;
    el.addEventListener('click', function(){
      n++;
      clearTimeout(t);
      if(n >= 3 && !got){ got = true; unlock('hidden_clock'); }
      if(n >= 6){ n = 0; got = false; window.location.href = 'html/render.html'; return; }
      t = setTimeout(function(){ n = 0; got = false; }, 3000);
    });
  })();

  /* ---- 隐藏成就：连点页脚品牌铭牌 5 次 ---- */
  (function(){
    var el = document.querySelector('.foot .brand');
    if(!el) return;
    var n = 0, t = null;
    el.addEventListener('click', function(){
      n++;
      clearTimeout(t);
      if(n >= 5){ n = 0; unlock('hidden_brand'); }
      else t = setTimeout(function(){ n = 0; }, 2000);
    });
  })();

  /* ---- 迁移：识别已完成的一次性旧彩蛋 ---- */
  function migrate(){
    try{
      if(localStorage.getItem('make-studio-hack') === '1') unlock('hack_log', {silent:true});
    }catch(e){}
  }

  /* ---- 面板开关 ---- */
  var modal = document.getElementById('ach-modal');
  function openPanel(){
    if(!modal) return;
    render();
    modal.hidden = false;
    requestAnimationFrame(function(){ modal.classList.add('show'); });
  }
  function closePanel(){
    if(!modal) return;
    modal.classList.remove('show');
    setTimeout(function(){ modal.hidden = true; }, 300);
  }
  var entry = document.getElementById('ach-entry');
  var closeBtn = document.getElementById('ach-close');
  if(entry) entry.addEventListener('click', openPanel);
  if(closeBtn) closeBtn.addEventListener('click', closePanel);
  if(modal) modal.addEventListener('click', function(e){ if(e.target === modal) closePanel(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal && !modal.hidden) closePanel();
  });

  load();
  migrate();
  render();

  window.__ach = { unlock: unlock };
})();

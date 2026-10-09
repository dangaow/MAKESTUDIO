/* 更新日志 + 版本号里的伪入侵彩蛋（完整播完一次后不再触发） */
(function(){
  var modal=document.getElementById('log-modal');
  var entry=document.getElementById('ver-entry');
  var close=document.getElementById('log-close');
  function open(){if(!modal)return;modal.hidden=false;requestAnimationFrame(function(){modal.classList.add('show')});if(!hackPlayed){clearTimeout(hackTimer);hackTimer=setTimeout(hackPlay,2000)}}
  function closeModal(){if(!modal)return;clearTimeout(hackTimer);if(hBusy)hackCancel();modal.classList.remove('show');setTimeout(function(){modal.hidden=true},300)}
  if(entry)entry.addEventListener('click',open);
  if(close)close.addEventListener('click',closeModal);
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.hidden)closeModal()});

  /* 版本详情彩蛋：伪入侵警告（完整播完一次后不再触发）
     流程：入侵 -> 逐行打字 -> 清场（删掉所有前文+关掉全部故障）-> 平静打出最后一句 -> 谢幕 */
  var HKEY='make-studio-hack';
  var hackPlayed=false;
  try{if(localStorage.getItem(HKEY)==='1')hackPlayed=true}catch(e){}
  var hackLines=['> SIGNAL INTERCEPTED…','> 检测到未授权接入…','> 正在解析会话密文……','> 防火墙已绕过','> 追踪信号已锁定','> 身份核验中… 核验失败'];
  var calmLine='正     在     强     制     获     取     位     置';
  var jokeLine='> 开玩笑的，欢迎回来 :]';
  var hov=document.getElementById('hack-ov');
  var htxt=document.getElementById('hack-text');
  var hcard=document.querySelector('#log-modal .log-card');
  var hackTimer=null,hRun=0,hBusy=false;
  function hType(el,str,spd,next){
    var i=0,t=setInterval(function(){
      i++;
      el.textContent=str.slice(0,i);
      if(i>=str.length){clearInterval(t);setTimeout(next,420)}
    },spd);
  }
  function hackCalm(run){
    if(run!==hRun)return;
    /* 清场：删掉前文，关掉弹窗抖动、正文残影、噪点、扫描光束 */
    htxt.innerHTML='';
    hcard.classList.remove('hack');
    hov.classList.add('calm');
    /* 第一句：深红慢速 */
    var d1=document.createElement('div');
    d1.className='hack-red';
    htxt.appendChild(d1);
    hType(d1,calmLine,170,function(){
      if(run!==hRun)return;
      /* 恐怖停顿片刻，再打出玩笑反转句 */
      setTimeout(function(){
        if(run!==hRun)return;
        var d2=document.createElement('div');
        d2.className='hack-joke';
        htxt.appendChild(d2);
        hType(d2,jokeLine,70,function(){hackEnd(run)});
      },1000);
    });
  }
  function hackEnd(run){
    if(run!==hRun)return;
    setTimeout(function(){
      if(run!==hRun)return;
      hov.hidden=true;hov.classList.remove('calm');
      htxt.innerHTML='';
      hBusy=false;
    },1600);
    try{localStorage.setItem(HKEY,'1')}catch(e){}
  }
  function hackPlay(){
    if(hackPlayed||hBusy||!hov||!htxt||!hcard||modal.hidden)return;
    var run=++hRun;
    hBusy=true;
    if(window.__ach) window.__ach.unlock('hack_log');
    hcard.classList.add('hack');
    hov.classList.remove('calm');
    hov.hidden=false;
    htxt.innerHTML='';
    var li=0;
    function next(){
      if(run!==hRun)return;
      if(li>=hackLines.length){setTimeout(function(){if(run===hRun)hackCalm(run)},700);return}
      var d=document.createElement('div');
      htxt.appendChild(d);
      hType(d,hackLines[li++],36,next);
    }
    next();
  }
  function hackCancel(){
    hRun++;
    if(hcard)hcard.classList.remove('hack');
    if(hov){hov.hidden=true;hov.classList.remove('calm');hov.style.opacity='1'}
    if(htxt)htxt.innerHTML='';
    hBusy=false;
  }
  /* 切换窗口（切走浏览器标签页）时彩蛋画面渐隐，切回时再渐进显现 */
  document.addEventListener('visibilitychange',function(){
    if(!hov||hov.hidden)return;
    hov.style.opacity=document.hidden?'0':'1';
  });
})();

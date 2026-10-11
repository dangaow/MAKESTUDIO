/* 主题切换：默认深色，仅当用户手动切换过才记住选择
   首次绘制前 <head> 里的内联脚本已按存档设好 data-theme，这里只负责同步状态和切换 */
(function(){
  'use strict';
  var MS = window.MS = window.MS || {};
  var THEME_KEY = 'make-studio-theme';
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function apply(t, save){
    root.setAttribute('data-theme', t);
    MS.theme = t;
    if(save) try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  }

  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

  if(btn){
    btn.addEventListener('click', function(){
      apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
    });
  }
})();

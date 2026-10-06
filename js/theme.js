/* 主题切换模块 */
export const ThemeModule = (function() {
  'use strict';

  const THEME_KEY = 'make-studio-theme';
  let themeToggleCount = 0;

  function init() {
    // 加载保存的主题
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch(e) {}

    // 主题切换按钮
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  }

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', next);

    try {
      localStorage.setItem(THEME_KEY, next);
    } catch(e) {}

    themeToggleCount++;

    // 触发成就检查
    if (window.AchievementsModule && themeToggleCount >= 10) {
      window.AchievementsModule.unlock('theme_master');
    }
  }

  return {
    init,
    toggleTheme
  };
})();

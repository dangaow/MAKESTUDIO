/* 成就系统模块 */
export const AchievementsModule = (function() {
  'use strict';

  const KEY = 'make-studio-achievements';
  let DEF = [];
  let state = { achievements: [], totalUnlocked: 0, lastChecked: 0 };
  let queue = [];
  let showing = false;

  // DOM 元素缓存
  const elements = {};

  function esc(str) {
    return String(str).replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.achievements && saved.achievements.length) {
          const map = {};
          saved.achievements.forEach(function(a) { map[a.id] = a; });
          state.achievements = DEF.map(function(d) {
            const s = map[d.id];
            return {
              id: d.id,
              name: d.name,
              desc: d.desc,
              secret: d.secret,
              unlocked: !!(s && s.unlocked),
              time: (s && s.time) || 0
            };
          });
          state.totalUnlocked = state.achievements.filter(function(a) { return a.unlocked; }).length;
          state.lastChecked = saved.lastChecked || 0;
          return;
        }
      }
    } catch(e) {}

    // 初始化默认状态
    state.achievements = DEF.map(function(d) {
      return {
        id: d.id,
        name: d.name,
        desc: d.desc,
        secret: d.secret,
        unlocked: false,
        time: 0
      };
    });
    state.totalUnlocked = 0;
    state.lastChecked = Date.now();
    save();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function get(id) {
    for (let i = 0; i < state.achievements.length; i++) {
      if (state.achievements[i].id === id) {
        return state.achievements[i];
      }
    }
    return null;
  }

  function unlock(id, opts) {
    const achievement = get(id);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.time = Date.now();
    state.totalUnlocked = state.achievements.filter(function(x) { return x.unlocked; }).length;
    state.lastChecked = Date.now();
    save();

    toast(achievement, opts && opts.silent);
    render();
  }

  function toast(achievement, silent) {
    if (silent) return;
    queue.push(achievement);
    pump();
  }

  function pump() {
    if (showing || !queue.length) return;

    const achievement = queue.shift();
    showing = true;

    const stack = document.getElementById('ach-toasts');
    if (!stack) {
      showing = false;
      pump();
      return;
    }

    const el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML =
      '<div class="ach-ti"><span class="ach-star">◆</span><span class="ach-tag">ACHIEVEMENT UNLOCKED</span></div>' +
      '<div class="ach-body">' +
        '<div class="ach-name"><span class="ach-n"></span><span class="cursor"></span></div>' +
        '<div class="ach-desc"></div>' +
        '<div class="ach-prog">当前进度 <b>' + state.totalUnlocked + '</b> / ' + state.achievements.length + '</div>' +
      '</div>';

    stack.appendChild(el);

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('show');
      });
    });

    const nameSpan = el.querySelector('.ach-n');
    const descDiv = el.querySelector('.ach-desc');

    // 打字机效果
    typewriter(nameSpan, achievement.name, 50, function() {
      setTimeout(function() {
        descDiv.textContent = achievement.desc;
        setTimeout(function() {
          el.classList.remove('show');
          setTimeout(function() {
            stack.removeChild(el);
            showing = false;
            pump();
          }, 300);
        }, 3000);
      }, 200);
    });
  }

  function typewriter(el, str, speed, callback) {
    let i = 0;
    const interval = setInterval(function() {
      i++;
      el.textContent = str.slice(0, i);
      if (i >= str.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
  }

  function render() {
    const entryEl = document.getElementById('ach-entry');
    const listEl = document.getElementById('ach-list');
    if (!listEl) return;

    const done = state.totalUnlocked;
    const total = state.achievements.length;

    if (entryEl) {
      entryEl.textContent = 'ACHIEVEMENTS · ' + done + '/' + total;
    }

    listEl.innerHTML = '';

    state.achievements.forEach(function(a) {
      const item = document.createElement('div');
      item.className = 'ach-item' + (a.unlocked ? ' unlocked' : '') + (a.secret && !a.unlocked ? ' secret' : '');

      const name = a.secret && !a.unlocked ? '???' : esc(a.name);
      const desc = a.secret && !a.unlocked ? '隐藏成就，达成后解锁' : esc(a.desc);

      item.innerHTML =
        '<div class="ach-icon">' + (a.unlocked ? '◆' : '◇') + '</div>' +
        '<div class="ach-info">' +
          '<div class="ach-name">' + name + '</div>' +
          '<div class="ach-desc">' + desc + '</div>' +
        '</div>';

      listEl.appendChild(item);
    });
  }

  async function init() {
    // 加载成就定义
    try {
      const response = await fetch('data/achievements.json');
      DEF = await response.json();
    } catch (e) {
      console.error('Failed to load achievements data:', e);
      return;
    }

    load();
    render();

    // 成就面板
    const modal = document.getElementById('ach-modal');
    const entry = document.getElementById('ach-entry');
    const closeBtn = document.getElementById('ach-close');

    if (entry) {
      entry.addEventListener('click', function() {
        if (!modal) return;
        modal.hidden = false;
        requestAnimationFrame(function() {
          modal.classList.add('show');
        });
      });
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('show');
      setTimeout(function() {
        modal.hidden = true;
      }, 300);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        closeModal();
      }
    });

    // 隐藏成就触发器
    setupHiddenAchievements();
  }

  function setupHiddenAchievements() {
    // Konami Code: 上上下下左右左右BA
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', function(e) {
      if (e.key.toLowerCase() === konami[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konami.length) {
          unlock('hidden_konami');
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });

    // 停留一分钟
    let enterTime = Date.now();
    setTimeout(function() {
      if (document.hasFocus()) {
        unlock('hidden_lurker');
      }
    }, 60000);

    // 时间旅人：点击时钟 3 次
    let clockClicks = 0;
    const clock = document.querySelector('.status-time');
    if (clock) {
      clock.addEventListener('click', function() {
        clockClicks++;
        if (clockClicks >= 3) {
          unlock('hidden_clock');
        }
      });
    }

    // 署名之后：点击 MAKE STUDIO 标题 5 次
    let brandClicks = 0;
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', function() {
        brandClicks++;
        if (brandClicks >= 5) {
          unlock('hidden_brand');
        }
      });
    }
  }

  return {
    init,
    unlock,
    getState: () => state
  };
})();

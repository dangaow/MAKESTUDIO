/* 主入口文件 - 初始化所有模块 */
import { ThemeModule } from './theme.js';
import { PlayerModule } from './player.js';
import { AchievementsModule } from './achievements-refactored.js';
import { ParticlesModule } from './particles.js';
import { ModalModule } from './modal.js';

// 暴露到全局，供其他模块访问
window.AchievementsModule = AchievementsModule;
window.PlayerModule = PlayerModule;

// DOM 加载完成后初始化所有模块
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // 初始化各个模块
  ThemeModule.init();
  ParticlesModule.init();
  ModalModule.init();

  // 异步初始化需要加载数据的模块
  Promise.all([
    PlayerModule.init(),
    AchievementsModule.init()
  ]).then(function() {
    console.log('All modules initialized');
  }).catch(function(error) {
    console.error('Module initialization error:', error);
  });

  // 状态栏时钟
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.querySelector('.status-time');
    if (timeEl) {
      timeEl.textContent = hours + ':' + minutes;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // 视频弹窗处理
  const videoModal = document.getElementById('video-modal');
  const videoFrame = document.getElementById('video-frame');
  const videoClose = document.getElementById('video-close');

  function openVideo(bv) {
    if (!videoModal || !videoFrame) return;
    const src = 'https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=1&high_quality=1';
    videoFrame.src = src;
    videoModal.hidden = false;
    requestAnimationFrame(function() {
      videoModal.classList.add('show');
    });

    // 暂停音乐
    const audio = document.getElementById('mp-audio');
    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  function closeVideo() {
    if (!videoModal || !videoFrame) return;
    videoModal.classList.remove('show');
    setTimeout(function() {
      videoModal.hidden = true;
      videoFrame.src = '';
    }, 300);
  }

  if (videoClose) {
    videoClose.addEventListener('click', closeVideo);
  }

  if (videoModal) {
    videoModal.addEventListener('click', function(e) {
      if (e.target === videoModal) closeVideo();
    });
  }

  // 为所有视频链接添加点击事件
  document.querySelectorAll('[data-video]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const bv = this.getAttribute('data-video');
      if (bv) openVideo(bv);
    });
  });

  // 邮件终端彩蛋
  const mailTerminal = document.getElementById('mail-terminal');
  if (mailTerminal) {
    mailTerminal.addEventListener('click', function() {
      if (window.AchievementsModule) {
        window.AchievementsModule.unlock('mail_terminal');
      }
      window.open('mailto:contact@makestudio.com', '_blank');
    });
  }

  // 更新日志彩蛋处理
  setupChangelogEasterEgg();
});

// 更新日志的入侵特效彩蛋
function setupChangelogEasterEgg() {
  const HACK_KEY = 'make-studio-hack';
  let hackPlayed = false;

  try {
    if (localStorage.getItem(HACK_KEY) === '1') hackPlayed = true;
  } catch(e) {}

  if (hackPlayed) return;

  const hackLines = [
    '> SIGNAL INTERCEPTED…',
    '> 检测到未授权接入…',
    '> 正在解析会话密文……',
    '> 防火墙已绕过',
    '> 追踪信号已锁定',
    '> 身份核验中… 核验失败'
  ];

  const calmLine = '正     在     强     制     获     取     位     置';
  const jokeLine = '> 开玩笑的，欢迎回来 :]';

  const hackOverlay = document.getElementById('hack-ov');
  const hackText = document.getElementById('hack-text');
  const logCard = document.querySelector('.log-card');

  let hackTimer = null;
  let hackRunning = 0;
  let hackBusy = false;

  function typeText(el, str, speed, callback) {
    let i = 0;
    const interval = setInterval(function() {
      i++;
      el.textContent = str.slice(0, i);
      if (i >= str.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
    return interval;
  }

  function hackPlay() {
    if (hackPlayed || hackBusy) return;
    hackBusy = true;

    // 解锁成就
    if (window.AchievementsModule) {
      window.AchievementsModule.unlock('hack_log');
    }

    // 显示覆盖层
    if (hackOverlay) hackOverlay.hidden = false;

    let lineIndex = 0;

    function nextLine() {
      if (lineIndex < hackLines.length) {
        if (hackText) hackText.textContent = '';
        hackRunning = typeText(hackText, hackLines[lineIndex], 30, function() {
          setTimeout(nextLine, 400);
        });
        lineIndex++;
      } else {
        setTimeout(showCalmLine, 800);
      }
    }

    function showCalmLine() {
      if (hackText) hackText.textContent = '';
      hackRunning = typeText(hackText, calmLine, 150, function() {
        setTimeout(clearAndJoke, 1000);
      });
    }

    function clearAndJoke() {
      if (logCard) logCard.style.opacity = '0';
      if (hackText) hackText.textContent = '';

      setTimeout(function() {
        hackRunning = typeText(hackText, jokeLine, 50, function() {
          setTimeout(finish, 2000);
        });
      }, 500);
    }

    function finish() {
      if (hackOverlay) hackOverlay.hidden = true;
      if (logCard) logCard.style.opacity = '1';
      if (hackText) hackText.textContent = '';
      hackBusy = false;
      hackPlayed = true;

      try {
        localStorage.setItem(HACK_KEY, '1');
      } catch(e) {}
    }

    nextLine();
  }

  // 打开更新日志时触发
  const logEntry = document.getElementById('ver-entry');
  if (logEntry) {
    logEntry.addEventListener('click', function() {
      if (!hackPlayed) {
        clearTimeout(hackTimer);
        hackTimer = setTimeout(hackPlay, 2000);
      }
    });
  }
}

/* 音乐播放器模块 */
export const PlayerModule = (function() {
  'use strict';

  let PLAYLIST = [];
  let VIDEOS = {};
  let currentTrack = -1;
  let sourceIndex = 0;
  let isSeeking = false;
  let videoPausedMusic = false;

  // DOM 元素缓存
  const elements = {};

  const ICON_PLAY = '<svg viewBox="0 0 24 24"><polygon points="7,4 21,12 7,20"></polygon></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 4h3.6v16H7zM13.4 4H17v16h-3.6z"></path></svg>';

  function fmt(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (remaining < 10 ? '0' : '') + remaining;
  }

  function setPlaying(isPlaying) {
    elements.bar.classList.toggle('playing', isPlaying);
    elements.stateEl.textContent = isPlaying ? '播放中' : '已暂停';
    elements.btnToggle.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  }

  function loadTrack(index, autoPlay) {
    currentTrack = (index + PLAYLIST.length) % PLAYLIST.length;
    sourceIndex = 0;

    const track = PLAYLIST[currentTrack];
    elements.cover.src = track.cover;
    elements.nameEl.textContent = track.name;
    elements.range.value = 0;
    elements.range.style.setProperty('--mp-p', '0%');
    elements.curEl.textContent = '00:00';
    elements.durEl.textContent = '--:--';
    elements.bar.classList.remove('err');
    elements.bar.classList.add('on');

    elements.audio.src = track.srcs[0];
    elements.audio.load();

    if (autoPlay) {
      elements.stateEl.textContent = '加载中…';
      const playPromise = elements.audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function() {
          setPlaying(false);
          elements.stateEl.textContent = '等待播放';
        });
      }
    } else {
      elements.stateEl.textContent = '已暂停';
    }
  }

  function playById(id) {
    for (let i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].id === id) {
        loadTrack(i, true);
        return;
      }
    }
  }

  function setupAudioEvents() {
    elements.audio.addEventListener('error', function() {
      if (currentTrack < 0) return;

      const track = PLAYLIST[currentTrack];
      sourceIndex++;

      if (sourceIndex < track.srcs.length) {
        elements.audio.src = track.srcs[sourceIndex];
        elements.audio.load();
        elements.audio.play();
      } else {
        elements.bar.classList.add('err');
        setPlaying(false);
        elements.stateEl.textContent = '加载失败 · 点击前往网易云';
        elements.bar.classList.remove('playing');
      }
    });

    elements.audio.addEventListener('stalled', function() {
      if (!elements.bar.classList.contains('err')) {
        elements.stateEl.textContent = '加载中…';
      }
    });

    elements.audio.addEventListener('playing', function() {
      setPlaying(true);
    });

    elements.audio.addEventListener('pause', function() {
      if (!elements.bar.classList.contains('err')) {
        setPlaying(false);
      }
    });

    elements.audio.addEventListener('waiting', function() {
      if (!elements.bar.classList.contains('err')) {
        elements.stateEl.textContent = '缓冲中…';
      }
    });

    elements.audio.addEventListener('ended', function() {
      if (elements.bar.classList.contains('loop')) {
        elements.audio.currentTime = 0;
        const playPromise = elements.audio.play();
        if (playPromise && playPromise.catch) playPromise.catch(function() {});
      } else {
        loadTrack(currentTrack + 1, true);
      }
    });

    elements.audio.addEventListener('timeupdate', function() {
      if (isSeeking) return;
      const cur = elements.audio.currentTime;
      const dur = elements.audio.duration;
      if (isFinite(cur) && isFinite(dur) && dur > 0) {
        const percent = (cur / dur) * 100;
        elements.range.value = percent;
        elements.range.style.setProperty('--mp-p', percent + '%');
        elements.curEl.textContent = fmt(cur);
        elements.durEl.textContent = fmt(dur);
      }
    });
  }

  async function init() {
    // 缓存 DOM 元素
    elements.bar = document.getElementById('mp-bar');
    elements.audio = document.getElementById('mp-audio');
    elements.cover = document.getElementById('mp-cover');
    elements.nameEl = document.getElementById('mp-name');
    elements.stateEl = document.getElementById('mp-state');
    elements.curEl = document.getElementById('mp-cur');
    elements.durEl = document.getElementById('mp-dur');
    elements.range = document.getElementById('mp-range');
    elements.btnToggle = document.getElementById('mp-toggle');
    elements.btnPrev = document.getElementById('mp-prev');
    elements.btnNext = document.getElementById('mp-next');

    if (!elements.bar || !elements.audio) return;

    // 加载配置数据
    try {
      const [playlistRes, videosRes] = await Promise.all([
        fetch('data/playlist.json'),
        fetch('data/videos.json')
      ]);

      PLAYLIST = await playlistRes.json();
      VIDEOS = await videosRes.json();
    } catch (e) {
      console.error('Failed to load player data:', e);
      return;
    }

    setupAudioEvents();

    // 控制按钮
    elements.btnToggle.addEventListener('click', function() {
      if (currentTrack < 0) {
        loadTrack(0, true);
      } else {
        if (elements.audio.paused) {
          elements.audio.play().catch(function() {});
        } else {
          elements.audio.pause();
        }
      }
    });

    elements.btnPrev.addEventListener('click', function() {
      loadTrack(currentTrack - 1, true);
    });

    elements.btnNext.addEventListener('click', function() {
      loadTrack(currentTrack + 1, true);
    });

    // 进度条拖动
    elements.range.addEventListener('input', function() {
      isSeeking = true;
      const percent = parseFloat(elements.range.value);
      elements.range.style.setProperty('--mp-p', percent + '%');
    });

    elements.range.addEventListener('change', function() {
      const percent = parseFloat(elements.range.value);
      const dur = elements.audio.duration;
      if (isFinite(dur)) {
        elements.audio.currentTime = (percent / 100) * dur;
      }
      isSeeking = false;
    });

    // 循环按钮
    const loopBtn = document.getElementById('mp-loop');
    if (loopBtn) {
      loopBtn.addEventListener('click', function() {
        elements.bar.classList.toggle('loop');
      });
    }

    // 默认加载第一首
    loadTrack(0, false);
  }

  return {
    init,
    playById,
    getVideos: () => VIDEOS
  };
})();

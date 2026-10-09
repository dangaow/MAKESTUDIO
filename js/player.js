/* 站内播放：底部胶带播放条 + B 站视频弹窗 */
(function () {
  'use strict';
  var bar = document.getElementById('mp-bar'),
      audio = document.getElementById('mp-audio'),
      cover = document.getElementById('mp-cover'),
      nameEl = document.getElementById('mp-name'),
      stateEl = document.getElementById('mp-state'),
      btnToggle = document.getElementById('mp-toggle'),
      btnPrev = document.getElementById('mp-prev'),
      btnNext = document.getElementById('mp-next'),
      btnLoop = document.getElementById('mp-loop'),
      btnClose = document.getElementById('mp-close'),
      range = document.getElementById('mp-range'),
      curEl = document.getElementById('mp-cur'),
      durEl = document.getElementById('mp-dur'),
      vm = document.getElementById('vid-modal'),
      vf = document.getElementById('vid-frame'),
      vn = document.getElementById('vid-n');
  if (!bar || !audio) return;

  /* 曲目库：srcs 为候选音频源，依次尝试（本地 mp3 优先，网易云流作兜底） */
  var PLAYLIST = [
    { id: 'huijin', name: '灰烬', cover: 'assets/cover-huijin.jpg', page: 'https://music.163.com/song?id=3405702569', srcs: ['assets/huijin.mp3', 'https://music.163.com/song/media/outer/url?id=3405702569.mp3'] },
    { id: 'jiasuo', name: '枷锁', cover: 'assets/cover-jiasuo.jpg', page: 'https://music.163.com/song?id=3350521507', srcs: ['assets/jiasuo.mp3', 'https://music.163.com/song/media/outer/url?id=3350521507.mp3'] }
  ];
  var VIDEOS = { wujie: { name: '无解 · MV', bv: 'BV136uE6cEWg' }, fly: { name: 'FLY · MV', bv: 'BV1wC496oEf4' } };

  var ICON_PLAY = '<svg viewBox="0 0 24 24"><polygon points="7,4 21,12 7,20"></polygon></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 4h4.2v16H6zM13.8 4H18v16h-4.2z"></path></svg>';
  var cur = -1, srcIdx = 0, seeking = false, vidPausedMusic = false;

  function fmt(s) { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  function setPlaying(p) { bar.classList.toggle('playing', p); stateEl.textContent = p ? '播放中' : '已暂停'; btnToggle.innerHTML = p ? ICON_PAUSE : ICON_PLAY; }
  function showBar(on) { bar.classList.toggle('on', on); document.body.classList.toggle('mp-on', on); }

  function loadTrack(i, auto) {
    cur = (i + PLAYLIST.length) % PLAYLIST.length; srcIdx = 0;
    var t = PLAYLIST[cur];
    cover.src = t.cover; nameEl.textContent = t.name;
    range.value = 0; range.style.setProperty('--mp-p', '0%'); curEl.textContent = '00:00'; durEl.textContent = '--:--';
    bar.classList.remove('err'); showBar(true);
    audio.src = t.srcs[0]; audio.load();
    if (auto) {
      stateEl.textContent = '加载中…';
      var p = audio.play(); if (p && p.catch) p.catch(function () { setPlaying(false); stateEl.textContent = '等待播放'; });
    } else stateEl.textContent = '已暂停';
  }
  function playBy(id) { for (var i = 0; i < PLAYLIST.length; i++) if (PLAYLIST[i].id === id) { loadTrack(i, true); return; } }

  audio.addEventListener('error', function () {
    if (cur < 0) return;
    var t = PLAYLIST[cur]; srcIdx++;
    if (srcIdx < t.srcs.length) { audio.src = t.srcs[srcIdx]; audio.load(); audio.play(); }
    else { bar.classList.add('err'); setPlaying(false); stateEl.textContent = '加载失败 · 点这里去网易云'; bar.classList.remove('playing'); }
  });
  audio.addEventListener('stalled', function () { if (!bar.classList.contains('err')) stateEl.textContent = '加载中…'; });
  audio.addEventListener('playing', function () { setPlaying(true); });
  audio.addEventListener('pause', function () { if (!bar.classList.contains('err')) setPlaying(false); });
  audio.addEventListener('waiting', function () { if (!bar.classList.contains('err')) stateEl.textContent = '缓冲中…'; });
  audio.addEventListener('ended', function () {
    if (bar.classList.contains('loop')) { audio.currentTime = 0; var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    else loadTrack(cur + 1, true);
  });
  audio.addEventListener('timeupdate', function () {
    if (seeking) return;
    var d = audio.duration; if (!isFinite(d) || !d) return;
    range.value = audio.currentTime / d * 1000;
    range.style.setProperty('--mp-p', audio.currentTime / d * 100 + '%');
    curEl.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', function () { durEl.textContent = fmt(audio.duration); });

  range.addEventListener('input', function () { seeking = true; var d = audio.duration; if (isFinite(d) && d) { curEl.textContent = fmt(d * range.value / 1000); range.style.setProperty('--mp-p', range.value / 10 + '%'); } });
  range.addEventListener('change', function () { if (isFinite(audio.duration) && audio.duration) audio.currentTime = audio.duration * range.value / 1000; seeking = false; });

  btnToggle.addEventListener('click', function () { if (cur < 0) loadTrack(0, true); else if (audio.paused) audio.play(); else audio.pause(); });
  btnPrev.addEventListener('click', function () { loadTrack(cur < 0 ? 0 : cur - 1, true); });
  btnNext.addEventListener('click', function () { loadTrack(cur < 0 ? 0 : cur + 1, true); });
  btnLoop.addEventListener('click', function () { var on = bar.classList.toggle('loop'); btnLoop.setAttribute('aria-label', on ? '单曲循环：开' : '单曲循环：关'); });
  btnClose.addEventListener('click', function () { audio.pause(); setPlaying(false); showBar(false); });
  /* 加载失败时点状态文字跳转对应歌曲外链 */
  stateEl.addEventListener('click', function () {
    if (!bar.classList.contains('err') || cur < 0) return;
    window.open(PLAYLIST[cur].page, '_blank', 'noopener');
  });

  /* ---- B 站视频弹窗 ---- */
  var lastFocus = null;
  function openVideo(id) {
    var v = VIDEOS[id]; if (!v) return;
    lastFocus = document.activeElement;
    if (window.__flash) window.__flash(false, 80);
    vn.textContent = v.name;
    vf.src = 'https://player.bilibili.com/player.html?bvid=' + v.bv + '&autoplay=1&high_quality=1&danmaku=0';
    vm.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { vm.classList.add('show'); document.getElementById('vid-close').focus(); }); });
    vidPausedMusic = false;
    if (!audio.paused && cur >= 0) { audio.pause(); vidPausedMusic = true; }
  }
  function closeVideo() {
    vm.classList.remove('show');
    setTimeout(function () {
      vm.hidden = true; vf.src = '';
      if (vidPausedMusic && cur >= 0) { audio.play(); vidPausedMusic = false; }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 120);
  }
  document.getElementById('vid-close').addEventListener('click', closeVideo);
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !vm.hidden) closeVideo(); });

  /* ---- 作品墙：站内播放（拦截默认外链） ---- */
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-music],[data-video]') : null;
    if (!el) return;
    var m = el.getAttribute('data-music');
    if (m) { e.preventDefault(); playBy(m); return; }
    var v = el.getAttribute('data-video');
    if (v) { e.preventDefault(); openVideo(v); }
  });

  btnToggle.innerHTML = ICON_PLAY;
})();

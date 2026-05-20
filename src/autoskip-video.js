'use strict';

// Video ad handler.
// Detects when YouTube enters ad mode via the "ad-showing" class on #movie_player,
// then seeks the video to its end every 500ms (YouTube resets currentTime, so one
// seek isn't enough) and clicks the skip button the moment it becomes visible.
// The interval stops when "ad-showing" is removed from the player.
// Relies on findSkipButton() and showToast() from autoskip-shared.js.

let seekInterval = null;
let toastShown = false;

function isAdPlaying() {
  const player = document.getElementById('movie_player');
  return !!(player && player.classList.contains('ad-showing'));
}

function seekToEnd() {
  const video = document.querySelector('video.html5-main-video');
  if (!video || !isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = video.duration;

  const btn = findSkipButton();
  if (btn && getComputedStyle(btn).display !== 'none') {
    btn.click();
  }

  if (!toastShown) {
    showToast();
    toastShown = true;
  }
}

function onPlayerClassChange() {
  if (isAdPlaying()) {
    if (!seekInterval) {
      toastShown = false;
      seekToEnd();
      seekInterval = setInterval(seekToEnd, 500);
    }
  } else {
    clearInterval(seekInterval);
    seekInterval = null;
    toastShown = false;
  }
}

// Watches #movie_player's class attribute for ad state changes.
// Retries every 500ms if the player element isn't in the DOM yet.
function attachPlayerObserver() {
  const player = document.getElementById('movie_player');
  if (!player) {
    setTimeout(attachPlayerObserver, 500);
    return;
  }
  new MutationObserver(onPlayerClassChange)
    .observe(player, { attributes: true, attributeFilter: ['class'] });
  onPlayerClassChange();
}

// Secondary trigger: watches .video-ads.ytp-ad-module for ad content being
// injected or removed. Does NOT call onPlayerClassChange() immediately on
// attach — isAdPlaying() is the authority; this just catches cases
// where the adModule childList changes before the player class change fires.
function attachAdModuleObserver() {
  const adModule = document.querySelector('.video-ads.ytp-ad-module');
  if (!adModule) {
    setTimeout(attachAdModuleObserver, 500);
    return;
  }
  new MutationObserver(onPlayerClassChange)
    .observe(adModule, { childList: true });
}

attachPlayerObserver();
attachAdModuleObserver();

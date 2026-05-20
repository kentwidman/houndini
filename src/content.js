(function () {
  'use strict';

  // How the toolbar/keyboard-shortcut skip works:
  // 1. run() finds the first playing <video> on the page (falls back to the first video found).
  // 2. Two strategies depending on the host:
  //    - Hulu / ABCNews: set playbackRate to 16x. These sites block seeking due to DRM,
  //      so fast-forwarding is the only option.
  //    - Everything else (including YouTube): seek to video.duration to jump to the end,
  //      then call watchForOverlayControls().
  // 3. watchForOverlayControls() fires clickOverlayControls() immediately, then sets up a
  //    MutationObserver to catch skip/close buttons that appear asynchronously after the seek.
  //    After 2s the observer disconnects; if the video is looping it is also paused at that point.
  // 4. clickOverlayControls() tries known CSS selectors first, then falls back to a text search
  //    for any button whose label starts with "Skip" — so it survives YouTube class-name changes.

  const MAX_PLAYBACK_RATE = 16.0;
  const OVERLAY_WATCH_MS = 2000;

  // These hosts block duration-seeking (DRM), so fast-forward instead
  const fastForwardHosts = [/hulu\.com/, /abcnews\.go\.com/];

  // Known YouTube ad-skip button selectors — text-based fallback handles class renames
  const skipButtonSelector = '.videoAdUiEndButton, .ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-End-button, .ytp-ad-skip-button-modern';
  const playlistCloseSelector = '.ytp-playlist-menu-close';
  const skipTextPattern = /^skip/i;

  function isPlaying(video) {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }

  // Returns the first actively playing video, falling back to the first video on
  // the page if none are playing yet (e.g. autoplay is blocked or the ad is buffering).
  function findPlayingVideo() {
    const videos = Array.from(document.getElementsByTagName('video'));
    return videos.find(isPlaying) || videos[0] || null;
  }

  // Tries known CSS selectors first for speed, then falls back to checking every
  // button's text in case YouTube has renamed its classes. Returns null if no skip
  // button is found. Intentionally duplicated in autoskip.js — no shared module
  // exists between the two scripts since the extension has no build step.
  function findSkipButton() {
    const bySelector = document.querySelector(skipButtonSelector);
    if (bySelector) return bySelector;

    const candidates = document.querySelectorAll('button, [role="button"]');
    return Array.from(candidates).find(el => skipTextPattern.test(el.textContent.trim())) || null;
  }

  function clickOverlayControls() {
    const skipBtn = findSkipButton();
    if (skipBtn) skipBtn.click();

    const playlistClose = document.querySelector(playlistCloseSelector);
    if (playlistClose) playlistClose.click();
  }

  // After seeking, watch the DOM for skip/close buttons that appear asynchronously
  function watchForOverlayControls(video) {
    clickOverlayControls();

    const observer = new MutationObserver(clickOverlayControls);
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      if (video.loop) video.pause();
    }, OVERLAY_WATCH_MS);
  }

  function run() {
    const video = findPlayingVideo();
    if (!video) return;

    if (fastForwardHosts.some(re => re.test(location.hostname))) {
      video.playbackRate = MAX_PLAYBACK_RATE;
    } else {
      video.currentTime = video.duration;
      watchForOverlayControls(video);
    }
  }

  run();
})();

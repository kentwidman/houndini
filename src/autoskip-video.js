'use strict';

// Video-level ad skip.
// YouTube adds the class "ad-showing" to #movie_player for every ad. When that
// class appears, the ad video is seeked to its duration to jump past it instantly.
// A 500ms interval keeps re-seeking in case YouTube resets currentTime. The
// interval is cleared as soon as "ad-showing" is removed from the player.
// Relies on showToast() from autoskip-shared.js.

let adSeekInterval = null; // interval that keeps re-seeking while an ad is active
let adToastShown = false;  // ensures the toast fires only once per ad

// YouTube adds "ad-showing" to #movie_player for every ad (pre-roll, mid-roll, etc.)
function isAdShowing() {
  const player = document.getElementById('movie_player');
  return !!(player && player.classList.contains('ad-showing'));
}

// Seek the ad video to its end. Guards against duration not being ready yet (NaN / 0).
// Shows the toast on the first successful seek so the user knows the skip happened.
function seekPastAd() {
  const video = document.querySelector('video.html5-main-video');
  if (!video || !isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = video.duration;
  if (!adToastShown) {
    showToast();
    adToastShown = true;
  }
}

// Called whenever #movie_player's class attribute changes.
// Starts a 500ms seek interval when an ad begins, clears it when the ad ends.
// The interval is needed because YouTube can reset currentTime mid-seek.
function onPlayerClassChange() {
  if (isAdShowing()) {
    if (!adSeekInterval) {
      adToastShown = false;
      seekPastAd();
      adSeekInterval = setInterval(seekPastAd, 500);
    }
  } else {
    clearInterval(adSeekInterval);
    adSeekInterval = null;
    adToastShown = false;
  }
}

// Watches #movie_player's class attribute for ad-showing changes.
// Retries every 500ms if the player element isn't in the DOM yet (e.g. on first page load).
function attachPlayerObserver() {
  const player = document.getElementById('movie_player');
  if (!player) {
    setTimeout(attachPlayerObserver, 500);
    return;
  }
  new MutationObserver(onPlayerClassChange)
    .observe(player, { attributes: true, attributeFilter: ['class'] });
  onPlayerClassChange(); // check immediately in case an ad is already playing
}

attachPlayerObserver();

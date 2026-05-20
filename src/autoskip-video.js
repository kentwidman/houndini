'use strict';

// Video playback handler.
// YouTube sets the "ad-showing" class on #movie_player when skippable content is
// playing. When that class appears, the video is seeked to its duration to jump
// past the segment instantly. A 500ms interval keeps re-seeking in case YouTube
// resets currentTime. The interval is cleared once the player exits skippable mode.
// Relies on showToast() from autoskip-shared.js.

let seekInterval = null;     // interval that keeps re-seeking while skippable content is playing
let toastShown = false;      // ensures the toast fires only once per segment

// Checks whether the player is currently in skippable playback mode.
function isSkippableContent() {
  const player = document.getElementById('movie_player');
  return !!(player && player.classList.contains('ad-showing'));
}

// Seeks the video to its end. Guards against duration not being ready yet (NaN / 0).
// Shows the notification on the first successful seek so the user knows it happened.
function seekToEnd() {
  const video = document.querySelector('video.html5-main-video');
  if (!video || !isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = video.duration;
  if (!toastShown) {
    showToast();
    toastShown = true;
  }
}

// Called whenever #movie_player's class attribute changes.
// Starts a 500ms seek interval when the player enters skippable mode, and clears
// it when the player returns to normal playback. The interval is necessary because
// YouTube can reset currentTime during the seek.
function onPlayerClassChange() {
  if (isSkippableContent()) {
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

// Watches #movie_player's class attribute for playback state changes.
// Retries every 500ms if the player element isn't in the DOM yet (e.g. on first page load).
function attachPlayerObserver() {
  const player = document.getElementById('movie_player');
  if (!player) {
    setTimeout(attachPlayerObserver, 500);
    return;
  }
  new MutationObserver(onPlayerClassChange)
    .observe(player, { attributes: true, attributeFilter: ['class'] });
  onPlayerClassChange(); // check immediately in case the player is already in skippable mode
}

attachPlayerObserver();

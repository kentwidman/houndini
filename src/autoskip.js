(function () {
  'use strict';

  // How auto-skip works:
  // 1. A MutationObserver watches document.body for any DOM changes.
  // 2. Every mutation fires trySkip(), which looks for a skip button.
  // 3. findSkipButton() tries known CSS selectors first, then falls back to
  //    walking every button/[role="button"] and checking if the text starts with "Skip".
  // 4. On a match, the button is clicked, the "Ad skipped" toast is shown,
  //    and the button is recorded in a WeakSet so it is never clicked again.
  // 5. A 1.5s cooldown prevents double-firing if the DOM mutates rapidly.
  //
  // MutationObserver is used instead of a polling interval because YouTube is a SPA
  // and the skip button appears asynchronously mid-ad — the observer reacts the
  // moment the button enters the DOM rather than waiting for the next timer tick.
  //
  // Video-level ad skip (runs in parallel with the button approach):
  // YouTube adds the class "ad-showing" to #movie_player for every ad. When that
  // class appears, we seek the ad video to its duration to jump past it instantly.
  // A 500ms interval keeps re-seeking in case YouTube resets currentTime. The
  // interval is cleared as soon as "ad-showing" is removed from the player.

  // --- Button-click skip ---

  // Matches known YouTube ad-skip selectors; text fallback handles class renames
  const skipButtonSelector = '.videoAdUiEndButton, .ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-End-button, .ytp-ad-skip-button-modern';
  const skipTextPattern = /^skip/i;

  // Track buttons already clicked so the same element is never re-triggered
  const clickedButtons = new WeakSet();
  let cooldown = false;

  // Tries known CSS selectors first for speed, then falls back to checking every
  // button's text in case YouTube has renamed its classes. Returns null if no skip
  // button is found. Intentionally duplicated in content.js — no shared module
  // exists between the two scripts since the extension has no build step.
  function findSkipButton() {
    const bySelector = document.querySelector(skipButtonSelector);
    if (bySelector) return bySelector;

    const candidates = document.querySelectorAll('button, [role="button"]');
    return Array.from(candidates).find(el => skipTextPattern.test(el.textContent.trim())) || null;
  }

  function showToast() {
    const existing = document.getElementById('houndini-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'houndini-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#ffffff',
      padding: '10px 18px',
      borderRadius: '8px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.01em',
      zIndex: '2147483647',
      opacity: '1',
      transition: 'opacity 0.4s ease',
      pointerEvents: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    });
    toast.textContent = 'Ad skipped';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  function trySkip() {
    if (cooldown) return;
    const btn = findSkipButton();
    if (!btn || clickedButtons.has(btn)) return;

    cooldown = true;
    clickedButtons.add(btn);
    btn.click();
    showToast();
    setTimeout(() => { cooldown = false; }, 1500);
  }

  const observer = new MutationObserver(trySkip);
  observer.observe(document.body, { childList: true, subtree: true });

  // --- Video-level ad skip ---

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
})();

'use strict';

// Automatic skip-button handler.
// A MutationObserver watches document.body for DOM changes. When a visible
// skip button is detected, it is clicked. A WeakSet tracks already-clicked
// buttons so the same element is never triggered twice. A 1.5s cooldown
// prevents double-firing if the DOM mutates rapidly while the button is present.
// Relies on findSkipButton() and showToast() from autoskip-shared.js.

const clickedButtons = new WeakSet();
let cooldown = false;

function trySkip() {
  if (cooldown) return;
  const btn = findSkipButton();
  if (!btn || clickedButtons.has(btn)) return;
  if (getComputedStyle(btn).display === 'none') return;

  cooldown = true;
  clickedButtons.add(btn);
  btn.click();
  showToast();
  setTimeout(() => { cooldown = false; }, 1500);
}

const buttonObserver = new MutationObserver(trySkip);
buttonObserver.observe(document.body, { childList: true, subtree: true });

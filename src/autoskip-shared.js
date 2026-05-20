'use strict';

// Shared utilities used by both autoskip-button.js and autoskip-video.js.
// This file must be loaded first in the manifest so these are available
// when the other two scripts execute.

// Matches known YouTube ad-skip selectors; text fallback handles class renames
const skipButtonSelector = '.videoAdUiEndButton, .ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-End-button, .ytp-ad-skip-button-modern';
const skipTextPattern = /^skip/i;

// Tries known CSS selectors first for speed, then falls back to checking every
// button's text in case YouTube has renamed its classes. Returns null if not found.
// Note: also duplicated in content.js which runs in a separate injection context.
function findSkipButton() {
  const bySelector = document.querySelector(skipButtonSelector);
  if (bySelector) return bySelector;

  const candidates = document.querySelectorAll('button, [role="button"]');
  return Array.from(candidates).find(el => skipTextPattern.test(el.textContent.trim())) || null;
}

// Shows a brief "Ad skipped" toast in the bottom-right corner, then fades it out.
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

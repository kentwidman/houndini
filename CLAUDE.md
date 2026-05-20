# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Houndini is a Chrome browser extension (Manifest V3) that skips or halts looping video backgrounds on websites with a toolbar click or keyboard shortcut (Ctrl+B / Command+B).

## Loading the extension for development

No build step. Load unpacked directly from Chrome:

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `src/` directory

After any change to `src/`, click the refresh icon on the extension card in `chrome://extensions`.

## Packaging a release

```
npm run build
```

Reads the version from `src/manifest.json` and writes `releases/{version}_houndini.zip`. Update the version in `manifest.json` before running.

## Architecture

- `src/manifest.json` — Manifest V3 declaration. Permissions: `scripting`, `activeTab`. The keyboard shortcut triggers `_execute_action`, which fires `chrome.action.onClicked`.
- `src/background.js` — Service worker. Listens for the toolbar click and injects `content.js` into the active tab (all frames).
- `src/content.js` — Content script injected on demand (toolbar click / keyboard shortcut). Self-contained IIFE; no globals.
- `src/autoskip.js` — Persistent content script injected on every page at `document_idle`. Watches the DOM via `MutationObserver` for skip buttons and clicks them automatically, then shows a brief toast notification. A 1.5 s cooldown prevents duplicate toasts per ad.

## How the skip logic works (`content.js`)

1. `findPlayingVideo()` walks all `<video>` elements and returns the first one that `isPlaying()`, falling back to the first video in the DOM.
2. `run()` applies one of two strategies based on `location.hostname`:
   - **Hulu / ABCNews**: set `video.playbackRate = 16.0` (fast-forward, avoids DRM seek restrictions).
   - **Everything else** (including YouTube): seek to `video.duration`, then call `watchForOverlayControls()`.
3. `watchForOverlayControls()` fires `clickOverlayControls()` immediately, then sets up a `MutationObserver` to catch skip/close buttons that appear asynchronously. The observer disconnects after `OVERLAY_WATCH_MS` (2 s), at which point looping videos are paused.
4. `findSkipButton()` tries known CSS selectors first, then falls back to walking all `button`/`[role="button"]` elements for any whose text starts with "Skip" — so it survives YouTube class-name changes.

## Site-specific notes

- `fastForwardHosts` in `content.js` controls which hosts use playback-rate instead of seek. Add new entries as regexes when a site blocks duration-seeking.
- The CSS selectors in `skipButtonSelector` may need updating if YouTube changes its DOM; the text-based fallback handles most renames automatically.

## Key files to ignore

- `_old/` — archived pre-v2 source for Chrome and Firefox variants; not used.
- `old.js` — commented-out iframe detection code; not used.

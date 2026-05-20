# Houndini — your friendly video skipper

Houndini skips and halts looping video backgrounds with a toolbar click or keyboard shortcut, and automatically skips YouTube ads the moment they appear. Houdini, now you see it, now you don't.

---

## Features

- **Auto-skip YouTube ads** — detects ads the moment they start and seeks past them instantly. Also watches for the skip button and clicks it automatically.
- **Manual skip** — click the toolbar icon or press **Ctrl+B** (Windows/Linux) / **Command+B** (Mac) to skip the currently playing video on any site.
- **"Ad skipped" toast** — a brief notification confirms when an ad has been skipped.
- **Looping video backgrounds** — pauses looping videos on websites that use them as decorative backgrounds.

---

## Manual Installation (Chrome)

Houndini is not available on the Chrome Web Store and must be installed manually.

1. [Download or clone this repository](https://github.com/kwidman/houndini) to your computer.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `src/` folder inside the downloaded repository.
6. The Houndini icon will appear in your Chrome toolbar. Pin it for easy access.

**To update after pulling new changes:** go to `chrome://extensions` and click the refresh icon on the Houndini card.

---

## How It Works

### YouTube ad auto-skip (automatic, no click needed)
- Watches for YouTube's `ad-showing` class on the player and immediately seeks the ad video to its end.
- Simultaneously watches the DOM for a skip button and clicks it the moment it appears.
- Shows an "Ad skipped" toast notification when an ad is bypassed.

### Manual skip (toolbar button or keyboard shortcut)
- Finds the currently playing video on the page.
- **Hulu / ABC News** — sets playback rate to 16× (these sites block seeking due to DRM).
- **All other sites** — seeks the video to its end, then watches for and clicks any skip/close buttons that appear.

---

## Sites

| Site | Auto-skip ads | Manual skip |
|---|---|---|
| YouTube | ✅ | ✅ |
| Hulu | — | ✅ (fast-forward) |
| ABC News | — | ✅ (fast-forward) |
| Any site with video | — | ✅ |

---

## Creator

Made by [Kent Widman](https://kentwidman.com).

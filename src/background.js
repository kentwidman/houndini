// When the extension's toolbar button is clicked, run the content script.
chrome.action.onClicked.addListener((tab) => {
  // Inject content.js into every frame of the currently active tab.
  chrome.scripting.executeScript({
    files: ['content.js'],
    target: { tabId: tab.id, allFrames: true }
  });
});

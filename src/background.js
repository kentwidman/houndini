chrome.runtime.onMessage.addListener(function(message, sender) {
  if (message.sendBack) {
    chrome.tabs.sendMessage(sender.tab.id, message.data);
  }
});


chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript({
    file: 'js/houndini.js'
  });
});

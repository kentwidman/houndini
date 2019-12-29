if (!window.isTop) { // true  or  undefined
  // do something...

  //
  chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.houndini){
      houndini.init();
    }
  });
}

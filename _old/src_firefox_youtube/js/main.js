console.log('main.js is loaded!');

var isTop = true;

console.log('in main!');

port = browser.runtime.connect({
  name: "main"
});

port.onMessage.addListener(function(msg) {
  console.log("Running houndini in main");
  var success = houndini.init();
  console.log("success:" + success);
  port.postMessage({success: success});
});

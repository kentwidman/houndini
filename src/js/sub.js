var port;

console.log('sub.js is loaded!')
if (!window.isTop) { // true  or  undefined
  console.log('in iframe!');

  port = chrome.extension.connect({
    name: "iframe"
  });


  port.onMessage.addListener(function(msg) {
    console.log("Running houndini in iframe");
    var success = houndini.init();
    console.log("success:" + success);
    //port.postMessage({success: success});
  });
}

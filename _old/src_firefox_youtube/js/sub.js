var port;

console.log('sub.js is loaded!')
if (!window.isMainFrame) {
  console.log('in iframe!');

  port = browser.runtime.connect({
    name: "iframe"
  });


  port.onMessage.addListener(function(msg) {
    console.log("Running houndini in iframe");
    var success = houndini.init();
    console.log("success:" + success);
    //port.postMessage({success: success});
  });
}

/*
The background process runs on every frame, whether it's the main document or a
document within an iframe.
*/

/*
  Setup a lister to listen for a message that has the propertiery sendBack
  Listen between frame so we can comunicate.
*/
var mainports = {},
    ports = {},
    ids = 0;

browser.runtime.onConnect.addListener(function(port) {
  console.log("Connected .....");

  // for the main.js port.
  if (port.name === 'main'){
    port.index = ids++;
    mainports[port.index] = port;

    mainports[port.index].onMessage.addListener(function(msg) {
      if (!msg.success) {
        var portsToDelete = [];
        for(const currentPortId in ports) {
          ports[currentPortId].postMessage(`Fire Houndini ${currentPortId}`);
        }
      }
    });
  } else if (port.name === 'iframe') {
    port.index = ids++;
    ports[port.index] = port;
  } else {
    console.error('invalid port');
  }


  port.onDisconnect.addListener((p) => {
    if (p.name === 'main'){
      delete mainports[p.index];
    } else {
      delete ports[p.index];
    }
  });
});


browser.browserAction.onClicked.addListener(function (tab) {
  for(const currentPortId in mainports) {
    mainports[currentPortId].postMessage(`Fire Houndini ${currentPortId}`);
  }
});

/*
chrome.runtime API to retrieve the background page
Fired when a message is sent from either an extension process (by runtime.sendMessage)
or a content script (by tabs.sendMessage).
*/

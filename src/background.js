// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//load houndini script.
const url = chrome.runtime.getURL('js/houndini.js');
var sourceCode = '';

// fetch(url)
//   .then(response => response.body)
//   .then(body => {
//     const reader = body.getReader();
//     console.log(reader);
//     reader.read().then(({ done, value }) => {
//       // When no more data needs to be consumed, close the stream
//       console.log(done);
//       console.log(value);
//       sourceCode = new TextDecoder("utf-8").decode(value);
//       console.log(sourceCode);
//     });
//   });

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  // console.log('Turning ' + tab.url + ' red!');
  // chrome.tabs.executeScript({
  //   //code: 'document.body.style.backgroundColor="red"'
  //   code: sourceCode
  // });

  chrome.tabs.executeScript({
    file: 'src/houndini.js'
  });
});

// chrome.runtime.onMessage.addListener(
//   function(message, callback) {
//     if (message == 'runContentScript'){
//       chrome.tabs.executeScript({
//         file: 'contentScript.js'
//       });
//     }
//   }
// );

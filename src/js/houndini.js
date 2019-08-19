/*
 * Site it works on:
 * http://www.adultswim.com/videos/*
 * https://www.youtube.com/watch?v=*
 * https://www.hulu.com/*
 * http://www.cc.com/episodes/*
 * https://www.cnn.com/*
 * https://www.fox.com/*
 *
 */
(function() {
  'use strict';
  // constants
  var MAX_PLAYBACK_RATE = 16.0;

  // var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var body = document.body;
  var button;
  var observer;

  // Selectors
  var videoSelector = 'video';

  // Timeout
  var resizeTimeout;

  // ads a helper "playing" to HTMLMediaElement
  function registerPlaying(){
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      configurable: true, //Todo: fix this hack
      get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
      }
    });
  }

  function findPlayingVideo(){
    var selectedVideo = null;
    var videos = document.getElementsByTagName('video');
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (video.playing) {
        return video;
      }
    }
    console.log(video);

    // else return first video.
    if (videos[0]){
      return videos[0];
    }

    return false;
  }

  function findIframe(){
    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0, l = iframes.length; i < l; i++) {
      var iframe = iframes[i];
      if (
        iframe.hasAttribute('allowfullscreen') ||
        (iframe.getAttribute('allow') && iframe.getAttribute('allow') === 'autoplay') ||
        (iframe.getAttribute('src') && iframe.getAttribute('src').match(/video|youtu/))
      ) {
        return iframe;
      }
    }

    return false;
  }

  // div.ad-showing
  function skipVideo() {
    // debugger;

    // Your code here...
    var v = findPlayingVideo();
    console.log(v);
    if (v) {
      if (
        location.hostname.match(/hulu\.com/) ||
        location.hostname.match(/abcnews\.go\.com/) ||
        location.hostname.match(/theplatform\.com/)
      ) {
        //hulu fast forward
        // setInterval(function(){
        //   v.playbackRate = MAX_PLAYBACK_RATE;
        // }, 1);
        v.playbackRate = MAX_PLAYBACK_RATE;
      } else if (location.hostname.match(/cc\.com/)) {
        v = document.querySelector('.edge-player-ads-element');
        v.currentTime = v.duration;
      } else {
        v.currentTime = v.duration;

        // Youtube skip button.
        setTimeout(function(){
          var skip = document.querySelector('.videoAdUiSkipButton');
          if (!skip){
			skip = document.querySelector('.ytp-ad-skip-button');
          }
          if (skip) {
            skip.click();
          }
        },100);
      }
      return true;
    } else {
      return false;
    }
  }

  function injectIframe() {
    // iframe
    var frame = findIframe();
    if (frame){
      var iframeDocument = frame.contentWindow.document;
      var s = iframeDocument.createElement("script");
      s.type = "text/javascript";
      s.text = '' +
        registerPlaying.toString() + "\n" +
        findPlayingVideo.toString() + "\n" +
        skipVideo.toString() + "\n" +
        'registerPlaying(); ' +
        'skipVideo(); ';

      iframeDocument.body.appendChild(s);
    }
  }

  function init() {
    registerPlaying();

    // if video skip fails
    if (!skipVideo()) {
      injectIframe();
    }
  }

  init();
})();


/*
this.globalSubscribers.push(e.getStream("ratechange").subscribe(function() {
                1 !== e.getPlaybackRate() && e.setPlaybackRate(1)
            }));
*/

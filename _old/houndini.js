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
  const MAX_PLAYBACK_RATE = 16.0;

  var body = document.body;
  var button;
  var observer;

  /**
 * Ads a helper "playing" to HTMLMediaElement
 *
 * @since      1.2
 */
  function registerPlaying(){
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      configurable: true, //Todo: fix this hack
      get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
      }
    });
  }

  /**
 * Finds and return the Video Html Element that is currently playing.
 *
 * @since      1.2
 * @return {HtmlVideoElement} Video that's currently is playing.
 */
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

  /**
   * Finds iframe video.
   *
   * Search for iframes that most likely are videoplayers and return thems in an array.
   *
   * @return {array} iframeHtmlElements.
   */
  function findIframe(){
    var iframes = document.getElementsByTagName('iframe');
    var videoIframes = [];
    for (var i = 0, l = iframes.length; i < l; i++) {
      var iframe = iframes[i];
      if (
        iframe.hasAttribute('allowfullscreen') ||
        (iframe.getAttribute('allow') && iframe.getAttribute('allow') === 'autoplay') ||
        (iframe.getAttribute('src') && iframe.getAttribute('src').match(/video|youtu/))
      ) {
        videoIframes.push(iframe);
      }
    }

    return videoIframes;
  }

  /**
   * Skip the video on videos that are running.
   *
   * @return {Boolean} Whether action was success full.
   */
  function performSkipVideo() {
    // debugger;

    // Your code here...
    var video = findPlayingVideo();
    if (video) {
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
        video = document.querySelector('.edge-player-ads-element');
        video.currentTime = video.duration;
      } else {
        video.currentTime = video.duration;

        // Youtube skip button.
        setTimeout(function(){
          var skip = document.querySelector('.videoAdUiSkipButton');
          if (!skip) {
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


  /**
   * Opens iframe in new tab so we can control it.
   *
   * @return {window} new window.
   */
  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
    return win.contentWindow.document;
  }

  /**
   * Injects houndi video code into iframe.
   *
   */
  function init() {
    // debugger;

    registerPlaying();

    let videoSkipSuccess = performSkipVideo();
    return videoSkipSuccess;
  }

  //init();
})();

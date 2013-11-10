// ** Based On: **
// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

var connection = new RTCMultiConnection();
var sessionStarted = false;
connection.session = {
  audio: true
};


var startBtn = document.getElementById('setup-new-conference');

// https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
connection.openSignalingChannel = function(config) {
  var SIGNALING_SERVER = 'https://www.webrtc-experiment.com:2015/';
  //var SIGNALING_SERVER = 'https://localhost:2015/';
  var channel = config.channel || this.channel || location.hash.substr(1);
  var sender = Math.round(Math.random() * 999999999) + 999999999;

  io.connect(SIGNALING_SERVER).emit('new-channel', {
    channel: channel,
    sender: sender
  });

  var socket = io.connect(SIGNALING_SERVER + channel);
  socket.channel = channel;
  socket.on('connect', function() {
    if (config.callback) config.callback(socket);
  });

  socket.send = function(message) {
    socket.emit('message', {
      sender: sender,
      data: message
    });
  };

  socket.on('message', config.onmessage);
};

connection.onstream = function(e) {
  startBtn.style.display = 'none';
  sessionStarted = true;

  audiosContainer.insertBefore(e.mediaElement, audiosContainer.firstChild);
  rotateAudio(e.mediaElement);
};

function rotateAudio(mediaElement) {
  mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
  setTimeout(function() {
    mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
  }, 1000);
}

connection.onstreamended = function(e) {
  e.mediaElement.style.opacity = 0;
  rotateAudio(e.mediaElement);
  setTimeout(function() {
    if (e.mediaElement.parentNode) {
      e.mediaElement.parentNode.removeChild(e.mediaElement);
    }
  }, 1000);
};

connection.onerror = function(e) {
  console.log('onerror');
  console.log(e);
// setup signaling to search existing sessions
  connection.connect();
};

var sessions = { };
var audiosContainer = document.getElementById('audios-container') || document.body;

connection.extra = {
  'session-name': 'Anonymous'
};
connection.bandwidth = {
  audio: 10
};

connection.open();

setTimeout(function() {
  if (!sessionStarted) {
    startBtn.style.display = 'block';
  }
}, 5000);


(function() {
  var uniqueToken = document.getElementById('unique-token');
  if (uniqueToken)
    if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();
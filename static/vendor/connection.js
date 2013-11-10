// ** Based On: **
// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

var context = new AudioContext();

// disable rtc logging
window.skipRTCMultiConnectionLogs = true;

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
  var channel = "songbox";
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
  createUser(e);
};

var hasClapped = _.debounce(function() {
  socket.emit('clap');
}, 300);

// Create a user icon
function createUser(e) {
  var userEl = $('<div/>').attr({id: 'user' + e.userid}).addClass('user');
  e.mediaElement.style.opacity = 0;
  userEl.append(e.mediaElement);
  audiosContainer.insertBefore(userEl.get(0), audiosContainer.firstChild);

  var streamid = e.streamid;
  userEl.on('click', function(e) {
    e.preventDefault();
    if (userEl.hasClass('muted')) {
      connection.streams[streamid].unmute({ audio: true });
      userEl.removeClass('muted');
    } else {
      connection.streams[streamid].mute({ audio: true });
      userEl.addClass('muted');
    }
  });

  var clap = new Clap();
  var node = clap.detect(context.createMediaStreamSource(e.stream), context, function(err, average) {
    if (average > 20) hasClapped();
    userEl.get(0).style.backgroundColor = 'hsl(170, ' + (average * 2) + '%, 50%)';
  });
}

connection.onstreamended = function(e) {
  var userEl = $('#user' + e.userid);
  userEl.fadeOut();
  setTimeout(function() {
    userEl.remove();
  }, 1000);
};

connection.onerror = function(e) {
  console.log('onerrror');
  console.log(e);
};

var sessions = { };
var audiosContainer = document.getElementById('audios-container') || document.body;

startBtn.onclick = function() {
  connection.extra = {
    'session-name': 'Anonymous'
  };
  connection.bandwidth = {
    audio: 10
  };

  connection.open();
};


$( window ).load(function() {
  setTimeout(function() {
    if (!sessionStarted) {
      startBtn.style.display = 'block';
    }
  }, 7000);
});


// setup signaling to search existing sessions
connection.connect();

(function() {
  var uniqueToken = document.getElementById('unique-token');
  if (uniqueToken)
    if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();
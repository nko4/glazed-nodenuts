// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('G-TTdL9lMtih7ZXl');

var isProduction = (process.env.NODE_ENV === 'production');
var express = require('express');

var app = express();
var port = (isProduction ? 80 : 8000);
var server = app.listen(port);

// Globalize this beastie boy.
global.io = require('socket.io').listen(server);

// Uncomment below to hide all socket.io logging in your terminal.
//io.set('log level', 0);

// Used to send pulse information.
var playlist = require('./lib/playlist');

// Start the playlist!
playlist.start();

console.log('Server running at http://0.0.0.0:' + port + '/');
app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

app.use('/api', require('./lib/api'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  setInterval(function() {
    socket.emit('pulse', playlist.state());
  }, 500);

  socket.on('voteSkip', function() {
    playlist.voteSkip(socket);
  });

  socket.on('clap', function() {
    playlist.registerClap();
  });
});

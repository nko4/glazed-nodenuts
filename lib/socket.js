var socketio = require('socket.io');
var playlist = require('./playlist');

// This will configure socket.io to work correctly once the depenency has
// been created.
exports.configure = function(server) {
  // Create the socket.io server.
  var io = socketio.listen(server);

  // Ensure playlist has access to the io object.
  playlist.io = io;

  // Start the playlist!
  playlist.start();

  // Uncomment below to hide all socket.io logging in your terminal.
  //io.set('log level', 0);

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
};

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('G-TTdL9lMtih7ZXl');

var isProduction = (process.env.NODE_ENV === 'production');
var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var port = (isProduction ? 80 : 8000);
server.listen(port);
console.log('Server running at http://0.0.0.0:' + port + '/');
app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

app.use('/api', require('./api'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

/*

var http = require('http');
var port = (isProduction ? 80 : 8000);

http.createServer(function (req, res) {
  // http://blog.nodeknockout.com/post/35364532732/protip-add-the-vote-ko-badge-to-your-app
  var voteko = '<iframe src="http://nodeknockout.com/iframe/glazed-nodenuts" frameborder=0 scrolling=no allowtransparency=true width=115 height=25></iframe>';

  <!-- I'm a hipster -->
  voteko += "<!-- tim deploy good for great win! -->";

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body>' + voteko + '</body></html>\n');
}).listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});

 */


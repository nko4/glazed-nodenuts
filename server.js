// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('G-TTdL9lMtih7ZXl');

var isProduction = (process.env.NODE_ENV === 'production');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var port = (isProduction ? 80 : 8000);
server.listen(port);
console.log('Server running at http://0.0.0.0:' + port + '/');
app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

app.use('/api', require('./lib/api'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });

  //socket.emit('pulse', { timestamp: 
});


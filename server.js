// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('G-TTdL9lMtih7ZXl');

// Require.
var express = require('express');
var minify = require('express-minify');
var api = require('./lib/api');
var socket = require('./lib/socket');

// Setup.
var app = express();
var server = app.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
var addrinfo = server.address();

// Configure.
socket.configure(server);

// Minify and GZip all assets at runtime who cares...
app.configure('production', function() {
  app.use(express.compress());
  app.use(minify());
});

// Ensure static files can be correctly served.
app.configure(function() {
  app.use(express.static(__dirname + '/static'));
});

// Serve.
app.use('/api', api);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Display the server running, using dynamic instead of hardcoded values.
console.log('Server running at http://%s:%d', addrinfo.address, addrinfo.port);

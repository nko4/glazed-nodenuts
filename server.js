// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('G-TTdL9lMtih7ZXl');

// Require.
var fs = require('fs');
var express = require('express');
var api = require('./lib/api');
var socket = require('./lib/socket');


// Lodash you such a pain in the ass.
global._ = require('lodash');

// Setup.
var app = express();
var server = app.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
var addrinfo = server.address();

// Configure.
socket.configure(server);

// Minify and GZip all assets at runtime who cares...
app.configure('production', function() {
  app.use(express.compress());
});

// Ensure static files can be correctly served.
app.configure(function() {
  app.use(express.static(__dirname + '/static'));
});

// Serve.
app.use('/api', api);

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  evaluate: /\{\%(.+?)\%\}/g
};

var index = _.template(String(fs.readFileSync(__dirname + '/index.html')));

app.get('/', function (req, res) {
  res.end(index({ env: process.env.NODE_ENV }));
});

// First remove the cached file.
try {
  fs.unlinkSync(__dirname + '/cache/glazed.js');
} catch(ex) { };

// Hate this so much.  THIS WAS NOT TIM'S IDEA.
var files = [
  '/js/shim.js',
  '/vendor/jquery.min.js',
  '/vendor/lodash.min.js',
  '/vendor/rtc.js',
  '/vendor/midilib2/MIDI/AudioDetect.js',
  '/vendor/midilib2/MIDI/LoadPlugin.js',
  '/vendor/midilib2/MIDI/Plugin.js',
  '/vendor/midilib2/MIDI/Player.js',
  '/vendor/midilib2/Widgets/Loader.js',
  '/vendor/midilib2/Window/Event.js',
  '/vendor/midilib2/Window/DOMLoader.XMLHttp.js',
  '/vendor/midilib2/Window/DOMLoader.script.js',
  '/vendor/midilib2/inc/jasmid/stream.js',
  '/vendor/midilib2/inc/jasmid/midifile.js',
  '/vendor/midilib2/inc/jasmid/replayer.js',
  '/vendor/midilib2/inc/Base64.js',
  '/vendor/midilib2/inc/base64binary.js',
  '/js/clap.js',
  '/vendor/connection.js',
  '/js/init.js',
  '/js/skip.js'
];

var outputBuffer = '';

// Iterate over each file and concat into a real buffer.
files.map(function(file) {
  var contents = fs.readFileSync(__dirname + '/static' + file);
  outputBuffer += String(contents)+';;';
});

// Output the optimized file.
fs.writeFileSync(__dirname + '/cache/glazed.js', outputBuffer);

// Build prod version.
app.get('/glazed.js', function(req, res) {
  res.sendfile(__dirname + '/cache/glazed.js');
});

// Display the server running, using dynamic instead of hardcoded values.
console.log('Server running at http://%s:%d', addrinfo.address, addrinfo.port);

var MIDIFile = require('midifile');
var fs = require('fs');
var express = require('express');

var api = express();

api.get('/', function(req, res) {
  res.end('API wired up.');
});

module.exports = api;

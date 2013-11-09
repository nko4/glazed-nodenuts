var fs = require('fs');
var express = require('express');

var Parser = require('./parser');

var api = express();

api.get('/', function(req, res) {
  res.end('API wired up.');
});

api.get('/lyrics', function(req, res) {
  var parser = new Parser('twoprinc.kar');

  parser.ready().spread(function(contents, midi) {
    res.json(midi.value.getLyrics());
  }).fail(function(err) {
    console.error(err);
    res.send(500);
  });
});

module.exports = api;

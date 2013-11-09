var fs = require('fs');
var express = require('express');
var Q = require('q');
var Parser = require('./parser');
var playlist = require('./playlist');

var api = express(); 

// Read out all songs from the disk.
var songs = Q.ninvoke(fs, 'readdir', __dirname + '/../cache/kar/');

// Display all list songs.
api.get('/songs', function(req, res) {
  return songs.then(function(songs) {
    var parseSongs = songs.map(function(song) {
      return new Parser(song).meta();
    });

    Q.allSettled(parseSongs).then(function(defs) {
      res.json(defs.map(function(def) {
        return def.value;
      }));
    });
  });
});

// Convert song to base64.
api.get('/songs/:name', function(req, res) {
  new Parser(req.param('name'))
    .base64()
    .then(res.json.bind(res))
    .fail(res.send.bind(res));
});

// Display specific lyrics.
api.get('/lyrics/:name', function(req, res) {
  new Parser(req.param('name'))
    .lyrics()
    .then(res.json.bind(res))
    .fail(res.send.bind(res));
});

api.get('/playlist/skip', function(req, res) {
  playlist.skip();
  res.json(playlist.state());
});

api.get('/playlist/state', function(req, res) {
  res.json(playlist.state());
});

module.exports = api;

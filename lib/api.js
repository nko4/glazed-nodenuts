var fs = require('fs');
var express = require('express');

var Parser = require('./parser');

var api = express();

var songs = fs.readdirSync(__dirname + "/../cache/kar/");

api.get('/', function(req, res) {
  res.end('API wired up.');
});

// Display all list songs.
api.get('/songs', function(req, res) {
  res.json(songs);
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

module.exports = api;

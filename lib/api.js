var fs = require('fs');
var express = require('express');

var Parser = require('./parser');

var api = express();

api.get('/', function(req, res) {
  res.end('API wired up.');
});

api.get('/lyrics', function(req, res) {
  new Parser('twoprinc.kar')
    .lyrics()
    .then(res.json.bind(res))
    .fail(res.send.bind(res));
});

module.exports = api;

var MIDIFile = require('midifile');
var fs = require('fs');
var Q = require('q');
var utils = require('./utils');

function Parser(name) {
  this.name = name;

  this.file = this._load();
  this.midi = this._parse();
}

Parser.prototype = {
  // Load the given kar.
  _load: function() {
    return Q.ninvoke(fs, 'readFile', __dirname + '/../cache/kar/' + this.name); 
  },

  // Parse out any lyrics.
  _parse: function() {
    return this.file.then(function(contents) {
      return new MIDIFile(utils.toArrayBuffer(contents));
    });
  },

  // Once everything is ready to start being used.
  ready: function() {
    return Q.allSettled([this.file, this.midi]);
  },

  // Parse out lyrics and strip out erroneous slashes.
  lyrics: function() {
    return this.ready().spread(function(file, midi) {
      return midi.value.getLyrics().map(function(lyric) {
        lyric.text = lyric.text.replace(/\/|\\/g, '');
        return lyric;
      });
    });
  },

  // Converts the file to base64.
  base64: function() {
    return this.file.then(function(contents) {
      return 'data:audio/midi;base64,' + contents.toString('base64');
    });
  },

  // Get the \m/ meta \m/ information.
  meta: function() {
    return this.ready().spread(function(file, midi) {
      var events = midi.value.getMidiEvents();

      return {
        // End time, normalize to seconds.
        endTime: events[events.length-1].playTime / 1000
      };
    });
  }
};

module.exports = Parser;

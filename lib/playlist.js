var Parser = require('./parser');

// Here is the song list order that we will loop.
exports.songs = [
  'wearechamps.kar',
  'whenicomearound.kar',
  'ghostbusters.kar',
  'crocodilerock.kar',
  'dancingqueen.kar',
  'dreamlover.kar',
  'eott.kar',
  'kokomo.kar',
  'likeavirgin.kar',
  'smellsliketeen.kar',
  'takeonme.kar',
  'twoprinc.kar',
  'youreallygotme.kar'
];

// Dumb timer.
var timer = {
  start: function(endTime, done) {
    this.startTime = Date.now();
    this.endTime = endTime;

    // Kill me now.
    this.timeout = setInterval(this.tick.bind(this), 100);
  },

  tick: function() {
    var elapsed = (Date.now() - this.startTime)/1000;

    // Update the global state position.
    exports.position = elapsed;

    if (elapsed >= this.endTime) {
      this.end();
    }
  },

  end: function() {
    clearInterval(this.timeout);

    if (this.next) {
      this.next();
    }
  }
};

// Always start with the first song.
exports.index = 0;

// Position in current midi file, start with null.
exports.position = null;

// Generate out a nice state.
exports.state = function() {
  return {
    song: exports.songs[exports.index],
    position: exports.position
  };
};

// This lets the server to know to start.
exports.start = function() {
  // Start loopy looping.
  exports.loop();

  // Set the initial state position to 0;
  exports.position = 0;
};

// This is gonna be sketchy for now.
exports.loop = function() {
  // Start with the current index and find its end time.
  var file = exports.songs[exports.index];

  new Parser(file).meta().then(function(meta) {
    // Get the length of time in seconds.
    timer.start(meta.endTime);
    
    // Once the timer ends for whatever reason, continue to next song.
    timer.next = function() {
      // Ensure that looping will occur with modulus.
      exports.index = (exports.index + 1) % exports.songs.length;

      // Reset the position.
      exports.position = 0;

      // Loop again!
      exports.loop();
    };
  });
};

// Skip a song by ending the current timer cycle.
exports.skip = function() {
  timer.end();
};

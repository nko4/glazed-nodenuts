var Parser = require('./parser');

var voteCache = {
  reset: function() {
    // Store voted clients here, we can override these since we care about the
    // song not the actual client, we null this out anyways after a song
    // change.
    this.clients = [];
  }
};

// Set up a clap count.
var clap = {
  reset: function() {
    this.count = 0;
  }
};

// Initially reset to get started.
voteCache.reset();

// INitialyy rtrest the g0tt clap too.
clap.reset();

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

    // Update the amount of clients every tick.
    exports.clients = exports.io.sockets.clients();

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

// Here is the song list order that we will loop.
exports.songs = [
  'wearechamps.kar',
  'smellsliketeen.kar',
  'thesign.kar',
  'borntobewild.kar',
  'californiagirls.kar',
  'dancingqueen.kar',
  'celebration.kar',
  'dancinginthedark.kar',
  'bluesuedeshoes.kar',
  'whenicomearound.kar',
  'ghostbusters.kar',
  'downunder.kar',
  'heartofglass.kar',
  'thatllbetheday.kar',
  'crocodilerock.kar',
  'eott.kar',
  'walklikeanegyptian.kar',  
  'likeavirgin.kar',
  'twoprinc.kar',
  'youreallygotme.kar'
];

// Always start with the first song.
exports.index = 0;

// Position in current midi file, start with null.
exports.position = null;

// Send down endTime as well.
exports.endTime = null;

// Generate out a nice state.
exports.state = function() {
  var resp = {
    song: exports.songs[exports.index],
    position: exports.position,
    endTime: exports.endTime,
  };

  var part = voteCache.clients || [];
  var total = exports.clients || [];

  resp.skip = {
    votes: part.length,
    total: total.length
  };

  // Attach the number of claps for this song.
  resp.claps = clap.count;

  return resp;
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
    // Set the end time.
    exports.endTime = meta.endTime;

    // Get the length of time in seconds.
    timer.start(meta.endTime);
    
    // Once the timer ends for whatever reason, continue to next song.
    timer.next = function() {
      // Ensure that looping will occur with modulus.
      exports.index = (exports.index + 1) % exports.songs.length;

      // Reset the position.
      exports.position = 0;

      // Reset caches.
      voteCache.reset();
      clap.reset();

      // Loop again!
      exports.loop();
    };
  });
};

// Skip a song by ending the current timer cycle.
exports.skip = function() {
  // Reset caches.
  voteCache.reset();
  clap.reset();
  timer.end();
};

// Provide vote skipping.
exports.voteSkip = function(id) {
  // Determine if we should add to the current vote.
  if (voteCache.clients.indexOf(id) === -1) {
    voteCache.clients.push(id);
  }

  // If it's enough to skip, then do it.  Give a slight delay to allow
  // for UI adjustment.
  if (voteCache.clients.length / exports.clients.length >= 0.5) {
    exports.skip();
  }
};

// Provide vote skipping.
exports.registerClap = function() {
  clap.count += 1;
};

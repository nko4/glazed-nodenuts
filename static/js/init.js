(function(window) {
  "use strict";

  // Deal with it.
  window.lyrics = null;

  // Cache me some jQuery DOM.
  var dom = {
    lyrics: $('some-lyrics'),
    monitor: $('.tv-contents'),
    songTitle: $('.tv-title')
  };

  // Cache all templates used.
  var template = {
    lyrics: _.template($('#lyrics').html())
  };

  // This will synchronize with the server and play the current song at the
  // correct time.
  function playCurrentSong() {
    // Fetch the current state.
    return $.getJSON('/api/playlist/state').then(function(state) {
      var currentSongFile = state.song;
      var startPosition = state.position;

      // Bail out if we have no songs to play.
      if (!currentSongFile) {
        return;
      }

      // Fetch the lyrics and base64 song data.
      var lyrics = $.getJSON('/api/lyrics/' + encodeURI(currentSongFile));
      var song = $.getJSON('/api/songs/' + encodeURI(currentSongFile));

      return $.when(lyrics, song).then(function(lyrics, song) {
        // Reset lyrics.
        window.lyrics = lyrics = lyrics[0];

        // Normalize song.
        song = song[0];

        // Show the lyrics on the page.
        dom.lyrics.html(template.lyrics({ lyrics: _(lyrics) }));

        // Start playing the song.
        simulatePlaying(song, startPosition);
      });
    });
  }

  function simulatePlaying(song, startPosition) {
    var startTime = Date.now();
    var start = Number(lyrics[0].playTime);
    var stop = Number(lyrics[lyrics.length-1].playTime);

    // Awesome variable name.
    var $lyrics = dom.lyrics.find('a-lyric');

    // Maintain it like this for now.
    var index = 0;

    // Start at the same time.
    MIDI.loadPlugin(function () {
      // this is the language we are running in
      // this sets up the MIDI.Player and gets things going...
      var player = MIDI.Player;
      MIDI.setVolume(0,9);

      player.timeWarp = 1; // speed the song is played back

      player.loadFile(song, function() {
        player.stop();
        player.currentTime = startPosition * 1000;
        player.start();
      });

      // Retrieve song meta data and put into array
      var songArray = []
      for (var i = 0; i <= 100; i++ ) {
        var event  = player.data[i][0].event;	  
        if ( event.type == 'meta' && event.text ) {
          var metaText = event.text.split(""); 
          if ( metaText[1] == 'T') {
          songArray.push(event.text.substr(2, event.text.length -2));
        }
        } 
      }
      displaySongInfo( songArray );
     
      // set songArray to global in case needed later
      window.songArray = songArray;

      player.addListener(function(data) {

        var elapsed = data.now/1000;

        // Bail out if out of lyrics.
        if (index >= lyrics.length) {
          return;
        }

        // If the current lyric does not have a play time attribute, skip it.
        if (!lyrics[index] || !lyrics[index].playTime) {
          index = index + 1;
          return;
        }

        // Calculate the current play time.
        var curPlayTime = lyrics[index].playTime/1000;

        // Don't scroll like a maniaaac maniaaac on the floor.
        if (curPlayTime < startPosition) {
          index = index + 1;
          return;
        }

        // Compare the timing and correctly.
        if (curPlayTime <= elapsed) {
          $lyrics[index].classList.add('active');

          // get position of active lyric
          var monitorPosition = dom.monitor.position()
          var activePosition = $($lyrics[index]).position();
          scrollLyrics(activePosition.top - monitorPosition.top);

          if ($lyrics[index-1]) {
            $lyrics[index-1].classList.remove('active');
            $lyrics[index-1].classList.add('retired');
          }

          // Just like papa crock taught me!
          index = index + 1;
        }

        console.log(curPlayTime, elapsed, startPosition);
      }, 100);

    });
  }

  function scrollLyrics( yPos ) {
    dom.lyrics.css({ 'top' : '-' + yPos + 'px' });
  }

  function displaySongInfo( songArray ) {
    dom.songTitle.html("");

    for (var i = 0; i < songArray.length; i++ ) {
      dom.songTitle.append(songArray[i] + '<br />');
    }
  }

  // Kick off the application by starting the current song.
  playCurrentSong();
})(this);

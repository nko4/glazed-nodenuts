(function(window) {
  "use strict";

  // Deal with it, yeaaaaaa.
  var lyrics = null;
  var currentSongFile = null;
  var startPosition = null;
  var player = null;
  var song = null;

  // Cache me some jQuery DOM.
  var dom = {
    refresh: function() {
      this.lyrics = $('some-lyrics');
      this.monitor = $('.tv-contents');
      this.songTitle = $('.tv-title');
      this.volumeSlider = $('#vol');
      this.progress = $('progress');
      this.muteGlobalButton = $('#mute-global');
      this.muteSelfButton = $('#mute-self');
      this.voteSkip = $('.vote-skip .count');
    }
  };

  // Refresh dat dom; hell yeah; work it.
  dom.refresh();

  // Cache all templates used.
  var template = {
    lyrics: _.template($('#lyrics').html())
  };

  // This will synchronize with the server and play the current song at the
  // correct time.
  function playCurrentSong() {
    // Fetch the current state.
    return $.getJSON('/api/playlist/state').then(function(state) {
      currentSongFile = state.song;
      startPosition = state.position;

      // Bail out if we have no songs to play.
      if (!currentSongFile) {
        return;
      }

      // Fetch the lyrics and base64 song data.
      var lyricsReq = $.getJSON('/api/lyrics/' + encodeURI(currentSongFile));
      var songReq = $.getJSON('/api/songs/' + encodeURI(currentSongFile));

      return $.when(lyricsReq, songReq).then(function(_lyrics, _song) {
        // Reset lyrics.
        lyrics = _lyrics[0];

        // Normalize song.
        song = _song[0];

        // Show the lyrics on the page.
        dom.lyrics.html(template.lyrics({ lyrics: _(lyrics) }));

        // Start playing the song.
        play();
      });
    });
  }

  function play() {
    // Awesome variable name.
    var $lyrics = dom.lyrics.find('a-lyric');
    scrollLyrics(0);
    // Maintain it like this for now.
    var index = 0;

    // Only initialize on the first run through.
    if (!player) {
      MIDI.loadPlugin(function () {
        // this is the language we are running in
        // this sets up the MIDI.Player and gets things going...
        player = MIDI.Player;
        MIDI.setVolume(0,9);

        cont();
      });
    } else {
      cont();
    }

    function cont() {
      player.timeWarp = 1; // speed the song is played back

      player.loadFile(song, function() {
        player.stop();
        player.currentTime = startPosition * 1000;
        player.start();
      });

      // Retrieve song end time
      var endTimeRaw = MIDI.Player.endTime;
      var songMinutes = Math.floor(endTimeRaw/60000);
      var songSeconds = Math.floor( (endTimeRaw/60000 - songMinutes) * 60 );

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

      songArray.push('Time: ' + songMinutes + ':' + ((songSeconds.toString().length === 1) ? songSeconds + '0' : songSeconds));

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
          if ($lyrics[index]) {
            $lyrics[index].classList.add('active');
          }
          // get position of active lyric
          var monitorPosition = dom.monitor.position()
          var activePosition = $($lyrics[index]).position();
          if ( activePosition ) {
	        scrollLyrics(activePosition.top - monitorPosition.top);
          }

          if ($lyrics[index-1]) {
            $lyrics[index-1].classList.remove('active');
            $lyrics[index-1].classList.add('retired');
          }

          // Just like papa crock taught me!
          index = index + 1;
        }

        //console.log(curPlayTime, elapsed, startPosition);
      }, 100);
    }
  }

  function connectSocket() {
    var url = ['http://', location.hostname, ':', location.port].join('');
    window.socket = io.connect(url);

    socket.on('pulse', function(state) {
      // Up date dat dom.
      dom.progress.val((state.position / state.endTime) * 100);

      // Vaiarkables.
      var part = state.skip.votes;
      var whole = state.skip.total;

      // Holy shit my math skills are not where they used to be.
      var left = Math.ceil(whole - (whole * (0.5+(part/whole))));

      // Vote.
      dom.voteSkip.text(left);

      //console.log(state);
      // If we are on a totally different song now, change it.
      if (currentSongFile !== state.song) {
        // Reset.
        song = state.song;
        currentSongFile = state.song;

        return playCurrentSong();
      }

      // Otherwise sychronize to the latest.
      if (player) {
        var roughCurrent = parseInt(player.currentTime.toString().substr(0,2));
        var roughState = parseInt(state.position.toString().substr(0,2));
        // Only STOP and SYNC if off by 2
        if (roughCurrent < roughState - 2 || roughCurrent > roughState + 2) {
          player.stop();
          player.currentTime = state.position * 1000;
          player.start();
        }
      }
    });
  }

  // Monitor synchronization pulses.
  connectSocket();

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

  /** Dom events **/
  dom.volumeSlider.change(function(){
    MIDI.setVolume(0, $(this).val());
  });
  
  // mute all connections button
  dom.muteGlobalButton.click(function(){
	var $clicked = $(this);
	if ( $clicked.hasClass('muted') ) {
	  $clicked.removeClass('muted');
	  $clicked.siblings('.tv-label').text("mute all");
	  connection.streams.unmute();
	}
	else {
	  $clicked.addClass('muted');
	  $clicked.siblings('.tv-label').text("unmute all");
	  connection.streams.mute();
	}
  });
  
  // mute only local connection button
  dom.muteSelfButton.click(function(){
	var $clicked = $(this);
	if ( $clicked.hasClass('muted') ) {
	  $clicked.removeClass('muted');
	  $clicked.siblings('.tv-label').text("mute self");
	  connection.streams[connection.attachStreams[0].id].unmute();
	}
	else {
	  $clicked.addClass('muted');
	   $clicked.siblings('.tv-label').text("unmute self");
	  connection.streams[connection.attachStreams[0].id].mute()
	}
  });
  
})(this);

window.lyrics = null;
var $lyrics = $('some-lyrics');
var $monitor = $('.tv-contents');
var $songTitle = $('.tv-title');

// Promise me to callback
// Fetch State.
$.getJSON('/api/playlist/state', function(state) {
  console.log(state);
  var currentSongFile = state.song;
  var startPosition = state.position;
  // if everything is going okay
  if (currentSongFile) {
    // Fetch lyrics.
    $.getJSON('/api/lyrics/' + currentSongFile, function(lyrics) {
      var template = _.template($('#lyrics').html());

      // Globalize.
      window.lyrics = lyrics;

      $('some-lyrics').html(template({ lyrics: _(lyrics) }));

      //simulatePlaying();

      $.getJSON('/api/songs/' + currentSongFile, function(song) {

        simulatePlaying(song, startPosition);
      });

    });
  }


});

function simulatePlaying(song, startPosition) {
  var startTime = Date.now();
  var start = Number(lyrics[0].playTime);
  var stop = Number(lyrics[lyrics.length-1].playTime);

  // Awesome variable name.
  var $lyrics = $('some-lyrics > a-lyric');

  // Maintain it like this for now.
  var index = 0;

  // Start at the same time.
  MIDI.loadPlugin(function () {
    // this is the language we are running in
    // this sets up the MIDI.Player and gets things going...
    player = MIDI.Player;

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

      // Compare the timing and correctly.
      if ((lyrics[index].playTime/1000) <= elapsed) {
        $lyrics[index].classList.add('active');

        // get position of active lyric
        var monitorPosition = $monitor.position()
        var activePosition = $($lyrics[index]).position();
        scrollLyrics(activePosition.top - monitorPosition.top);

        if ($lyrics[index-1]) {
          $lyrics[index-1].classList.remove('active');
          $lyrics[index-1].classList.add('retired');
        }

        // Just like papa crock taught me!
        index = index + 1;
      }

      console.log(lyrics[index].playTime/1000, elapsed);
    }, 100);

  });
}

function scrollLyrics( yPos ) {
  $lyrics.css({ 'top' : '-' + yPos + 'px' });
}

function displaySongInfo( songArray ) {
  $songTitle.html("");
  for (var i = 0; i < songArray.length; i++ ) {
	$songTitle.append(songArray[i] + '<br />');
  }
}
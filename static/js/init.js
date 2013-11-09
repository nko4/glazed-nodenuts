window.lyrics = null;
var $lyrics = $('some-lyrics');
var $monitor = $('.tv-contents');

// Fetch lyrics.
$.getJSON('/api/lyrics/twoprinc.kar', function(lyrics) {
  var template = _.template($('#lyrics').html());

  // Globalize.
  window.lyrics = lyrics;

  $('some-lyrics').html(template({ lyrics: _(lyrics) }));

  //simulatePlaying();

  $.getJSON('/api/songs/twoprinc.kar', function(song) {

    simulatePlaying(song);
  });

});

function simulatePlaying(song) {
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
    player.loadFile(song, player.start);

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

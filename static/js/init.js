window.lyrics = null;
var $lyrics = $('some-lyrics');

// Fetch lyrics.
$.getJSON('/api/lyrics', function(lyrics) {
  var template = _.template($('#lyrics').html());

  // Globalize.
  window.lyrics = lyrics;

  $('some-lyrics').html(template({ lyrics: _(lyrics) }));

  simulatePlaying();
});

function simulatePlaying() {
  var startTime = Date.now();
  var start = Number(lyrics[0].playTime);
  var stop = Number(lyrics[lyrics.length-1].playTime);

  // Awesome variable name.
  var $lyrics = $('some-lyrics > a-lyric');

  // Maintain it like this for now.
  var index = 0;

  var poller = window.setInterval(function() {
    var elapsed = (Date.now() - startTime)/1000;

    // Bail out if out of lyrics.
    if (!lyrics.length) {
      return window.clearInterval(poller);
    }

    // If the current lyric does not have a play time attribute, skip it.
    if (!lyrics[index].playTime) {
      index = index + 1;
      return;
    }

    // Compare the timing and correctly.
    if ((lyrics[index].playTime/1000) <= elapsed) {
      $lyrics[index].classList.add('active');
      
      // get position of active lyric
      var position = $($lyrics[index]).position();
      scrollLyrics(position.top);

      if ($lyrics[index-1]) {
        $lyrics[index-1].classList.remove('active');
      }

      // Just like papa crock taught me!
      index = index + 1;
    }

    console.log(lyrics[index].playTime/1000, elapsed);
  }, 100);
}

function scrollLyrics( yPos ) {
  $lyrics.css({ 'top' : '-' + yPos + 'px' });
}

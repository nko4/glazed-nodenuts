window.lyrics = null;

// Fetch lyrics.
$.getJSON('/api/lyrics', function(lyrics) {
  var template = _.template($("#lyrics").html());

  // Globalize.
  window.lyrics = lyrics;

  $("some-lyrics").html(template({ lyrics: _(lyrics) }));
});

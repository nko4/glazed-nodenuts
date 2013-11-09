// Fetch lyrics.
$.getJSON('/api/lyrics', function(lyrics) {
  var template = _.template($("#lyrics").html());

  $("some-lyrics").html(template({ lyrics: _(lyrics) }));
});

(function(window) {
  "use strict";

  $('.vote-skip').click(function() {
    $.get('/api/playlist/skip');
  });

})(this);

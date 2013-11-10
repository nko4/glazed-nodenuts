(function(window) {
  "use strict";

  $('.vote-skip').parent().click(function() {
    socket.emit('voteSkip');
  });


})(this);

(function(window) {
  "use strict";

  $('.vote-skip').click(function() {
    socket.emit('voteSkip');
  });


})(this);

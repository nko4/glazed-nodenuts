window.Clap = (function(exp) {

  function Clap(opts) {
    if (!(this instanceof Clap)) return new Clap(opts);
    opts = opts || {};
    this.samples = opts.samples || 128;
  }

  Clap.prototype.detect = function(source, ctx, cb) {
    var analyser = ctx.createAnalyser();
    analyser.fftSize = this.samples;
    analyser.smoothingTimeConstant = 0.3;

    function getAverageVolume(array) {
      var values = 0;
      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }
      return values / length;
    }

    setInterval(function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      cb(null, getAverageVolume(array));
    }, 100);

    source.connect(analyser);
    return analyser;
  };

  Clap.prototype.visual = function(source, ctx, cb) {
    var node = this.detect(source, ctx, function(err, avg) {
      // TODO: write something to handle the visualization here
    });
    return node;
  };

  return Clap;
}());

/*
How to use
navigator.getUserMedia({ audio: true }, function(stream) {
  var context = new AudioContext();
  var clap = new Clap();
  var node = clap.detect(context.createMediaStreamSource(stream), context, function(err, average) {
    console.log(average)
  });
  node.connect(context.destination);
});
*/


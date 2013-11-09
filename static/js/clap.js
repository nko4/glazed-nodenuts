window.Clap = (function(exp) {

  function Clap(opts) {
    if (!(this instanceof Clap)) return new Clap(opts);
    opts = opts || {};
    this.samples = opts.samples || 128;
  }

  Clap.prototype.detect = function(source, context, cb) {
    var analyser = context.createAnalyser();
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

    var node = context.createJavaScriptNode(2048, 1, 1);
    node.onaudioprocess = function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      cb(null, getAverageVolume(array));
    };

    source.connect(analyser);
    analyser.connect(node);
    return node;
  };

  Clap.prototype.visual = function(source, context, cb) {
    var node = this.detect(source, context, function(err, avg) {
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


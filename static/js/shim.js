navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
window.AudioContext = (window.AudioContext || window.webkitAudioContext || navigator.mozAudioContext || navigator.msAudioContext);

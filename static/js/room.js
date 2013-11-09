window.Person = (function() {

  function Person(opts) {
    if (!(this instanceof Person)) return new Person(opts);
    opts = opts || {};
    this.id = opts.id || Math.round(Math.random() * 999999999) + 999999999;
    this.name = opts.name || '???';
    this.status = opts.status || 'idontknow'; // singing | clapping | listening | idontknow
  }

  return Person;
}());

window.Controls = (function() {

  function Controls(opts) {
    if (!(this instanceof Controls)) return new Controls(opts);
    opts = opts || {};
    this.element = opts.element || $('<div/>');

    this.connection = new RTCMultiConnection();
    this.sessionStarted = false;
    this.connection.session = { audio: true };

    this.connection.openSignalingChannel = function(config) {
      var SIGNALING_SERVER = 'https://www.webrtc-experiment.com:2015/';
      //var SIGNALING_SERVER = 'https://localhost:2015/';
      var channel = config.channel || this.channel || location.hash.substr(1);
      var sender = Math.round(Math.random() * 999999999) + 999999999;

      io.connect(SIGNALING_SERVER).emit('new-channel', {
        channel: channel,
        sender: sender
      });

      var socket = io.connect(SIGNALING_SERVER + channel);
      socket.channel = channel;
      socket.on('connect', function() {
        if (config.callback) config.callback(socket);
      });

      socket.send = function(message) {
        socket.emit('message', {
          sender: sender,
          data: message
        });
      };
      socket.on('message', config.onmessage);
    };

    this.connection.onstream = function(e) {
      sessionStarted = true;
      audiosContainer.insertBefore(e.mediaElement, audiosContainer.firstChild);
      rotateAudio(e.mediaElement);
    };

    function rotateAudio(mediaElement) {
      mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
      setTimeout(function() {
        mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
      }, 1000);
    }

    this.connection.onstreamended = function(e) {
      e.mediaElement.style.opacity = 0;
      rotateAudio(e.mediaElement);
      setTimeout(function() {
        if (e.mediaElement.parentNode) {
          e.mediaElement.parentNode.removeChild(e.mediaElement);
        }
      }, 1000);
    };

    // start looking for connections
    this.connection.connect();
  }

  Controls.prototype.choices = function(person) {
    this.element.empty();
    switch (person.status) {
      case 'singing':
        this.element.append(this._createAction('clap', person));
        this.element.append(this._createAction('listen', person));
        break;
      default:
        this.element.append(this._createAction('sing', person));
        this.element.append(this._createAction('clap', person));
        this.element.append(this._createAction('listen', person));
        break;
    }
  };

  // When a user wants to sing
  Controls.prototype.onWantToSing = function(person) {
    console.log('I want to sing')
    connection.extra = {
      'session-name': 'Anonymous'
    };
    connection.open();
    person.status = 'singing';
    this.choices(person);
  };

  // When a user wants to clap
  Controls.prototype.onWantToClap = function(person) {
    console.log('I want to clap')
    connection.extra = {
      'session-name': 'Anonymous'
    };
    connection.open();
    person.status = 'clapping';
    this.choices(person);
  };

  // When a user just wants to listen
  Controls.prototype.onWantToListen = function(person) {
    console.log('I want to listen')
  };

  Controls.prototype._createAction = function(type, person, text) {
    var self = this;
    if (type === 'sing') {
      return $('<a/>')
        .attr({ href: '#' })
        .text(text || 'I want to sing')
        .on('click', function(e) {
          e.preventDefault();
          self.onWantToSing(person);
        });
    } else if (type === 'clap') {
      return $('<a/>')
        .attr({ href: '#' })
        .text(text || 'I want to clap')
        .on('click', function(e) {
          e.preventDefault();
          self.onWantToClap(person);
        });
    } else {
      return $('<a/>')
        .attr({ href: '#' })
        .text(text || 'Just Listening')
        .on('click', function(e) {
          e.preventDefault();
          self.onWantToListen(person);
        });
    }
  };

  return Controls;
}());

window.Room = (function() {

  function Room(opts) {
    if (!(this instanceof Room)) return new Room(opts);
    opts = opts || {};
    this.element = opts.element || $('<ul/>');
    this.element.addClass('room');
    this.prefix = 'person';
    this._people = Object.create(null);

    this.__defineGetter__('people', function() {
      return $.map(this.element.find('li'), function(el) {
        return this._people[$(el).attr('id')];
      }.bind(this));
    });
  }

  Room.prototype.add = function(person) {
    var li = $('<li/>');
    li.attr({
      id: this.prefix + person.id,
      title: person.name + ' - ' + person.status
    });
    li.text(person.id);
    li.identicon5({ size: 30 });
    this.element.append(li);
    this._people[this.prefix + person.id] = person;
  };

  Room.prototype.remove = function(id) {
    this.element.find('#' + this.prefix + id).remove();
    delete this._people[this.prefix + person.id];
  };

  return Room;
}());

var controls = new Controls({ element: $('#controls') });
var dude = new Person({ name: 'dude' });

controls.choices(dude);

/* Usage */
var room = new Room();
room.add(dude);
$('body').prepend(room.element);

// var peeps = room.people;
// room.remove(1234);
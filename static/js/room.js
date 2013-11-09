window.Person = (function(exp) {

  function Person(opts) {
    if (!(this instanceof Person)) return new Person(opts);
    opts = opts || {};
    this.id = opts.id || Math.round(Math.random() * 999999999) + 999999999;
    this.name = opts.name || '???';
    this.status = opts.status || 'watching'; // singing | listening | watching
  }

  return Person;
}());

window.Room = (function(exp) {

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
    li.attr('id', this.prefix + person.id);
    li.text(person.name);
    this.element.append(li);
    this._people[this.prefix + person.id] = person;
  };

  Room.prototype.remove = function(id) {
    this.element.find('#' + this.prefix + id).remove();
    delete this._people[this.prefix + person.id];
  };

  return Room;
}());

/* Usage */
var room = new Room();
room.add(new Person({
  name: 'dude',
  status: 'listening'
}));
$('body').prepend(room.element);

// var peeps = room.people;
// room.remove(1234);
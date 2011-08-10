var mongodb = require('mongodb');
var genji = require('genji').short();
var defer = genji.defer;
var Base = genji.Base;
var EventEmitter = require('events').EventEmitter;
var AsyncCollection = require('./collection').AsyncCollection;
var gridfs = require('./gridfs');
var AsyncGridStore = gridfs.AsyncGridStore;
var AsyncGridFS = gridfs.AsyncGridFS;


function Db(name, server, options) {
  var options_ = options || {};
  options_ = genji.extend({native_parser: false}, options_);
  this.db = new mongodb.Db(name, server, options_);
  this.setMaxListeners(64);
}

Db.prototype.collection = function(name, options) {
  return new AsyncCollection(this, name, options);
};

Db.prototype.gridfs = function(rootCollection) {
  return new AsyncGridFS(this, rootCollection);
};

Db.prototype.gridStore = function(filename, mode, options) {
  return new AsyncGridStore(this, filename, mode, options);
};

Db.prototype.open = function() {
    if (!this._defer_open) {
      this._defer_open = defer(function(callback) {
        if (this.db.state === 'connected') {
          callback(null, this.db);
          return;
        }
        var self = this;
        // open was called before but we haven't connect to db yet
        if (this.opened) {
          // just listen to the `connect` event
          this.once('connect', function(db) {
            callback(null, db);
          });
        } else {
          this.opened = true;
          this.db.open(function(err, db) {
            if (!err) {
              callback(null, db);
              self.emit('connect', db);
            } else {
              callback(err);
            }
          });
        }
      }, this);
    }
    return this._defer_open();
};

Db.prototype.close = function() {
  this.db.close();
};


exports.AsyncDb = Base(Db)(EventEmitter);
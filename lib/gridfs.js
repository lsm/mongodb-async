var mongodb = require('mongodb');
var GridStore = mongodb.GridStore;
var genji = require('genji').short();
var Base = genji.Base;

function AsyncGridStore(db, filename, mode, options) {
  this.db = db;
  this.filename = filename;
  this.mode = mode;
  this.options = options;
}

var AsyncGridStoreProps = {
  
  open: function() {
    var self = this;
    return this.db.open().and(function(defer, db) {
      var gridStore = new GridStore(db, self.filename, self.mode, self.options);
      gridStore.open(function(err, gs) {
        err ? defer.error(err) : defer.next(gs);
      });
    });
  },

  writeFile: function(file) {
    return this.open().and(function(defer, gs) {
      gs.writeFile(file, function(err, gs) {
        err ? defer.error(err) : defer.next(gs);
      });
    });
  },

  write: function(string) {
    return this.open().and(function(defer, gs) {
      gs.write(string, true, function(err, gs) {
        err ? defer.error(err) : defer.next(gs);
      });
    });
  },


  buildMongoObject: function() {
    return this.open().and(function(defer, gs) {
      gs.buildMongoObject(function(doc) {
        defer.next(doc, gs);
      });
    });
  },

  nthChunk: function(chunkNumber) {
    return this.open().and(function(defer, gs) {
      gs.nthChunk(chunkNumber, function(err, chunk) {
        err ? defer.error(err) : defer.next(chunk, gs);
      });
    });
  },

  read: function(length, buffer) {
    return this.open().and(function(defer, gs) {
      gs.read(length, buffer, function(err, data) {
        err ? defer.error(err) : defer.next(data, gs);
      });
    });
  },

  readlines: function(separator) {
    return this.open().and(function(defer, gs) {
      gs.readlines(separator, function(err, lines) {
        err ? defer.error(err) : defer.next(lines, gs);
      });
    });
  },

  rewind: function() {
    return this.open().and(function(defer, gs) {
      gs.rewind(function(err, gs) {
        err ? defer.error(err) : defer.next(gs);
      });
    });
  }
};


function AsyncGridFS(db, rootCollection) {
  this.db = db;
  this.rootCollection = rootCollection;
}

var AsyncGridFSProps = {

  open: function(filename, mode, options) {
    var options_ = options || {};
    options_.root = options_.root || this.rootCollection;
    return new exports.AsyncGridStore(this.db, filename, mode, options_);
  },

  read: function(filename, length, offset) {
    var options_ = {root: this.rootCollection};
    return this.db.open().and(function(defer, db) {
      GridStore.read(db, filename, length, offset, options_, function(err, data) {
        err ? defer.error(err) : defer.next(data);
      });
    });
  },

  readlines: function(filename, separator) {
    var options_ = {root: this.rootCollection};
    return this.db.open().and(function(defer, db) {
      GridStore.readlines(db, filename, separator, options_, function(err, lines) {
        err ? defer.error(err) : defer.next(lines);
      });
    });
  },

  exist: function(filename) {
    var self = this;
    return this.db.open().and(function(defer, db) {
      GridStore.exist(db, filename, self.rootCollection, function(err, existent) {
        err ? defer.error(err) : defer.next(existent);
      });
    });
  },

  list: function() {
    var self = this;
    return this.db.open().and(function(defer, db) {
      GridStore.list(db, self.rootCollection, function(err, files) {
        err ? defer.error(err) : defer.next(files);
      });
    });
  },

  unlink: function(files, options) {
    return this.db.open().and(function(defer, db) {
      GridStore.unlink(db, files, options, function(err, gs) {
        err ? defer.error(err) : defer.next(gs);
      });
    });
  }
};

exports.AsyncGridStore = Base(AsyncGridStore, AsyncGridStoreProps);
exports.AsyncGridFS = Base(AsyncGridFS, AsyncGridFSProps);
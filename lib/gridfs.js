var mongodb = require('mongodb');
var GridStore = mongodb.GridStore;
var genji = require('genji').short();

function AsyncGridStore(db, filename, mode, options) {
  this.db = db;
  // original mongodb.Db instance
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
    var self = this;
    return this.open().and(function(defer, gs) {
      gs.writeFile(file, function(err, gs) {
        err ? defer.error(err) : defer.next(self);
      });
    });
  },

  write: function(string) {
    var self = this;
    return this.open().and(function(defer, gs) {
      gs.write(string, true, function(err, gs) {
        err ? defer.error(err) : defer.next(self);
      });
    });
  },


  buildMongoObject: function() {
    return this.open().and(function(defer, gs) {
      gs.buildMongoObject(function(doc) {
        defer.next(doc);
      });
    });
  },

  nthChunk: function(chunkNumber) {
    return this.open().and(function(defer, gs) {
      gs.nthChunk(chunkNumber, function(err, chunk) {
        err ? defer.error(err) : defer.next(chunk);
      });
    });
  },

  read: function(length, buffer) {
    return this.open().and(function(defer, gs) {
      gs.read(length, buffer, function(err, data) {
        err ? defer.error(err) : defer.next(data);
      });
    });
  },

  readlines: function(separator) {
    return this.open().and(function(defer, gs) {
      gs.write(separator, function(err, lines) {
        err ? defer.error(err) : defer.next(lines);
      });
    });
  },

  rewind: function() {
    var self = this;
    return this.open().and(function(defer, gs) {
      gs.rewind(function(err, gs) {
        err ? defer.error(err) : defer.next(self);
      });
    });
  },

  exist: function(filename, rootCollection) {
    return this.db.open().and(function(defer, db) {
      GridStore.exist(db, filename, rootCollection, function(err, existent) {
        err ? defer.error(err) : defer.next(existent);
      });
    });
  },

  list: function(rootCollection) {
    return this.db.open().and(function(defer, db) {
      GridStore.list(db, rootCollection, function(err, files) {
        err ? defer.error(err) : defer.next(files);
      });
    });
  },

  unlink: function(files, options) {
    var self = this;
    return this.db.open().and(function(defer, db) {
      GridStore.unlink(db, files, options, function(err, gs) {
        err ? defer.error(err) : defer.next(self);
      });
    });
  }
};

genji.extend(AsyncGridStore.prototype, AsyncGridStoreProps);
exports.AsyncGridStore = AsyncGridStore;
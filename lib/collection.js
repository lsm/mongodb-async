var genji = require('genji').short();
var Base = genji.Base;

function AsyncCollection(db, name, options) {
    this.db = db;
    this.name = name;
    this.options = options || {};
}

var AsyncCollectionProps = {
  
  open: function() {
    var self = this;
    return this.db.open().and(function(defer, db) {
      db.collection(self.name, self.options, function(err, coll) {
        err ? defer.error(err) : defer.next(coll);
      });
    });
  },

  insert: function (docs, options) {
    return this.open().and(function(defer, coll) {
      coll.insert(docs, options || {}, function(err, docs) {
        err ? defer.error(err) : defer.next(docs);
      });
    });
  },

  save: function (doc, options) {
    return this.open().and(function(defer, coll) {
      coll.save(doc, options || {}, function(err, saved) {
        err ? defer.error(err) : defer.next(saved);
      });
    });
  },

  update: function (query, update, options) {
    return this.open().and(function(defer, coll) {
      coll.update(query, update, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  remove: function(query, options) {
    return this.open().and(function(defer, coll) {
      coll.remove(query, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  rename: function(newName) {
    return this.open().and(function(defer, coll) {
      coll.rename(newName, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  findEach: function(query, options) {
    return this.open().and(function(defer, coll) {
      coll.find(query || {}, options || {}, function(err, cursor) {
        err ? defer.error(err) : defer.next(cursor);
      });
    });
  },

  find: function(query, options) {
    return this.findEach(query, options).and(function(defer, cursor) {
      cursor.toArray(function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  findOne: function(query, options) {
    return this.open().and(function(defer, coll) {
      coll.findOne(query || {}, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  findAndModify: function(query, sort, update, options) {
    return this.open().and(function(defer, coll) {
      coll.findAndModify(query, sort || [], update, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  count: function(query) {
    return this.open().and(function(defer, coll) {
      coll.count(query, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  distinct: function(key, query) {
    return this.open().and(function(defer, coll) {
      coll.distinct(key, query, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  createIndex: function(fieldOrSpec, options) {
    return this.open().and(function(defer, coll) {
      coll.createIndex(fieldOrSpec, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  ensureIndex: function(fieldOrSpec, options) {
    return this.open().and(function(defer, coll) {
      coll.ensureIndex(fieldOrSpec, options || {}, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  getIndexes: function() {
    return this.open().and(function(defer, coll) {
      coll.indexInformation(function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  drop: function() {
    return this.open().and(function(defer, coll) {
      coll.drop(function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  dropIndex: function(name) {
    return this.open().and(function(defer, coll) {
      coll.dropIndex(name, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  dropIndexes: function() {
    return this.open().and(function(defer, coll) {
      coll.dropIndexes(function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  mapReduce: function(map, reduce, options) {
    return this.open().and(function(defer, coll) {
      coll.mapReduce(map, reduce, options, function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  }
};

exports.AsyncCollection = Base(AsyncCollection, AsyncCollectionProps);
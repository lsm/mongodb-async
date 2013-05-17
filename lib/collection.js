var genji = require('genji');
var extend = genji.extend;
var Klass = genji.Klass;

function AsyncCollection(db, name, options) {
    this.db = db;
    this.name = name;
    this.options = options || {};
}

var AsyncCollectionProps = {
  
  open: function() {
    var self = this;
    return this.db.open().and(function(defer, db) {
      if (self.collection) {
        defer.next(self.collection);
        return;
      }
      db.collection(self.name, self.options, function(err, coll) {
        self.collection = coll;
        err ? defer.error(err) : defer.next(coll);
      });
    });
  },

  insert: function (docs, options) {
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.insert(docs, extend({}, self.options, options), function(err, docs) {
        err ? defer.error(err) : defer.next(docs);
      });
    });
  },

  save: function (doc, options) {
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.save(doc, extend({}, self.options, options), function(err, saved) {
        err ? defer.error(err) : defer.next(saved);
      });
    });
  },

  update: function (query, update, options) {
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.update(query, update, extend({}, self.options, options), function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  remove: function(query, options) {
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.remove(query, extend({}, self.options, options), function(err, result) {
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
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.findAndModify(query, sort || [], update, extend({}, self.options, options), function(err, result) {
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
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.createIndex(fieldOrSpec, extend({}, self.options, options), function(err, result) {
        err ? defer.error(err) : defer.next(result);
      });
    });
  },

  ensureIndex: function(fieldOrSpec, options) {
    var self = this;
    return this.open().and(function(defer, coll) {
      coll.ensureIndex(fieldOrSpec, extend({}, self.options, options), function(err, result) {
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
  },

  nextId:function (idName, min, max) {
    return this.open().and(function (defer, coll) {
      var inc = min || 1;
      if (!isNaN(max) && min < max) {
        inc =  Math.floor(Math.random() * (max - min + 1)) + min;
      }
      coll.findAndModify({_id: idName}, [], {$inc: {value: inc}}, {safe: true, upsert: true, 'new': true}, function(err, result) {
          err ? defer.error(err) : defer.next(result.value);
        });
    });
  }
};

exports.AsyncCollection = Klass(AsyncCollection, AsyncCollectionProps);
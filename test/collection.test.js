var connect = require('../index').connect;
var assert = require('assert');


var server = connect('127.0.0.1', 27017, {poolSize: 2});
var db = server.db('test_mongodb_async');
var testColl = db.collection('test', {});

function dumpFailure(err) {
  console.error(err.stack || err);
}

var removeCount = 0;
function removeDocBySelector(defer, selector) {
  if (selector) {
    testColl.remove(selector, {safe: true})
    .and(function (defer, removedCount) {
      if (++removeCount >= 6) db.close();
    }).fail(defer.error);
  } else {
    if (++removeCount >= 6) db.close();
  }
}

exports['test CRUD'] = function() {
  var time = (new Date).getTime() + '_crud';

  testColl.insert({x: time}, {safe: true})
    .and(function(defer, result) {
      assert.eql(time, result[0].x);
      return true;
    })
    .and(function(defer, result) {
      testColl.findOne({x: time})
        .and(function(innerDefer, doc) {
          assert.eql(doc.x, result[0].x);
          defer.next(doc);
        }).fail(defer.error);
    })
    .and(function(defer, found) {
      testColl.update({_id: found._id}, {$set: {x: 1}}, {safe: true})
        .and(function(innerDefer, updatedCount) {
          assert.eql(1, updatedCount);
          defer.next({_id: found._id});
        })
        .fail(defer.error);
    })
    .and(removeDocBySelector)
    .fail(dumpFailure);
};

exports['test save'] = function() {
  var time = (new Date).getTime() + '_save';

  function saveUpdateAndDelete(outerDefer, doc) {
    doc.x = 3;
    testColl.save(doc, {safe: true})
      .and(function(defer, count) {
        assert.eql(1, count);
        testColl.find(doc)
          .and(function(innerDefer, docs) {
            assert.eql(1, docs.length);
            assert.eql(3, docs[0].x);
            defer.next({_id: docs[0]._id});
          }).fail(outerDefer.error);
      })
      .and(removeDocBySelector)
      .fail(outerDefer.error);
  }

  testColl.save({x: time}, {safe: true})
    .and(function(defer, doc) {
      assert.eql(time, doc.x);
      return true;
    })
    .and(saveUpdateAndDelete)
    .fail(dumpFailure);
};

exports['test findAndModify'] = function() {
  var time = (new Date).getTime() + '_findAndModify';

  testColl.insert({x: time}, {safe: true})
    .and(function(defer, docs) {
      testColl.findAndModify({x: time}, [], {x: 4}, {'new': true})
        .and(function(innerDefer, modifiedDoc) {
          assert.eql(4, modifiedDoc.x);
          defer.next({_id: modifiedDoc._id});
        })
        .fail(defer.error);
    })
    .and(removeDocBySelector)
    .fail(dumpFailure);
};

exports['test count'] = function() {
  var time = (new Date).getTime() + '_count';
  var docs = [{x: time}, {x: time}, {x: time}];
  testColl.insert(docs, {safe: true})
    .and(function(defer, insertedDocs) {
      assert.eql(3, insertedDocs.length);
      testColl.count({x: time})
        .then(function(docsCount) {
          assert.eql(3, docsCount);
          defer.next({x: time});
        })
        .fail(defer.error);
    })
    .and(removeDocBySelector)
    .fail(dumpFailure);
};

exports['test events'] = function() {
  var error;
  testColl.db.on('fail', function(err) {
    error = err;
    assert.eql(true, err instanceof Error);
  });
  testColl.update({x: 1}, {$set: 1}, {safe: true}).then(
    function(updated) {
      assert.eql(1, 2); // should not be called
    }).fail(function(err) {
      // event emitted earlier than `fail`
      assert.eql(err, error);
      removeDocBySelector({});
    });
};

exports['test nextId'] = function () {
  testColl
    .nextId('testAutoIncrementalId', 2567)
    .and(function (defer, id) {
      assert.eql(id, 2567);
      defer.next();
    })
    .and(function (defer) {
      testColl
        .nextId('testAutoIncrementalId', 3)
        .and(function (d, id) {
          assert.eql(id, 2570);
          defer.next();
        });
    })
    .and(function (defer) {
      testColl.nextId('testAutoIncrementalId', 10, 20)
        .then(function (id) {
          assert.eql(true, id >= 2580);
          assert.eql(true, id <= 2590);
          defer.next();
        }).fail(dumpFailure);
    })
    .and(function (defer) {
      removeDocBySelector(defer, {_id: 'testAutoIncrementalId'});
    })
    .fail(dumpFailure);
};
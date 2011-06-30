var connect = require('mongodb-async').connect;
var assert = require('assert');


var server = connect('127.0.0.1', 27017, {poolSize: 2});
var db = server.db('test_mongodb_async', {});
var testColl = db.collection('test', {});

function dumpFailure(err) {
  console.error(err.stack || err);
}

exports['test CRUD'] = function() {
  var time = (new Date).getTime() + '';

  testColl.insert({x: time}, {safe: true})
      .and(function(defer, result) {
        assert.eql(time, result[0].x);
        return true; // equal to defer.next(result)
      })
      .and(function(defer, inserted) {
        testColl.findOne({x: time}).and(
            function(innerDefer, doc) {
              assert.eql(doc.x, inserted[0].x);
              defer.next(doc);
            }).fail(defer.error);
      })
      .and(function(defer, found) {
        testColl.update({_id: found._id}, {$set: {x: 1}}, {safe: true})
            .and(function(innerDefer, updatedCount) {
              assert.eql(1, updatedCount);
              defer.next(found._id);
            });
      })
      .and(function(defer, idToRemove) {
        testColl.remove({_id: idToRemove}, {safe: true})
            .and(function (defer, removedCount) {
              assert.eql(1, removedCount);
              db.close();
            })
      })
      .fail(dumpFailure);
};


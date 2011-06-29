## Quick start

`git clone git://github.com/zir/mongodb-async.git mongodb-async`

`cd mongodb-async`

`node test/quick.test.js`

usage:

    var connect = require('../index').connect;
    var server = connect('127.0.0.1', 27017, {});
    var db = server.db('test', {});
    var testColl = db.collection('test', {});

    function dumpFailure(err) {
      console.error(err.stack || err);
    }

    var time = (new Date).getTime() + '';

    testColl.insert({x: time})
    .and(function(defer, result) {
      console.log('document saved');
      return true; // equal to defer.next(result)
    })
    .and(function(defer, inserted) {
      testColl.findOne({x: time}).and(
          function(defer, doc) {
            console.log('found: %s', doc.x === inserted[0].x);
          }).fail(defer.error);
    })
    .fail(dumpFailure);

    

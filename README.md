## Quick start

### Installation

`npm install mongodb-async`

### Usage

#### Syntax
Basically you can write any mongodb operation in this way:

    myCollection
      .cmd(arg1, arg2, ...)
      .and(callback1)
      .and(callback2, callback3, callback4)
      .fail(errorHandler)
      .done(finishHandler);

Where `cmd` could be:

`open`, `insert`, `save`, `update`, `remove`, `rename`, `findEach`, `find`, `findOne`, `findAndModify`, `count`, `distinct`, `createIndex`, `ensureIndex`, `getIndexes`, `drop`, `dropIndex`, `dropIndexes`, `mapReduce`

#### Example
Let's see some real example

Require `mongodb-async`, there is only one entry point `connect`

    var connect = require('mongodb-async').connect;

Connect to a `server` choose your `db` and `collection`

    var server = connect('127.0.0.1', 27017);
    var db = server.db('test_mongodb_async');
    var testCollection = db.collection('test');

Yes, you can write it in this way:

    var testCollection = connect('127.0.0.1', 27017).db('test_mongodb_async').collection('test');


Make some data

    var doc = {x: (new Date).getTime() + ''};

Let's insert it:

    var deferred = testCollection.insert(doc, {safe: true});

the `onDocSaved` function will be called when `doc` saved successfully

    deferred
      .and(function onDocSaved(defer, result) {
        console.log('document saved');
        console.log(result);
        return true;
        // `return true` is equal to `defer.next(result)`, see below
      });

There're 2 ways you can make the deferred callbacks chain going to next step

1. just return `true`, and all arguments received in current step would be passed to next step without modification.

2. call `defer.next({x: 'modified'})` if you want to modify data or your operation is async.

If error happens just call `defer.error(yourErrorObj)`.


Find the inserted document:

    deferred
      .and(function findDoc(outerDefer, result) {

        // Since you `return true` in previous step, the `result` passed to you here untouched.

        testCollection
          .findOne({x: doc.x})
          .and(function(innerDefer, docFound) {
            console.log('found: %s', docFound.x === result[0].x);
          })
          .fail(outerDefer.error);
          
      });
      
If you have another async operation inside,
you can use `.fail(outerDefer.error)` to route the error to `outerDefer`'s error handling function.
Thus you can handle error in just one place

Register error handling function like this

    deferred.fail(function dumpFailure(err) {
      console.error(err.stack || err);
    });


Here is the above example without comments:

    var connect = require('mongodb-async').connect;
    var testCollection = connect('127.0.0.1', 27017).db('test_mongodb_async').collection('test');

    var doc = {x: (new Date).getTime() + ''};
    
    var deferred = testCollection.insert(doc, {safe: true})
      .and(function onDocSaved(defer, result) {
        console.log('document saved');
        console.log(result);
        return true;
      })
      .and(function findDoc(outerDefer, result) {
        testCollection
          .findOne({x: doc.x})
          .and(function(innerDefer, docFound) {
            console.log('found: %s', docFound.x === result[0].x);
          })
          .fail(outerDefer.error);
      })
      .fail(function dumpFailure(err) {
        console.error(err.stack || err);
      });
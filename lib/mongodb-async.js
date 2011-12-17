var mongodb = require('mongodb');
var AsyncDb = require('./db').AsyncDb;


exports.connect = function(host, port, serverOptions) {
  if (typeof port !== 'number') {
    port = parseInt(port, 10);
  }
  return new Server(host, port, serverOptions);
};

function Server(host, port, options) {
  this.server = new mongodb.Server(host, port, options);
}

Server.prototype.db = function(name, options) {
  return new AsyncDb(name, this.server, options);
};

exports.mongodb = mongodb;
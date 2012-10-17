var mongodb = require('mongodb');
var ReadPreferencePrototype = require('./read_preference').ReadPreferencePrototype;
var ReadPreference = mongodb.ReadPreference;
var AsyncDb = require('./db').AsyncDb;

exports.mongodb = mongodb;

exports.connect = function (host, port, options) {
  if (typeof port !== 'number') {
    port = parseInt(port, 10);
  }
  return new Connection('server', {host: host, port: port}, options);
};

exports.replset = function (servers, options) {
  return new Connection('replset', servers, options);
};

exports.mongos = function (servers, options) {
  return new Connection('mongos', servers, options);
};

/**
 * Constructor for different type of servers
 * @param type
 * @param servers
 * @param options
 * @constructor
 */
function Connection(type, servers, options) {
  var servers_ = [];
  options || (options = {});
  switch (type) {
    case 'replset':
      servers.forEach(function (server) {
        servers_.push(new mongodb.Server(server.host, server.port, server.options || options));
      });
      this.server = new mongodb.ReplSet(servers_);
      break;
    case 'mongos':
      options.hasOwnProperty('auto_reconnect') || (options.auto_reconnect = true);
      servers.forEach(function (server) {
        servers_.push(new mongodb.Server(server.host, server.port, server.options || options));
      });
      this.server = new mongodb.Mongos(servers_);
      break;
    default:
      this.server = new mongodb.Server(servers.host, servers.port, options);
  }
  // default read preferrence is PRIMARY only
  this.readPreference = ReadPreference.PRIMARY;
}

Connection.prototype = ReadPreferencePrototype;

Connection.prototype.db = function (name, options) {
  options || (options = {});
  options.tags || (options.tags = this.tags);
  options.readPreference || (options.readPreference = this.readPreference);
  options._connection = this;
  return new AsyncDb(name, this.server, options);
};
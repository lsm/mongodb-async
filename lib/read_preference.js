var mongodb = require('mongodb');
var ReadPreference = mongodb.ReadPreference;

exports.ReadPreferencePrototype = {
  primaryFirst: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.PRIMARY_PREFERRED;
    return this;
  },

  primaryOnly: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.PRIMARY;
    return this;
  },

  secondaryFirst: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.SECONDARY_PREFERRED;
    return this;
  },

  secondaryOnly: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.SECONDARY;
    return this;
  },

  nearest: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.NEAREST;
    return this;
  }
};
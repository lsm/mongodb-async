exports.ReadPreferencePrototype = {
  primaryFirst: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.PRIMARY_PREFERRED;
  },

  primaryOnly: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.PRIMARY;
  },

  secondaryFirst: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.SECONDARY_PREFERRED;
  },

  secondaryOnly: function (tags) {
    this.tags = tags;
    this.readPreference = ReadPreference.SECONDARY;

  },

  nearest: function () {
    this.tags = tags;
    this.readPreference = ReadPreference.NEAREST;
  }
};
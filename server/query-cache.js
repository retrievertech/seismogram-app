var cache = {
  on: true,
  cache: {},
  key: function(query) {
    return ["dateFrom", "dateTo", "status", "edited", "stationIds", "page", "fileNames"]
      .map(function(field) { return query[field]; }).join("_");
  },
  hit: function(query) {
    return this.on ? this.cache[this.key(query)] : null;
  },
  put: function(query, payload) {
    var key = this.key(query);
    this.cache[key] = payload;
  },
  forEachFile: function(callback) {
    for (var key in this.cache) {
      var query = this.cache[key];
      for (var i = 0; i < query.files.length; ++i) {
        callback(query.files[i]);
      }
    }
  }
};

module.exports = cache;

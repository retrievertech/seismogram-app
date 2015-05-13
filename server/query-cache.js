var cache = {
  on: true,
  cache: {},
  key: function(query) {
    return ["dateFrom", "dateTo", "status", "edited", "stationIds", "page"]
      .map(function(field) { return query[field]; }).join("_");
  },
  hit: function(query) {
    return this.on ? this.cache[this.key(query)] : null;
  },
  put: function(query, payload) {
    var key = this.key(query);
    this.cache[key] = payload;
  }
};

module.exports = cache;

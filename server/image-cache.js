var fs = require("fs");
var Image = require("canvas").Image;

function localPath(filename) {
  return __dirname + "/local-file-cache/" + filename;
}

var cache = {
  data: [],

  find: function(filename) {
    for (var i = 0; i < this.data.length; ++i) {
      if (this.data[i].filename === filename) {
        return this.data[i];
      }
    }
    return null;
  },

  hit: function(filename) {
    var item = this.find(filename);

    if (!item) {
      console.time("readFile");
      var file = fs.readFileSync(localPath(filename));
      console.timeEnd("readFile");

      console.time("convertToImage");
      var img = new Image();
      img.src = file;
      console.timeEnd("convertToImage");

      item = {
        filename: filename,
        time: Date.now(),
        img: img
      };

      this.data.push(item);
    } else {
      // the item is in the cache.
      // update the access timestamp
      item.time = Date.now();
    }

    // eject the oldest item from memory when we reach
    // 15 elements in the cache
    if (this.data.length > 3) {
      this.data.sort(function(a, b) {
        return b.time - a.time;
      });
      this.data.pop();
    }

    console.log("cache size", this.data.length);

    return item.img;
  }
};

module.exports = cache;
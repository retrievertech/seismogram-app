var fs = require("fs");
var exec = require("child_process").exec;
var escape = require("./util").escape;
var async = require("async");

function localPath(filename) {
  return __dirname + "/local-file-cache/" + filename;
}

// This object maintains a map of filenames to lists of buffered requests.
// When a file is loading from s3, any incoming requests for tiles will
// be buffered in this object. Once the file is done copying from s3, the
// requests are processed in bulk.
var bufferedRequests = {};

// No more than this number of files are allowed to be saved locally.
// (Prevents server from running out of disk space.)
var MAX_LOCAL_FILES = 10;
var DELETE_IN_PROGRESS = false;

function deleteOldFiles(cb) {
  if (DELETE_IN_PROGRESS) {
    if (typeof cb === "function") {
      cb(null);
      return;
    }
  }

  DELETE_IN_PROGRESS = true;

  var filenames = fs
    .readdirSync(localPath(""))
    .filter(function(filename) {
      return new RegExp(/.*\.png/).test(filename);
    });

  console.log(filenames.length, "files in local-file-cache");

  // There's room for more files; carry on
  if (filenames.length < MAX_LOCAL_FILES) {
    if (typeof cb === "function") {
      cb(null);
      return;
    }
  }

  var numFilesToDelete = filenames.length - MAX_LOCAL_FILES + 1;
  console.log("deleting", numFilesToDelete, "files");

  var fullPaths = filenames.map(function(filename) {
    return localPath(filename);
  });

  async.map(fullPaths, fs.stat, function(err, results) {
    if (err) console.log(err);
    
    // insert filenames into fs.stat results
    results.forEach(function(info, idx) {
      info.path = fullPaths[idx];
    });

    // delete oldest files first
    results.sort(function(fileA, fileB) {
      return fileA.mtime.getTime() - fileB.mtime.getTime();
    });

    var pathsToDelete = results
      .slice(0, numFilesToDelete)
      .map(function(file) { return file.path });

    async.map(pathsToDelete, fs.unlink, function(err) {
      DELETE_IN_PROGRESS = false;
      if (err) console.log(err);
      if (typeof cb === "function") {
        cb(null);
        return;
      }
    });
  });
}

function ensureFileIsLocal(filename, cb) {
  var path = localPath(filename);

  if (fs.existsSync(path) && !(filename in bufferedRequests)) {
    console.log("file exists", path);
    // file is already local
    cb(null);
  } else {
    // file is on s3
    console.time("s3fetch");

    if (!bufferedRequests[filename]) {
      // this is the first request for this file; create an object that will
      // buffer subsequent requests.
      bufferedRequests[filename] = [];

      deleteOldFiles(function() {

        var command = "aws s3 cp s3://WWSSN_Scans/" + filename + " --region us-east-1 " + escape(path);

        if (process.env.NODE_ENV !== "production") {
          command = "wget http://s3.amazonaws.com/WWSSN_Scans/" + filename + " -O " + escape(path);
        }

        console.log(command);

        exec(command, function(err) {
          console.timeEnd("s3fetch");

          if (err) {
            console.log("error copying file", err);
            return;
          }

          console.log("processing", bufferedRequests[filename].length, "buffered requests");

          // the file's been copied locally, now process all the buffered requests
          bufferedRequests[filename].forEach(function(requestCallback) {
            requestCallback(err);
          });

          // this entry is no longer needed; since the file is now local,
          // there will be no more buffering
          delete bufferedRequests[filename];
        });

      });
    }

    // buffer this request for processing when the copy from s3 is done.
    bufferedRequests[filename].push(cb);
  }
}

module.exports = {
  localPath: localPath,
  ensureFileIsLocal: ensureFileIsLocal
};

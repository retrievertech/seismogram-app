var express = require("express");
var cors = require("cors");
var app = express();

var queryRoutes = require("./query-routes");
var tileRoutes = require("./tile-routes");

app.use("/", queryRoutes);
app.use("/tiles", tileRoutes);

app.use(cors());
app.use(function(err, req, res, next) {
  console.error(err);
  next(err);
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at %s:%s", host, port);
});

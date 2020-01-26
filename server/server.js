var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();

//var statusSocket = require("./status-socket");
var auth = require("./auth");
var queryRoutes = require("./query-routes");
var tileRoutes = require("./tile-routes");
var processingRoutes = require("./processing-routes");

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());
app.use("/query", queryRoutes);
app.use("/tiles", tileRoutes);
app.use("/processing", processingRoutes);

app.use(function(err, req, res, next) {
  console.error(err);
  next(err);
});

// Simple route for checking auth. Note: all routes are authorized individually.
app.get("/login", auth, function(req, res) {
  res.sendStatus(200);
});

var server = http.createServer(app);
server.timeout = 0;
//statusSocket.run(server);
server.listen(3010, function() {
  var host = server.address().address;
  var port = server.address().port;
  var mode = process.env.NODE_ENV || "dev";
  console.log('Seismo app listening in %s mode at http://%s:%s', mode, host, port);
});

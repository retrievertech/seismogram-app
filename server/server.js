var http = require("http");
var express = require("express");
var cors = require("cors");
var app = express();
var statusSocket = require("./status-socket");

var queryRoutes = require("./query-routes");
var tileRoutes = require("./tile-routes");
var processingRoutes = require("./processing-routes");

app.use(cors());
app.use("/query", queryRoutes);
app.use("/tiles", tileRoutes);
app.use("/processing", processingRoutes);

app.use(function(err, req, res, next) {
  console.error(err);
  next(err);
});

var server = http.createServer(app);
statusSocket.run(server);
server.listen(3000);

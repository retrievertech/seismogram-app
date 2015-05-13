var socketIO = require("socket.io");

var openSockets = [];

function run(server) {
  var io = socketIO.listen(server);

  io.on("connection", function(socket) {
    console.log("connect");
    openSockets.push(socket);

    socket.on("disconnect", function() {
      console.log("disconnect");
      openSockets.splice(openSockets.indexOf(socket), 1);
    });
  });
}

function broadcast(key, obj) {
  openSockets.forEach(function(socket) {
    socket.emit(key, obj);
  });
}

module.exports = {
  run: run,
  broadcast: broadcast
};

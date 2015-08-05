var basicAuth = require("basic-auth");

var username = "seismo";
var pass = "redfish32";

module.exports = function (req, res, next) {
  function unauthorized(res) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    return res.sendStatus(401);
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name.toLowerCase() === username && user.pass.toLowerCase() === pass) {
    return next();
  } else {
    return unauthorized(res);
  }
};

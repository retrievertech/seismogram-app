export var Auth = {
  auth: {},

  load: function(cb) {
    window.localforage.getItem("auth").then((v) => {
      this.auth = v;
      cb();
    }).catch(cb);
  },

  store: function(auth) {
    this.auth = auth;
    console.log("stored", auth);
    return window.localforage.setItem("auth", auth);
  }
};

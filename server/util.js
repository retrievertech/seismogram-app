module.exports = {
  escape: function(cmd) {
    return cmd.replace(/(["\s'$`\\])/g,"\\$1");
  }
};

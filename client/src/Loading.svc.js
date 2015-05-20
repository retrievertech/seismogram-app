class Loading {

  constructor($timeout) {
    this.$timeout = $timeout;
    this.messages = [];
  }

  active() {
    return this.messages.length > 0;
  }

  start(message) {
    if (this.messages.indexOf(message) === -1) {
      this.messages.push(message);
    }
  }

  stop(message) {
    var idx = this.messages.indexOf(message);
    if (idx >= 0) {
      this.messages.splice(idx, 1);
    }
  }
}

export { Loading };

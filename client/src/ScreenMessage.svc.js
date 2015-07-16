//
// Message that pops in the middle of the screen. Can display multiple messages and
// ephemeral messages that disappear after some amount of time has elapsed.
//
export class ScreenMessage {

  constructor($timeout) {
    this.$timeout = $timeout;
    this.messages = [];
  }

  any() {
    return this.messages.length > 0;
  }

  active(type = "loading") {
    var loading = this.messages.filter((msg) => msg.type === type);
    return loading.length > 0;
  }

  start(name, type = "loading") {
    var msg = this.messages.find((msg) => msg.name === name);

    if (!msg) {
      this.messages.push({
        type: type,
        name: name
      });
    }
  }

  stop(name) {
    var msg = this.messages.find((msg) => msg.name === name);
    if (msg) {
      var idx = this.messages.indexOf(msg);
      this.messages.splice(idx, 1);
    }
  }

  ephemeral(name, type = "loading", time = 1000) {
    this.start(name, type);
    this.$timeout(() => this.stop(name), time);
  }

  reset() {
    this.messages.length = 0;
  }
}

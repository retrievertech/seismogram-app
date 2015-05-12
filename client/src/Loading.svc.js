class Loading {

  constructor() {
    this.loading = false;
    this.defaultMessage = "Loading...";
    this.message = this.defaultMessage;
  }

  start(message) {
    if (message) {
      this.message = message;
    }

    this.loading = true;
  }

  stop() {
    this.loading = false;
    this.message = this.defaultMessage;
  }
}

export { Loading };

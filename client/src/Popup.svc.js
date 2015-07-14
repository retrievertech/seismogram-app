class Popup {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.visible = false;
    this.message = "";
    this.currentYesCb = null;
    this.currentNoCb = null;
  }

  // called when clicking "yes"
  yes() {
    this.visible = false;
    this.currentYesCb();
  }

  // fired when clicking "no"
  no() {
    this.visible = false;
    this.currentNoCb();
  }

  // Open the popup and save the two callbacks. Invoke one of them depending
  // on how the user responds in the UI.
  open(message, yesCb, noCb) {
    this.message = message;
    this.visible = true;
    this.currentYesCb = yesCb;
    this.currentNoCb = noCb;
    // Hack: force the UI to refresh
    this.$timeout(() => {});
  }
}

export { Popup };

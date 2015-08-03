//
// A service driving a popup that appears on the screen with Yes/No choices. Each
// choice is assigned a callback that is invoked when the user clicks the respective
// button.
//
class Popup {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.visible = false;
    this.message = "";
    this.currentYesCb = null;
    this.currentNoCb = null;
  }

  close() {
    this.visible = false;
    this.message = "";
    this.currentYesCb = null;
    this.currentNoCb = null;
    this.$timeout(() => {});
  }

  // called when clicking "yes"
  yes() {
    if (typeof this.currentYesCb === "function") {
      this.currentYesCb();
    }
    this.close();
  }

  // fired when clicking "no"
  no() {
    if (typeof this.currentNoCb === "function") {
      this.currentNoCb();
    }
    this.close();
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

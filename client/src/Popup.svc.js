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
    this.$timeout(() => {
      this.visible = false;
      this.message = "";
      this.currentYesCb = null;
      this.currentNoCb = null;
    });
  }

  // called when clicking "yes"
  yes() {
    var yesCb = this.currentYesCb;
    this.close();
    if (typeof yesCb === "function") {
      yesCb();
    }
  }

  // fired when clicking "no"
  no() {
    var noCb = this.currentNoCb();
    this.close();
    if (typeof noCb === "function") {
      noCb();
    }
  }

  // Open the popup and save the two callbacks. Invoke one of them depending
  // on how the user responds in the UI.
  open(message, yesCb, noCb) {
    this.$timeout(() => {
      this.message = message;
      this.visible = true;
      this.currentYesCb = yesCb;
      this.currentNoCb = noCb;
    });
  }
}

export { Popup };

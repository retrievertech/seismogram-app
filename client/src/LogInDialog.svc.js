import { Auth } from "./Auth.js";

export class LogInDialog {
  
  constructor($rootScope, ScreenMessage) {
    this.Auth = Auth;

    this.$rootScope = $rootScope;
    this.ScreenMessage = ScreenMessage;

    this.username = "";
    this.password = "";

    this.visible = false;
  }

  logIn() {
    this.Auth.store({
      username: this.username,
      password: this.password
    });

    this.$rootScope.checkLogin().then(() => {
      if (!this.$rootScope.loggedIn) {
        this.ScreenMessage.ephemeral("Invalid credentials.", "error", 5000);
      } else {
        this.visible = false;
      }
    });
  }

  logOut() {
    this.Auth.remove().then(() => this.$rootScope.checkLogin());
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

}

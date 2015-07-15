import { Main } from "./Main.ctrl.js";

export var Setup = {
  declare: () => {},
  installRoutes: (routeProvider) => {
    routeProvider.when("/", {
      templateUrl: "src/main/main.html",
      controller: Main
    });
  }
};

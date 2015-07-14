import { SeismoMain } from "./SeismoMain.ctrl.js";

export var Setup = {
  declare: () => {},
  installRoutes: (routeProvider) => {
    routeProvider.when("/", {
      templateUrl: "src/main/main.html",
      controller: SeismoMain
    });
  }
};

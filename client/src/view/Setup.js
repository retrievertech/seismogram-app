import { SeismoView } from "./SeismoView.ctrl.js";

export var Setup = {
  declare: () => {},
  installRoutes: (routeProvider) => {
    routeProvider.when("/view/:filename", {
      templateUrl: "src/view/view.html",
      controller: SeismoView
    });
  }
};

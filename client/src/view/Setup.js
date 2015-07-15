import { View } from "./View.ctrl.js";

export var Setup = {
  declare: () => {},
  installRoutes: (routeProvider) => {
    routeProvider.when("/view/:filename", {
      templateUrl: "src/view/view.html",
      controller: View
    });
  }
};

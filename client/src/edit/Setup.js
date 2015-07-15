import { SeismoEdit } from "./SeismoEdit.ctrl.js";
import { MeanLinesEditor } from "./MeanLinesEditor.svc.js";

export var Setup = {
  declare: (app) => {
    app.service("MeanLinesEditor", MeanLinesEditor);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/edit/:filename", {
      templateUrl: "src/edit/edit.html",
      controller: SeismoEdit
    });
  }
};

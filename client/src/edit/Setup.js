import { SeismoEdit } from "./SeismoEdit.ctrl.js";
import { SeismoEditor } from "./SeismoEditor.svc.js";
import { MeanLinesEditor } from "./MeanLinesEditor.svc.js";

export var Setup = {
  declare: (app) => {
    app.service("SeismoEditor", SeismoEditor)
      .service("MeanLinesEditor", MeanLinesEditor);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/edit/:filename", {
      templateUrl: "src/edit/edit.html",
      controller: SeismoEdit
    });
  }
};

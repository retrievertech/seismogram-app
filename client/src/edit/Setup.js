import { SeismoEdit } from "./SeismoEdit.ctrl.js";
import { SeismoEditor } from "./SeismoEditor.svc.js";
import { MeanLinesEditor } from "./MeanLinesEditor.svc.js";
import { Popup } from "./Popup.svc.js";

export var Setup = {
  declare: (app) => {
    app.service("SeismoEditor", SeismoEditor)
      .service("MeanLinesEditor", MeanLinesEditor)
      .service("Popup", Popup);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/edit/:filename", {
      templateUrl: "src/edit/edit.html",
      controller: SeismoEdit
    });
  }
};

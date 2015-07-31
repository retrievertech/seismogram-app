import { Edit } from "./Edit.ctrl.js";
import { DataHandler } from "./DataHandler.svc.js";
import { MeanLinesEditor } from "./MeanLinesEditor.svc.js";
import { AssignmentEditor } from "./AssignmentEditor.svc.js";
import { Editor as SegmentErasureEditor } from "./segment-erasure/Editor.svc.js";
import { RectangleDiv } from "./segment-erasure/RectangleDiv.dir.js";
import { RectangleKnobDiv } from "./segment-erasure/RectangleKnobDiv.dir.js";

export var Setup = {
  declare: (app) => {
    app.service("MeanLinesEditor", MeanLinesEditor)
      .service("SegmentErasureEditor", SegmentErasureEditor)
      .service("DataHandler", DataHandler)
      .service("AssignmentEditor", AssignmentEditor)
      .directive("rectangleDiv", RectangleDiv)
      .directive("rectangleKnobDiv", RectangleKnobDiv);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/edit/:filename", {
      templateUrl: "src/edit/edit.html",
      controller: Edit
    });
  }
};

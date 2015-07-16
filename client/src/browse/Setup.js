import { Browse } from "./Browse.ctrl.js";
import { StationMap } from "./StationMap.svc.js";
import { Query } from "./Query.svc.js";
import { QueryData } from "./QueryData.svc.js";
import { ServerUrls } from "./ServerUrls.svc.js";
import { FileStatus } from "./FileStatus.svc.js";

export var Setup = {
  declare: (app) => {
    app.service("StationMap", StationMap)
      .service("Query", Query)
      .service("QueryData", QueryData)
      .service("ServerUrls", ServerUrls)
      .service("FileStatus", FileStatus);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/browse", {
      templateUrl: "src/browse/browse.html",
      controller: Browse
    });
  }
};

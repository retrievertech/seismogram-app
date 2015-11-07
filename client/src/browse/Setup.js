import { Browse } from "./Browse.ctrl.js";
import { StationMap } from "./StationMap.svc.js";
import { Query } from "./Query.svc.js";
import { QueryData } from "./QueryData.svc.js";
import { ServerUrls } from "./ServerUrls.svc.js";
import { FileStatus } from "./FileStatus.svc.js";
import { FormatStationLocation } from "./FormatStationLocation.filter.js";

export var Setup = {
  declare: (app) => {
    app.service("StationMap", StationMap)
      .service("Query", Query)
      .service("QueryData", QueryData)
      .service("ServerUrls", ServerUrls)
      .service("FileStatus", FileStatus)
      .filter("formatStationLocation", FormatStationLocation);
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/browse", {
      templateUrl: "src/browse/browse.html",
      controller: Browse
    });
  }
};

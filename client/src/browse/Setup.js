import { SeismoStationMap } from "./SeismoStationMap.svc.js";
import { SeismoBrowse } from "./SeismoBrowse.ctrl.js";
import { SeismoQuery } from "./SeismoQuery.svc.js";
import { SeismoServer } from "./SeismoServer.svc.js";
import { SeismoStatus } from "./SeismoStatus.svc.js";
import { SeismoData } from "./SeismoData.svc.js";

export var Setup = {
  declare: (app) => {
    app.service("SeismoStationMap", SeismoStationMap)
      .service("SeismoQuery", SeismoQuery)
      .service("SeismoServer", SeismoServer)
      .service("SeismoStatus", SeismoStatus)
      .service("SeismoData", SeismoData)
  },
  installRoutes: (routeProvider) => {
    routeProvider.when("/browse", {
      templateUrl: "src/browse/browse.html",
      controller: SeismoBrowse
    });
  }
};

import {Gradient} from "../bower_components/redfish-core/lib/Util/Gradient.js";

var angular = window.angular;

import { SeismoMain } from "./SeismoMain.ctrl.js";
import { SeismoStationMap } from "./map/SeismoStationMap.svc.js";
import { SeismoImageMap } from "./map/SeismoImageMap.svc.js";
import { SeismoQuery } from "./SeismoQuery.svc.js";
import { SeismoServer } from "./SeismoServer.svc.js";
import { PieOverlay } from "./map/PieOverlay.svc.js";
import { Loading } from "./Loading.svc.js";
import { SeismoTimeNubbin } from "./seismo-query-nubbins/SeismoTimeNubbin.dir.js";
import { SeismoQueryNubbins } from "./seismo-query-nubbins/SeismoQueryNubbins.dir.js";
import { SeismoData } from "./SeismoData.svc.js";
import { SeismoEditor } from "./SeismoEditor.ctrl.js";
import { MapLink } from "./map/MapLink.dir.js";

angular.module("SeismoApp", [])
  .controller("SeismoMain", SeismoMain)
  .service("SeismoStationMap", SeismoStationMap)
  .service("SeismoImageMap", SeismoImageMap)
  .service("SeismoQuery", SeismoQuery)
  .service("SeismoServer", SeismoServer)
  .service("SeismoData", SeismoData)
  .service("SeismoEditor", SeismoEditor)
  .service("PieOverlay", PieOverlay)
  .service("Loading", Loading)
  .directive("seismoTimeNubbin", SeismoTimeNubbin)
  .directive("seismoQueryNubbins", SeismoQueryNubbins)
  .directive("mapLink", MapLink)
  .run([function() {
    console.log("Seismo is running.");
  }]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["SeismoApp"]);
});

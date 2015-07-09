var angular = window.angular;

import { SeismoMain } from "./SeismoMain.ctrl.js";
import { SeismoStationMap } from "./map/SeismoStationMap.svc.js";
import { SeismoImageMap } from "./map/SeismoImageMap.svc.js";
import { SeismoQuery } from "./SeismoQuery.svc.js";
import { SeismoServer } from "./SeismoServer.svc.js";
import { SeismoStatus } from "./SeismoStatus.svc.js";
import { PieOverlay } from "./map/PieOverlay.svc.js";
import { Loading } from "./Loading.svc.js";
import { SeismoTimeNubbin } from "./seismo-query-nubbins/SeismoTimeNubbin.dir.js";
import { SeismoQueryNubbins } from "./seismo-query-nubbins/SeismoQueryNubbins.dir.js";
import { SeismoData } from "./SeismoData.svc.js";
import { SeismoEditor } from "./SeismoEditor.svc.js";
import { SeismoHistogram } from "./SeismoHistogram.svc.js";
import { MapLink } from "./map/MapLink.dir.js";

import { SeismoBrowse } from "./SeismoBrowse.ctrl.js";
import { SeismoView } from "./SeismoView.ctrl.js";
import { SeismoEdit } from "./SeismoEdit.ctrl.js";

angular.module("SeismoApp", [])
  .controller("SeismoMain", SeismoMain)
  .service("SeismoStationMap", SeismoStationMap)
  .service("SeismoImageMap", SeismoImageMap)
  .service("SeismoQuery", SeismoQuery)
  .service("SeismoServer", SeismoServer)
  .service("SeismoStatus", SeismoStatus)
  .service("SeismoData", SeismoData)
  .service("SeismoEditor", SeismoEditor)
  .service("SeismoHistogram", SeismoHistogram)
  .service("PieOverlay", PieOverlay)
  .service("Loading", Loading)
  .directive("seismoTimeNubbin", SeismoTimeNubbin)
  .directive("seismoQueryNubbins", SeismoQueryNubbins)
  .directive("mapLink", MapLink)
  .config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {
      templateUrl: "views/main.html",
      controller: SeismoMain
    });
    $routeProvider.when("/browse", {
      templateUrl: "views/browse.html",
      controller: SeismoBrowse
    });
    $routeProvider.when("/view", {
      templateUrl: "views/view.html",
      controller: SeismoView
    });
    $routeProvider.when("/edit", {
      templateUrl: "views/edit.html",
      controller: SeismoEdit
    });
  }])
  .run([function() {
    console.log("Seismo is running.");
  }]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["ngRoute", "SeismoApp"]);
});

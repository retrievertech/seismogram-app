var angular = window.angular;

import { SeismoQuery } from "./SeismoQuery.svc.js";
import { SeismoServer } from "./SeismoServer.svc.js";
import { SeismoStatus } from "./SeismoStatus.svc.js";
import { Loading } from "./Loading.svc.js";
import { SeismoData } from "./SeismoData.svc.js";
import { SeismoEditor } from "./SeismoEditor.svc.js";
import { SeismoHistogram } from "./SeismoHistogram.svc.js";

import { SeismoStationMap } from "./browse/map/SeismoStationMap.svc.js";
import { SeismoImageMap } from "./browse/map/SeismoImageMap.svc.js";
import { MapLink } from "./browse/map/MapLink.dir.js";
import { PieOverlay } from "./browse/map/PieOverlay.svc.js";
import { SeismoTimeNubbin } from "./browse/seismo-query-nubbins/SeismoTimeNubbin.dir.js";
import { SeismoQueryNubbins } from "./browse/seismo-query-nubbins/SeismoQueryNubbins.dir.js";
import { SeismoBrowse } from "./browse/SeismoBrowse.ctrl.js";

import { SeismoView } from "./view/SeismoView.ctrl.js";
import { SeismoEdit } from "./edit/SeismoEdit.ctrl.js";
import { SeismoMain } from "./main/SeismoMain.ctrl.js";

angular.module("SeismoApp", [])
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
      templateUrl: "src/main/main.html",
      controller: SeismoMain
    });
    $routeProvider.when("/browse", {
      templateUrl: "src/browse/browse.html",
      controller: SeismoBrowse
    });
    $routeProvider.when("/view", {
      templateUrl: "src/view/view.html",
      controller: SeismoView
    });
    $routeProvider.when("/edit", {
      templateUrl: "src/edit/edit.html",
      controller: SeismoEdit
    });
  }])
  .run([function() {
    console.log("Seismo is running.");
  }]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["ngRoute", "SeismoApp"]);
});

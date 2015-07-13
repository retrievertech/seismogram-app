var angular = window.angular;

import { Loading } from "./Loading.svc.js";
import { SeismoImageMap } from "./SeismoImageMap.svc.js";
import { MapLink } from "./MapLink.dir.js";

import { SeismoStationMap } from "./browse/SeismoStationMap.svc.js";
import { SeismoBrowse } from "./browse/SeismoBrowse.ctrl.js";
import { SeismoQuery } from "./browse/SeismoQuery.svc.js";
import { SeismoServer } from "./browse/SeismoServer.svc.js";
import { SeismoStatus } from "./browse/SeismoStatus.svc.js";
import { SeismoData } from "./browse/SeismoData.svc.js";

import { SeismoEdit } from "./edit/SeismoEdit.ctrl.js";
import { SeismoEditor } from "./edit/SeismoEditor.svc.js";

import { SeismoView } from "./view/SeismoView.ctrl.js";
import { SeismoMain } from "./main/SeismoMain.ctrl.js";

import { ImageMapLoader } from "./ImageMapLoader.svc.js";

angular.module("SeismoApp", [])
  .service("SeismoStationMap", SeismoStationMap)
  .service("SeismoImageMap", SeismoImageMap)
  .service("SeismoQuery", SeismoQuery)
  .service("SeismoServer", SeismoServer)
  .service("SeismoStatus", SeismoStatus)
  .service("SeismoData", SeismoData)
  .service("SeismoEditor", SeismoEditor)
  .service("Loading", Loading)
  .service("ImageMapLoader", ImageMapLoader)
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
    $routeProvider.when("/view/:filename", {
      templateUrl: "src/view/view.html",
      controller: SeismoView
    });
    $routeProvider.when("/edit/:filename", {
      templateUrl: "src/edit/edit.html",
      controller: SeismoEdit
    });
  }])
  .run(function($rootScope, $location, Loading) {
    $rootScope.Loading = Loading;
    $rootScope.go = (path) => {
      $location.path(path);
    };
    console.log("Seismo app is running");
  });

angular.element(document).ready(function() {
  angular.bootstrap(document, ["ngRoute", "SeismoApp"]);
});

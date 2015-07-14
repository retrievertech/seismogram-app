var angular = window.angular;

// Top-level / shared modules
import { Loading } from "./Loading.svc.js";
import { SeismoImageMap } from "./SeismoImageMap.svc.js";
import { ImageMapLoader } from "./ImageMapLoader.svc.js";
import { MapLink } from "./MapLink.dir.js";

// App sections
import { Setup as BrowseSetup } from "./browse/Setup.js";
import { Setup as ViewSetup } from "./view/Setup.js";
import { Setup as MainSetup } from "./main/Setup.js";
import { Setup as EditSetup } from "./edit/Setup.js";

var sections = [ BrowseSetup, ViewSetup, MainSetup, EditSetup ];

var app = angular.module("SeismoApp", []);

// Install the top-level dependencies
app.service("SeismoImageMap", SeismoImageMap)
  .service("Loading", Loading)
  .service("ImageMapLoader", ImageMapLoader)
  .directive("mapLink", MapLink);

// Each section declares its dependencies
sections.forEach((section) => section.declare(app));

// Each section installs its routes
app.config(["$routeProvider", ($routeProvider) =>
  sections.forEach((section) => section.installRoutes($routeProvider))]);

// Root controller. The function "go" is available to all scopes in all sections
app.run(function($rootScope, $location, Loading) {
  $rootScope.Loading = Loading;
  $rootScope.go = (path) => $location.path(path);
  console.log("Seismo app is running");
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ["ngRoute", "SeismoApp"]);
});

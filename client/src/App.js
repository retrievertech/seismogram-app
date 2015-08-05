var angular = window.angular;

// Top-level / shared modules
import { ScreenMessage } from "./ScreenMessage.svc.js";
import { Popup } from "./Popup.svc.js";
import { SeismogramMap } from "./SeismogramMap.svc.js";
import { SeismogramMapLoader } from "./SeismogramMapLoader.svc.js";
import { MapLink } from "./MapLink.dir.js";

// App sections
import { Setup as BrowseSetup } from "./browse/Setup.js";
import { Setup as ViewSetup } from "./view/Setup.js";
import { Setup as MainSetup } from "./main/Setup.js";
import { Setup as EditSetup } from "./edit/Setup.js";

var sections = [ BrowseSetup, ViewSetup, MainSetup, EditSetup ];

var app = angular.module("App", []);

class Auth {
  set(u, p) {
    this.username = u;
    this.password = p;
  }
}

// Install the top-level dependencies
app.service("SeismogramMap", SeismogramMap)
  .service("ScreenMessage", ScreenMessage)
  .service("SeismogramMapLoader", SeismogramMapLoader)
  .service("Popup", Popup)
  .service("Auth", Auth)
  .directive("mapLink", MapLink)
  .factory("Authorization", ($rootScope, Auth) => {
    return {
      request: (config) => {
        var u = Auth.username;
        var p = Auth.password;
        config.headers.Authorization = "Basic " + window.btoa(u + ":" + p);
        return config;
      }
    };
  });

// Each section declares its dependencies
sections.forEach((section) => section.declare(app));

// Each section installs its routes
app.config(($routeProvider, $httpProvider) => {
  sections.forEach((section) => section.installRoutes($routeProvider));
  $httpProvider.interceptors.push("Authorization");
});

// Root controller. The function "go" is available to all scopes in all sections
app.run(function($rootScope, $location, ScreenMessage, Popup) {
  window.scope = $rootScope;

  $rootScope.ScreenMessage = ScreenMessage;
  $rootScope.Popup = Popup;
  $rootScope.go = (path) => $location.path(path);

  $rootScope.range = (a,b) => {
    var arr = new Array(b - a + 1);
    for (var v = a, i = 0; v <= b; ++i, ++v) {
      arr[i] = v;
    }
    return arr;
  };

  console.log("Seismo app is running");
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ["ngRoute", "App"]);
});

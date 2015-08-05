var angular = window.angular;

import { Auth } from "./Auth.js";

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

// Install the top-level dependencies
app.service("SeismogramMap", SeismogramMap)
  .service("ScreenMessage", ScreenMessage)
  .service("SeismogramMapLoader", SeismogramMapLoader)
  .service("Popup", Popup)
  .directive("mapLink", MapLink)
  .factory("Authorization", ($location, $q, ServerUrls) => {
    return {
      request: (config) => {
        // We only put auth headers on node server requests
        if (!config.url.startsWith(ServerUrls.url)) {
          return config;
        }
        var u = Auth.auth.username;
        var p = Auth.auth.password;
        config.headers.Authorization = "Basic " + window.btoa(u + ":" + p);
        return config;
      },
      responseError: (rejection) => {
        if (rejection.status === 401) {
          $location.path("/");
        }
        return $q.reject(rejection);
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
app.run(function($rootScope, $location, $http, ServerUrls, ScreenMessage, Popup) {
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

  $rootScope.loggedIn = false;

  $rootScope.checkLogin = () => {
    return $http({url: ServerUrls.loginUrl}).then(() => {
      $rootScope.loggedIn = true;
    }).catch(() => {
      $rootScope.loggedIn = false;
      $location.path("/");
    });
  };

  $rootScope.$on("$routeChangeStart", (evt, next) => {
    $rootScope.checkLogin().then(() => {
      if (next.$$route.originalPath !== "/" && !$rootScope.loggedIn) {
        evt.preventDefault();
      }
    });
  });

  console.log("Seismo app is running");
});

Auth.load(() => {
  angular.element(document).ready(function() {
    angular.bootstrap(document, ["ngRoute", "App"]);
  });
});

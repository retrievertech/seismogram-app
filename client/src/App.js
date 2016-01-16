var angular = window.angular;

import { Auth } from "./Auth.js";

// Top-level / shared modules
import { ScreenMessage } from "./ScreenMessage.svc.js";
import { Popup } from "./Popup.svc.js";
import { SeismogramMap } from "./SeismogramMap.svc.js";
import { SeismogramMapLoader } from "./SeismogramMapLoader.svc.js";
import { MapLink } from "./MapLink.dir.js";
import { ScrollToBottom } from "./ScrollToBottom.dir.js";

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
  .directive("scrollToBottom", ScrollToBottom)
  // An authorization interceptor. Injects auth headers on the way out and looks
  // for 401 (unauthorized) status on the way back.
  .factory("Authorization", ($location, $q, ServerUrls) => {
    return {
      // On the way out:
      request: (config) => {
        // We only put auth headers on node server requests
        if (!config.url.startsWith(ServerUrls.url)) {
          return config;
        }
        var u = Auth.auth.username;
        var p = Auth.auth.password;
        // Basic authorization header The format is:
        //  Authorization: Basic <base64 encoding of "user:password">
        config.headers.Authorization = "Basic " + window.btoa(u + ":" + p);
        return config;
      },
      // On the way in:
      responseError: (rejection) => {
        return $q.reject(rejection);
      }
    };
  });

// Each section declares its dependencies
sections.forEach((section) => section.declare(app));

// Each section installs its routes
app.config(($routeProvider, $httpProvider) => {
  sections.forEach((section) => section.installRoutes($routeProvider));
  // Activate the authorization interceptor.
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
  // Hits a trivial route on the server. If we're not logged in, the route should
  // return 401. Note that the authorization interceptor automatically redirects
  // to the home page.
  $rootScope.checkLogin = () => {
    return $http({url: ServerUrls.loginUrl}).then(() => {
      $rootScope.loggedIn = true;
    }).catch(() => {
      $rootScope.loggedIn = false;
    });
  };

  // Do an initial check for saved auth info.
  $rootScope.checkLogin();

  console.log("Seismo app is running");
});

// Load the user/pass from localstorage and then bootstrap the app.
Auth.load(() => {
  angular.element(document).ready(function() {
    angular.bootstrap(document, ["ngRoute", "App"]);
  });
});

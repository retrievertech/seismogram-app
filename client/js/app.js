import {Gradient} from "../bower_components/redfish-core/lib/Util/Gradient.js";

var angular = window.angular;
var seismoApp = angular.module("seismoApp", []);

import "./services.js";
import "./controllers.js";
import "./directives.js";

seismoApp.run([function() {
  console.log("Seismo is running.");
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["seismoApp"]);
});


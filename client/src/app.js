import {Gradient} from "../bower_components/redfish-core/lib/Util/Gradient.js";

var angular = window.angular;

import { MainCtrl } from "./mainCtrl.js";
import { Map } from "./map.js";
import { SeismoQuery } from "./query.js";
import { SeismoTimeFilter } from "./seismoTimeFilter/seismoTimeFilter.js";
import { SeismoFilters } from "./seismoFilters/seismoFilters.js";
import { LeafletMap } from "./leafletMap.js";

angular.module("seismoApp", [])
  .controller("mainCtrl", MainCtrl)
  .service("map", Map)
  .service("seismoQuery", SeismoQuery)
  .directive("seismoTimeFilter", SeismoTimeFilter)
  .directive("seismoFilters", SeismoFilters)
  .directive("leafletMap", LeafletMap)
  .run([function() {
    console.log("Seismo is running.");
  }]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["seismoApp"]);
});


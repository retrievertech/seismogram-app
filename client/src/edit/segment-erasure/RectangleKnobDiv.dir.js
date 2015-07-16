import { Watcher } from "./Watcher.js";
var $ = window.$;

export class RectangleKnobDiv {
  constructor($timeout, SegmentErasureEditor) {
    var rect = SegmentErasureEditor.rect;

    var actionMapping = {
      n: (evt) => rect.setNorth(evt.clientY),
      s: (evt) => rect.setSouth(evt.clientY),
      w: (evt) => rect.setWest(evt.clientX),
      e: (evt) => rect.setEast(evt.clientX),
      nw: (evt) => rect.setNorthWest(evt.clientY, evt.clientX),
      ne: (evt) => rect.setNorthEast(evt.clientY, evt.clientX),
      sw: (evt) => rect.setSouthWest(evt.clientY, evt.clientX),
      se: (evt) => rect.setSouthEast(evt.clientY, evt.clientX)
    };

    return (scope, element, attr) => {
      var knob = attr.rectangleKnobDiv;

      var watcher = new Watcher();
      watcher.install(scope, element);

      $(document).on("mousemove", (evt) => {
        if (!watcher.down || !watcher.editing) return;
        $timeout(() => actionMapping[knob](evt));
      });
    };
  }
}

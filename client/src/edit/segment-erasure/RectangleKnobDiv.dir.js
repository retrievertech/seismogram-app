import { Watcher } from "./Watcher.js";
var $ = window.$;

//
// Handles the 8 drag knobs on the rectangle.
//
export class RectangleKnobDiv {
  constructor($timeout, SegmentErasureEditor) {
    var rect = SegmentErasureEditor.rect;

    // What to do for each knob.
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
      // This value corresponds to a key in the `actionMapping` above.
      var knob = attr.rectangleKnobDiv;

      // The watcher tracks "mousedown" and "editing" state for us.
      var watcher = new Watcher();
      watcher.install(scope, element);

      // When dragging,
      $(document).on("mousemove", (evt) => {
        if (!watcher.down || !watcher.editing) return;

        // apply the right action for whatever knob is being dragged.
        $timeout(() => actionMapping[knob](evt));
      });
    };
  }
}

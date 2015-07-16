import { Watcher } from "./Watcher.js";
var $ = window.$;

//
// The directive driving the main rectangle div (without the knobs).
//
export class RectangleDiv {
  constructor($timeout, SegmentErasureEditor) {
    var rect = SegmentErasureEditor.rect;

    return (scope, element) => {
      // The watcher manages this.down and this.editing
      var watcher = new Watcher();
      watcher.install(scope, element);

      // This saves the position of the click point relative to the top-left corner
      // of the rectangle. We use this offset so we can enable dragging the rect
      // by clicking anywhere on it and dragging.

      // We also save the original width and height as we expect them to not change
      // during the move/mousedrag.
      var valuesAtMouseDown = { left: 0, top: 0, width: 0, height: 0 };

      // When we first click the rect, before we drag.
      $(element).on("mousedown", (evt) => {
        // Save the offset between the click point and the top-left corner of the box.
        valuesAtMouseDown = {
          left: evt.clientX - rect.w,
          top: evt.clientY - rect.n,
          width: rect.width(),
          height: rect.height()
        };
      });

      // When we start dragging.
      $(document).on("mousemove", (evt) => {
        // We only do stuff if we're dragging and the Segment Erasure editor is running.
        if (!watcher.down || !watcher.editing) return;

        var w = evt.clientX - valuesAtMouseDown.left;
        var n = evt.clientY - valuesAtMouseDown.top;
        var e = w + valuesAtMouseDown.width;
        var s = n + valuesAtMouseDown.height;

        // Set the northwest corner. We account for the difference between the click
        // point and the northwest corner.
        rect.setWest(w);
        rect.setNorth(n);

        // Make sure the width of the rectangle stays the same.
        rect.setEast(e);
        rect.setSouth(s);

        $timeout(() => {});
      });
    };
  }
}

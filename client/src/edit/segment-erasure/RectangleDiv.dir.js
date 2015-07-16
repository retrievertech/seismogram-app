import { Watcher } from "./Watcher.js";
var $ = window.$;

export class RectangleDiv {
  constructor($timeout, SegmentErasureEditor) {
    var rect = SegmentErasureEditor.rect;

    return (scope, element) => {
      var watcher = new Watcher();
      watcher.install(scope, element);

      var offsets = { left: 0, top: 0 };

      $(element).on("mousedown", (evt) => {
        offsets = {
          left: evt.clientX - rect.w,
          top: evt.clientY - rect.n
        };
      });

      $(document).on("mousemove", (evt) => {
        if (!watcher.down || !watcher.editing) return;

        $timeout(() => {
          var width = rect.width(),
              height = rect.height();
          rect.setWest(evt.clientX - offsets.left);
          rect.setNorth(evt.clientY - offsets.top);
          rect.setEast(rect.w + width);
          rect.setSouth(rect.n + height);
        });
      });
    };
  }
}

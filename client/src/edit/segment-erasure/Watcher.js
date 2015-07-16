var $ = window.$;

//
// A simple utility that tracks these two pieces of state, mousedown, and editing (for
// the erasure editor) and is shared by the rectangle directives.
//
export class Watcher {
  constructor() {
    this.down = false;
    this.editing = false;
  }

  install(scope, element) {
    $(element).on("mousedown", () => this.down = true);
    $(document).on("mouseup", () => this.down = false);
    scope.$watch("SegmentErasureEditor.editing", (v) => this.editing = v);
  }
}

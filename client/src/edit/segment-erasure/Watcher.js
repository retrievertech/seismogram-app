var $ = window.$;

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

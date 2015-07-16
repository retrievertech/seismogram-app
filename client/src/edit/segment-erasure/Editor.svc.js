import { Rectangle } from "./Rectangle.js";

export class SegmentErasureEditor {
  constructor() {
    this.editing = false;
    this.rect = window.rect = new Rectangle();
  }

  startEditing() {
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
  }
}

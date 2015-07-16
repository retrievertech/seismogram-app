//
// A region is simply a tagged array of points. An array along with a "type" tag.
//
class Region {
  constructor(type) {
    this.type = type;
    this.points = [];
  }
  addPoint(point) {
    this.points.push(point);
  }
}

//
// "Regions" is an array of regions which pushes a new region whenever a new type
// crops up -- a type that differs from the type of the previously pushed region.
//
// E.g., if you do
//   addPoint(p1, "a");
//   addPoint(p2, "a");
//   addPoint(p3, "b");
//   addPoint(p4, "a");
//   addPoint(p5, "a");
//   addPoint(p6, "b");
//   addPoint(p7, "b");
//
// the underlying data will essentially look like:
//
// [[p1,p2], [p3], [p4, p5], [p6, p7]]
//
export class Regions {
  constructor() {
    this.regions = [];
    this.currentRegion = null;
  }

  setNewRegion(type) {
    this.currentRegion = new Region(type);
    this.regions.push(this.currentRegion);
  }

  addPoint(point, type) {
    if (!this.currentRegion) {
      this.setNewRegion(type);
    }

    // if the last pushed region matches this type, just add to that region
    if (this.currentRegion.type === type) {
      this.currentRegion.addPoint(point);
    } else {
      // if a new type crops up, make a new region and put the point in it
      this.setNewRegion(type);
      this.currentRegion.addPoint(point);
    }
  }
}

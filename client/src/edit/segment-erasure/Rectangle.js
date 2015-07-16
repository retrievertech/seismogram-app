//
// A simple rectangle utility, the "model" behind the UI div that can be dragged
// and moved around to define the area in which to clip segment data.
//
export class Rectangle {
  constructor() {
    this.n = 300;
    this.s = 420;
    this.w = 300;
    this.e = 490;
  }

  width()     { return Math.floor(this.e - this.w); }
  height()    { return Math.floor(this.s - this.n); }

  setNorth(v) { if (this.s - v > 30) this.n = Math.floor(v); }
  setSouth(v) { if (v - this.n > 30) this.s = Math.floor(v); }
  setWest(v)  { if (this.e - v > 30) this.w = Math.floor(v); }
  setEast(v)  { if (v - this.w > 30) this.e = Math.floor(v); }

  setNorthWest(n,w) { this.setNorth(n); this.setWest(w); }
  setNorthEast(n,e) { this.setNorth(n); this.setEast(e); }
  setSouthWest(s,w) { this.setSouth(s); this.setWest(w); }
  setSouthEast(s,e) { this.setSouth(s); this.setEast(e); }
}

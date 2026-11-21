export class SeededRandom {
  constructor(seed = 1) { this.state = seed | 0; }
  next() { let t = this.state = (this.state + 0x6d2b79f5) | 0; t = Math.imul(t ^ t >>> 15, 1 | t); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[this.int(0, arr.length - 1)]; }
  chance(p) { return this.next() < p; }
}

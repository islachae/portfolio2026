/** A damped spring on one number (the physical feel of everything that settles). */
export class Spring {
  v = 0;
  constructor(
    public x: number,
    public k: number,
    public c: number
  ) {}
  step(target: number, dt: number) {
    const n = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.v += (-this.k * (this.x - target) - this.c * this.v) * h;
      this.x += this.v * h;
    }
    return this.x;
  }
  snap(x: number) {
    this.x = x;
    this.v = 0;
  }
}

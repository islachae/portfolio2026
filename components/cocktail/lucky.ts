/**
 * Yuánfèn's drink and its garnish, "A Chance Encounter".
 *
 * In the goblet: a sprite of foam dozing on the drink among foam pearls, a big four-leaf clover
 * and mint behind it, clovers and small white flowers drifting inside the drink, a green ribbon
 * tied around the bowl, a gold pick with a clover on top. Around it: clovers and flowers in the
 * air and on the counter.
 *
 * Its small reaction to the visitor: one lucky clover leaves its place and comes over to the
 * pointer, then follows it around ("some connections just find you"); the foam wakes up when
 * you come close.
 */
import * as THREE from "three";
import { GLASSES, bandGeometry, leafGeometry, outerRadius, petalGeometry, puffyHeartGeometry } from "./kit";
import { Sleeper, type Dome } from "./sleeper";
import { Spring } from "./spring";
import { backOut, seg, type Phase } from "./timeline";

const G = GLASSES.goblet;
/** The foam sprite: its round body, and where it floats on the drink */
const FOAM: Dome = { y: 0.19, r: 0.3, sy: 0.92 };
const FOAM_AT = new THREE.Vector3(-0.08, G.full, 0.0);
const FOAM_SCALE = 1.22;
/** The pick: where it stands in the glass and where its top is */
export const LUCKY_PICK = { a: new THREE.Vector3(0.44, 1.64, 0.24), b: new THREE.Vector3(0.98, 2.48, 0.14) };

export type LuckyFrame = {
  t: number;
  dt: number;
  ph: Phase;
  /** seconds into the phase (in the garnish beat: seconds since the garnish started coming in) */
  tau: number;
  red: boolean;
  /** this drink's glass is on screen */
  on: boolean;
  /** how the pick is leaning right now */
  garnishAng: number;
  glass: THREE.Object3D;
  /** where the visitor is relative to something (see Bar.visitor) */
  visitor: (obj: THREE.Object3D, lift: number, radius: number, span: number) => { near: boolean; toward: number; fresh: boolean; px: number; py: number };
};

type Floater = { o: THREE.Object3D; p: THREE.Vector3; s: number; floor?: boolean };

export class LuckyClover {
  /** everything that lives with the glass (glass units) */
  readonly group = new THREE.Group();
  /** what rides on the pick: the rod and the gold clover on top */
  readonly pickSet = new THREE.Group();

  private nap = new Sleeper(FOAM, { eye: [0.1, 0.25], smile: 0.185, blush: [0.185, 0.175], z: [-0.24, 0.5], size: 0.78, blushColor: 0xffa8b8 });
  private foam = new THREE.Group();
  private big = new THREE.Group();
  private mint = new THREE.Group();
  private inside: Floater[] = [];
  private insideGroup = new THREE.Group();
  private ribbon: THREE.Mesh;
  private ribbonMat: THREE.MeshPhysicalMaterial;
  private topper = new THREE.Group();
  private air = new THREE.Group();
  private floaters: Floater[] = [];
  private finder: THREE.Group;
  private fx = new Spring(-1.05, 16, 6);
  private fy = new Spring(2.05, 16, 6);
  private tmp = new THREE.Vector3();

  constructor() {
    const ball = new THREE.SphereGeometry(1, 28, 20);
    const foamMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffdf6,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      sheen: 1,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(0xe6f3c4),
      emissive: 0xf4f6e2,
      emissiveIntensity: 0.3,
    });
    const leafMat = new THREE.MeshPhysicalMaterial({
      color: 0x7cc452,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xe9ffc0),
      emissive: 0x58a534,
      emissiveIntensity: 0.22,
    });
    const paleLeaf = leafMat.clone();
    paleLeaf.color.set(0xb4e07e);
    paleLeaf.emissive.set(0x97cf5c);
    const mintMat = new THREE.MeshPhysicalMaterial({
      color: 0x74b257,
      roughness: 0.45,
      sheen: 0.5,
      sheenColor: new THREE.Color(0xd8f0a8),
      emissive: 0x5e9a40,
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    });
    const gold = new THREE.MeshPhysicalMaterial({
      color: 0xf1d18d,
      metalness: 0.6,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: 0xc59645,
      emissiveIntensity: 0.3,
      envMapIntensity: 1.2,
    });
    const petalMat = new THREE.MeshPhysicalMaterial({
      // a warm white: on the pale page a pure white flower would disappear
      color: 0xfff3d4,
      roughness: 0.5,
      sheen: 1,
      sheenColor: new THREE.Color(0xffffff),
      emissive: 0xffe9b8,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const coreMat = new THREE.MeshPhysicalMaterial({ color: 0xf2c24d, roughness: 0.5, emissive: 0xe6a92e, emissiveIntensity: 0.3 });

    const puff = (parent: THREE.Object3D, x: number, y: number, z: number, r: number, sy = 1, mat: THREE.Material = foamMat) => {
      const m = new THREE.Mesh(ball, mat);
      m.position.set(x, y, z);
      m.scale.set(r, r * sy, r);
      parent.add(m);
      return m;
    };

    /* a four-leaf clover: four flat hearts, tips together */
    const creaseGeo = new THREE.BoxGeometry(1, 1, 1);
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xc8eea0, transparent: true, opacity: 0.75 });
    const leaflets = new Map<number, THREE.BufferGeometry>();
    const clover = (w: number, mat: THREE.Material, stem = true) => {
      let geo = leaflets.get(w);
      if (!geo) {
        geo = puffyHeartGeometry(w, 0.05);
        geo.translate(0, w * 0.5, 0);
        leaflets.set(w, geo);
      }
      const g = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const hold = new THREE.Group();
        hold.rotation.z = ((45 + i * 90 - 90) * Math.PI) / 180;
        const leaf = new THREE.Mesh(geo, mat);
        leaf.rotation.x = -0.2; // the four cup a little toward you
        // the crease down the middle of each leaflet
        const vein = new THREE.Mesh(creaseGeo, creaseMat);
        vein.scale.set(w * 0.022, w * 0.62, w * 0.02);
        vein.position.set(0, w * 0.42, w * 0.045);
        leaf.add(vein);
        hold.add(leaf);
        g.add(hold);
      }
      if (stem) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.045, w * 0.055, w * 1.1, 8), mat);
        st.position.set(w * 0.2, -w * 0.5, -w * 0.05);
        st.rotation.z = 0.38;
        g.add(st);
      }
      return g;
    };
    /* a small white five-petalled flower */
    const petals = new Map<number, THREE.BufferGeometry>();
    const flower = (size: number) => {
      let geo = petals.get(size);
      if (!geo) {
        geo = petalGeometry(size, size * 0.8, 0.4);
        petals.set(size, geo);
      }
      const g = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const hold = new THREE.Group();
        hold.rotation.z = (i / 5) * Math.PI * 2;
        hold.add(new THREE.Mesh(geo, petalMat));
        g.add(hold);
      }
      const core = new THREE.Mesh(ball, coreMat);
      core.scale.set(size * 0.2, size * 0.2, size * 0.12);
      core.position.z = size * 0.12;
      g.add(core);
      return g;
    };

    /* ── the foam sprite, and the foam pearls it floats among ── */
    const body = this.nap.body;
    puff(body, 0, FOAM.y, 0, FOAM.r, FOAM.sy);
    puff(body, -0.2, 0.1, 0.04, 0.16);
    puff(body, 0.2, 0.1, 0.02, 0.17);
    puff(body, 0.0, 0.1, -0.16, 0.2);
    // the little green mark on its forehead
    const mark = new THREE.Mesh(ball, leafMat);
    mark.scale.setScalar(0.017);
    mark.position.copy(this.nap.onDome(0, 0.335, 0.004));
    body.add(mark);
    const pearl = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 1, sheenColor: new THREE.Color(0xf2ffd6), emissive: 0xf8fbe9, emissiveIntensity: 0.32 });
    for (let i = 0; i < 20; i++) {
      // scattered over the surface (golden-angle steps, so they never line up)
      const a = i * 2.39996 + 0.5;
      const rad = 0.24 + 0.3 * ((i * 0.618) % 1);
      const r = 0.055 + 0.045 * ((i * 0.37) % 1);
      puff(this.foam, Math.cos(a) * rad, 0.02 + (rad < 0.32 ? 0.05 : 0), Math.sin(a) * rad * 0.95, r, 1, pearl);
    }
    const tiny = clover(0.1, leafMat);
    tiny.position.set(0.19, 0.12, 0.27);
    tiny.rotation.set(-0.3, 0.3, -0.35);
    this.foam.add(body, tiny);
    this.foam.position.copy(FOAM_AT);

    /* ── the big four-leaf clover standing behind it, and mint on the other side ── */
    const stalk = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(0.035, 0.08, 0.02), new THREE.Vector3(0, 0.4, 0)]), 16, 0.015, 8),
      leafMat
    );
    const head = clover(0.3, leafMat, false);
    head.position.set(0, 0.52, 0);
    head.rotation.set(-0.1, -0.22, 0.14);
    this.big.add(stalk, head);
    this.big.position.set(0.4, G.full, -0.22);
    const lg = leafGeometry(0.44, 0.13);
    [
      [-0.44, -0.02, -0.2, 0.8, 0.3],
      [-0.24, 0.02, -0.32, 0.32, 0.1],
    ].forEach(([x, y, z, rz, ry], i) => {
      const leaf = new THREE.Mesh(lg, mintMat);
      leaf.position.set(x, G.full + y, z);
      leaf.rotation.set(-0.2, ry, rz);
      leaf.scale.setScalar(1 - i * 0.14);
      this.mint.add(leaf);
    });

    /* ── in the drink: clovers and flowers turning slowly among the ice ── */
    const sink = (o: THREE.Object3D, x: number, y: number, z: number, s: number, i: number) => {
      o.rotation.set(-0.5 + i * 0.4, i * 1.3, i * 0.9);
      this.inside.push({ o, p: new THREE.Vector3(x, y, z), s });
      this.insideGroup.add(o);
    };
    sink(clover(0.14, leafMat), -0.08, 1.3, 0.46, 1, 0);
    sink(clover(0.14, leafMat), 0.32, 1.0, 0.34, 0.9, 1);
    sink(clover(0.14, leafMat), -0.36, 0.98, 0.2, 0.8, 2);
    sink(flower(0.085), 0.22, 1.4, 0.5, 1, 3);
    sink(flower(0.085), -0.3, 1.16, 0.46, 0.9, 4);
    sink(flower(0.085), 0.4, 1.24, 0.28, 0.8, 5);

    /* ── the ribbon: in from the right, across the front of the bowl, out to the left ── */
    const on = (deg: number, y: number, out = 0.035) => {
      const th = (deg * Math.PI) / 180;
      const r = outerRadius(y, "goblet") + out;
      return new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th));
    };
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.06, 1.0, 0.3),
      new THREE.Vector3(1.04, 1.24, 0.28),
      new THREE.Vector3(0.92, 1.52, 0.26),
      on(14, 1.72, 0.05),
      on(42, 1.66),
      on(75, 1.53),
      on(105, 1.41),
      on(135, 1.31),
      on(163, 1.23),
      new THREE.Vector3(-0.9, 1.17, 0.2),
      new THREE.Vector3(-1.08, 1.06, 0.28),
      new THREE.Vector3(-1.03, 0.9, 0.34),
    ]);
    this.ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xa9d77c,
      roughness: 0.36,
      sheen: 1,
      sheenColor: new THREE.Color(0xf0ffd0),
      emissive: 0x8fc060,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
    });
    this.ribbon = new THREE.Mesh(bandGeometry(path, 140, 0.11, 0.008, 0.9), this.ribbonMat);
    this.ribbon.renderOrder = 5;

    /* ── on the pick: a gold rod with a clover of four loops on top ── */
    const len = LUCKY_PICK.b.distanceTo(LUCKY_PICK.a);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 12), gold);
    rod.position.y = len / 2;
    const collar = new THREE.Mesh(ball, gold);
    collar.scale.setScalar(0.026);
    collar.position.y = len;
    const loop = new THREE.TorusGeometry(0.04, 0.012, 10, 28);
    for (let i = 0; i < 4; i++) {
      const a = ((45 + i * 90) * Math.PI) / 180;
      const l = new THREE.Mesh(loop, gold);
      l.position.set(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0);
      this.topper.add(l);
    }
    const stud = new THREE.Mesh(ball, gold);
    stud.scale.setScalar(0.022);
    this.topper.add(stud);
    this.topper.position.y = len + 0.1;
    this.pickSet.add(rod, collar, this.topper);

    /* ── around the glass: clovers and flowers in the air and on the counter ── */
    const strew = (o: THREE.Object3D, x: number, y: number, z: number, s: number, i: number, floor = false) => {
      // on the counter they lie back, tipped toward you (flat, they'd be slivers from this angle)
      o.rotation.set(floor ? -0.95 : -0.2 + i * 0.3, floor ? 0 : i * 0.9, i * 1.1);
      o.scale.setScalar(s);
      this.floaters.push({ o, p: new THREE.Vector3(x, y, z), s, floor });
      this.air.add(o);
    };
    strew(clover(0.13, paleLeaf), -1.3, 1.12, 0.3, 1, 0);
    strew(clover(0.13, leafMat), 1.18, 0.88, 0.3, 0.9, 1);
    strew(clover(0.13, paleLeaf), 1.28, 1.78, 0.1, 0.85, 2);
    strew(new THREE.Mesh(leafGeometry(0.16, 0.06), mintMat), -1.3, 0.56, 0.4, 1, 3);
    strew(flower(0.1), -0.95, 0.03, 0.8, 1, 4, true);
    strew(flower(0.1), -1.3, 0.03, 0.4, 0.85, 5, true);
    strew(new THREE.Mesh(leafGeometry(0.18, 0.07), mintMat), -0.6, 0.03, 1.05, 1, 6, true);
    // the lucky one: it comes to find you
    this.finder = clover(0.15, leafMat);
    this.air.add(this.finder);

    this.group.add(this.mint, this.big, this.insideGroup, this.foam, this.ribbon, this.air);
    this.group.visible = false;
    this.pickSet.visible = false;
  }

  update(f: LuckyFrame) {
    const { t, dt, ph, tau, red } = f;
    this.group.visible = f.on;
    // the gold clover stays upright while the pick leans
    this.topper.rotation.z = -f.garnishAng;
    if (!f.on) return;
    const done = ph === "hero" || ph === "final";
    const pouring = ph === "pour";

    // the clovers, flowers and mint go in with the ice
    const inK = pouring && !red ? backOut(seg(tau, 1.5, 1.85), 1.6) : 1;
    this.insideGroup.visible = this.mint.visible = !pouring || tau > 1.5 || red;
    this.inside.forEach((it, i) => {
      it.o.position.set(it.p.x, it.p.y + (red ? 0 : Math.sin(t * 0.7 + i * 1.7) * 0.025), it.p.z);
      if (!red) it.o.rotation.z += dt * (0.12 + i * 0.03);
      it.o.scale.setScalar(Math.max(0.001, it.s * inK));
    });
    this.mint.scale.setScalar(Math.max(0.001, inK));

    // the ribbon is tied on once the drink is poured
    const tied = pouring ? 0 : ph === "garnish" && !red ? seg(tau, 0.1, 0.5) : 1;
    this.ribbon.visible = tied > 0.01;
    this.ribbonMat.opacity = 0.94 * tied;

    // the garnish beat: foam is spooned on, the pick goes in, and the clover turns up, just like that
    let grow = 1,
      squish = 0,
      pop = 1;
    if (ph === "garnish" && !red) {
      grow = backOut(seg(tau, 0.04, 0.42), 2);
      const b = tau - 1.12;
      if (b > 0) squish = 0.12 * Math.exp(-b * 7) * Math.cos(b * 22);
      pop = backOut(seg(tau, 1.12, 1.5), 2.4);
    }
    this.foam.visible = !pouring;
    this.foam.scale.setScalar(Math.max(0.001, grow) * FOAM_SCALE);
    this.big.visible = !pouring && pop > 0.001;
    this.big.scale.setScalar(Math.max(0.001, pop));
    this.big.rotation.z = red ? 0 : Math.sin(t * 0.9) * 0.05;

    // asleep or awake
    const v = f.visitor(this.nap.body, FOAM.y * FOAM_SCALE, 1.3, 1.8);
    this.nap.step(t, dt, { near: v.near && ph !== "garnish", toward: v.toward, red, dream: done, squish, lean: 0.12 });

    // around the glass
    this.air.visible = done;
    if (!done) return;
    this.floaters.forEach((it, i) => {
      if (it.floor || red) {
        it.o.position.copy(it.p);
        return;
      }
      it.o.position.set(it.p.x + Math.sin(t * 0.5 + i * 2.1) * 0.06, it.p.y + Math.sin(t * 0.8 + i * 1.3) * 0.07, it.p.z);
      it.o.rotation.z += dt * (0.25 + i * 0.07);
    });
    // the lucky clover: waiting up on the left; when you turn up it comes over and keeps you company
    this.tmp.set(-1.05 + Math.sin(t * 0.5) * 0.12, 2.05 + Math.sin(t * 0.8) * 0.08, 0);
    if (v.fresh && !red) {
      this.tmp.set(v.px, v.py, 0);
      f.glass.worldToLocal(this.tmp);
      // beside the pointer, not under it
      this.tmp.x += 0.27;
      this.tmp.y += 0.27;
    }
    if (red) {
      this.fx.snap(this.tmp.x);
      this.fy.snap(this.tmp.y);
    }
    const x = this.fx.step(this.tmp.x, dt);
    const y = this.fy.step(this.tmp.y, dt);
    this.finder.position.set(x, y, 0.9);
    // it spins faster the faster it travels
    const speed = Math.hypot(this.fx.v, this.fy.v);
    if (!red) this.finder.rotation.z += dt * (0.5 + Math.min(4, speed) * 1.4);
    this.finder.rotation.x = -0.25;
  }
}

/**
 * Word Cocktail · the bar. Every 3D object and how it moves, driven by one clock.
 *
 * The DOM says which phase we are in and when it started (`store.phase`, `store.t0`);
 * this file turns "0.42s into the third pour" into poses. Objects follow invisible DOM
 * anchors (`store.anchors`), so the layout lives in CSS and the drink lands where the
 * page puts it, at any screen size.
 */
import * as THREE from "three";
import type { Cocktail } from "@/content/cocktails";
import {
  GLASS,
  SHAKER,
  SHOT,
  capGeometry,
  chrome,
  fresnelShell,
  gemGeometry,
  gemMaterial,
  glassGeometry,
  glowTexture,
  liquidGeometry,
  shakerBodyGeometry,
  shakerFootGeometry,
  shakerLipGeometry,
  shakerRadius,
  shotGeometry,
  shotLiquidGeometry,
  sparkleTexture,
} from "./kit";
import { STEP, T, backOut, clamp01, clock, easeIn, easeInOut, easeOut, seg, type MixPlan, type Phase } from "./timeline";

export type BarStore = {
  phase: Phase;
  /** seconds (performance.now / 1000) when the phase began */
  t0: number;
  cocktail: Cocktail;
  plan: MixPlan | null;
  /** hold ring 0–1 */
  hold: number;
  /** the menu: when the word last changed, and which way */
  wordT0: number;
  wordDir: number;
  /** pointer in canvas NDC (-1…1), for the olive's eye */
  pointer: { x: number; y: number; t: number };
  anchors: { main: HTMLElement | null; final: HTMLElement | null };
  canvas: HTMLElement | null;
  reduced: boolean;
  /** 0–1: how hard the shaker is going (the DOM draws motion lines from it) */
  intensity: number;
  /** jump straight to the layout (no spring ride), e.g. after a resize or a deep link */
  snap?: boolean;
};

const now = () => clock.now();

/** A damped spring on one number. */
class Spring {
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

type Gem = {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  size: number;
};

/** Where the gems settle in the shaker (bottom layer first). */
const SLOTS = [
  [-0.22, 0.43, 0.14],
  [0.23, 0.41, 0.12],
  [0.0, 0.45, -0.2],
  [-0.06, 0.88, 0.18],
  [0.24, 0.9, -0.04],
  [-0.26, 0.94, -0.1],
].map((p) => new THREE.Vector3(...p));

/** Ice in the finished drink */
const ICE = [
  [-0.32, 1.56, 0.1, 1.15],
  [0.1, 1.53, 0.3, 1.0],
  [0.34, 1.58, -0.16, 1.05],
].map(([x, y, z, s]) => ({ p: new THREE.Vector3(x, y, z), s }));

/** The pick leans in the glass, the olive near its top. */
const PICK = { a: new THREE.Vector3(-0.14, 1.0, 0.16), b: new THREE.Vector3(0.66, 2.2, 0.16), olive: 0.72 };

/** Shaker pose while it pours (rig units: glass base = origin) */
const POUR_POSE = { cx: 1.04, cy: 3.3, rot: 2.0 };

export class Bar {
  root = new THREE.Group();
  private rig = new THREE.Group();
  private rx: Spring;
  private ry: Spring;
  private rs: Spring;
  private placed = false;

  // glass
  private glass = new THREE.Group();
  private glassShell: THREE.Mesh;
  private liquid: THREE.Mesh;
  private liquidMat: THREE.MeshPhysicalMaterial;
  private fill = -1;
  private surfaceY = 1.6;
  private ice: THREE.Mesh[] = [];
  private garnish = new THREE.Group();
  private olive = new THREE.Group();
  private eye = new THREE.Group();
  private ripple: THREE.Mesh;

  // shaker
  private shaker = new THREE.Group();
  private shakerInner = new THREE.Group();
  private cap = new THREE.Group();
  private gems: Gem[] = [];
  private gemGroup = new THREE.Group();

  // pours
  private shots: { g: THREE.Group; liq: THREE.Mesh; liqMat: THREE.MeshPhysicalMaterial }[] = [];
  private streams: { mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial }[] = [];
  private sparkles: THREE.Sprite[] = [];
  private tweezers = new THREE.Group();
  private prongs: THREE.Mesh[] = [];
  private heldTop = new THREE.Vector3();
  private garnishAng = 0;
  private pickLen = 1;

  // floor
  private shadow: THREE.Mesh;
  private gShadow: THREE.Mesh;
  private glow: THREE.Mesh;
  private glowMat: THREE.MeshBasicMaterial;

  // shake dynamics
  private phase = 0;
  private sx: Spring;
  private sy: Spring;
  private sr: Spring;
  private sI: Spring;
  private prevOff = new THREE.Vector3();
  private prevVel = new THREE.Vector3();
  private shakeRest = true;

  private shown: Cocktail | null = null;
  private blinkAt = now() + 3;
  private lookSp = { x: new Spring(0, 60, 11), y: new Spring(0, 60, 11) };
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private lastPhase: Phase | null = null;
  /** the rig's pose when the phase began (so the old object can leave from where it was) */
  private entry = { x: 0, y: 0, s: 1 };
  private lastT0 = -1;

  constructor() {
    this.rx = new Spring(0, 150, 21);
    this.ry = new Spring(0, 150, 21);
    this.rs = new Spring(1, 150, 21);
    // stiff and a little under-damped: the shaker carries momentum and overshoots when you let go
    this.sx = new Spring(0, 2600, 40);
    this.sy = new Spring(0, 2600, 40);
    this.sr = new Spring(0, 2200, 34);
    this.sI = new Spring(0, 90, 16);

    this.root.add(this.rig);
    this.rig.rotation.x = 0.16;

    // floor: a soft shadow and a coloured glow, like light through a full glass
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: glowTexture([
          [0, "rgba(40,30,20,.32)"],
          [0.45, "rgba(40,30,20,.12)"],
          [1, "rgba(40,30,20,0)"],
        ]),
        transparent: true,
        depthWrite: false,
      })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = -2;
    this.glowMat = new THREE.MeshBasicMaterial({
      map: glowTexture([
        [0, "rgba(255,255,255,.9)"],
        [0.3, "rgba(255,255,255,.45)"],
        [1, "rgba(255,255,255,0)"],
      ]),
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.glowMat);
    this.glow.rotation.x = -Math.PI / 2;
    this.glow.renderOrder = -1;
    this.glow.position.set(0.08, 0.004, 0.25);
    this.gShadow = this.shadow.clone();
    this.gShadow.material = (this.shadow.material as THREE.MeshBasicMaterial).clone();
    this.gShadow.position.set(0, 0.002, 0.05);
    this.rig.add(this.shadow);
    this.glass.add(this.gShadow, this.glow);

    /* ── the glass ── */
    this.glassShell = new THREE.Mesh(glassGeometry(), fresnelShell({ min: 0.11, max: 0.95, power: 2.1, env: 1.9, irid: 0.4 }));
    this.glassShell.renderOrder = 4;
    this.liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfe79a,
      transparent: true,
      opacity: 0.78,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: 0xcfe79a,
      emissiveIntensity: 0.32,
      depthWrite: false,
      envMapIntensity: 1.2,
    });
    this.liquid = new THREE.Mesh(new THREE.BufferGeometry(), this.liquidMat);
    this.liquid.renderOrder = 3;
    this.setFill(1);
    this.glass.add(this.glassShell, this.liquid);
    ICE.forEach((ic, i) => {
      const m = new THREE.Mesh(gemGeometry(101 + i * 7, 0.19 * ic.s), gemMaterial(0xe2f3c0, { ice: true }));
      m.position.copy(ic.p);
      m.rotation.set(i * 1.3, i * 0.7, i * 0.4);
      this.ice.push(m);
      this.glass.add(m);
    });
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 5;
    this.ripple = ring;
    this.glass.add(ring);

    /* ── the garnish: an olive with an eye, on a pick ── */
    const pickLen = PICK.b.distanceTo(PICK.a);
    this.pickLen = pickLen;
    const pickMat = chrome({ roughness: 0.12 });
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, pickLen, 12), pickMat);
    pick.position.y = pickLen / 2;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 14), pickMat);
    knob.position.y = pickLen;
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.175, 48, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x8aa635, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color(0xe6f5a0) })
    );
    body.scale.set(1, 1.2, 1);
    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.108, 40, 28),
      new THREE.MeshPhysicalMaterial({ color: 0xfbf6e6, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05 })
    );
    sclera.scale.set(1, 1, 0.5);
    sclera.position.z = 0.13;
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 32, 20),
      new THREE.MeshPhysicalMaterial({ color: 0x151412, roughness: 0.12, clearcoat: 1 })
    );
    pupil.scale.set(1, 1, 0.42);
    pupil.position.z = 0.172;
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(0.02, 0.024, 0.196);
    this.eye.add(sclera, pupil, glint);
    this.olive.add(body, this.eye);
    this.olive.position.y = pickLen * PICK.olive;
    this.garnish.add(pick, knob, this.olive);
    this.placeGarnish(0, 0, 0);
    this.glass.add(this.garnish);

    /* ── the shaker ── */
    const back = new THREE.Mesh(shakerBodyGeometry(0.004), chrome({ side: THREE.BackSide, roughness: 0.2, color: 0xdfe3e8, iridescence: 0.2 }));
    const front = new THREE.Mesh(
      shakerBodyGeometry(),
      fresnelShell({ color: 0xf2f4f6, metal: 1, rough: 0.06, min: 0.16, max: 0.98, power: 1.5, env: 1.35, irid: 0.4 })
    );
    front.renderOrder = 4;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(shakerRadius(SHAKER.floor) - 0.01, 48), chrome({ roughness: 0.25 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = SHAKER.floor;
    const foot = new THREE.Mesh(shakerFootGeometry(), chrome());
    const lip = new THREE.Mesh(shakerLipGeometry(), chrome());
    this.shakerInner.add(back, floor, this.gemGroup, front, foot, lip);
    const capMesh = new THREE.Mesh(capGeometry(), chrome());
    this.cap.add(capMesh);
    this.cap.position.y = SHAKER.h;
    this.shakerInner.add(this.cap);
    this.shaker.add(this.shakerInner);

    for (let i = 0; i < SLOTS.length; i++) {
      const mesh = new THREE.Mesh(gemGeometry(7 + i * 13, 0.27), gemMaterial(0xffffff));
      mesh.visible = false;
      this.gemGroup.add(mesh);
      this.gems.push({ mesh, rest: SLOTS[i].clone(), pos: SLOTS[i].clone(), vel: new THREE.Vector3(), spin: new THREE.Vector3(), size: 1 });
    }

    /* ── shot glasses, streams, sparkles ── */
    const shotGeo = shotGeometry();
    const shotLiq = shotLiquidGeometry();
    for (let i = 0; i < 2; i++) {
      const g = new THREE.Group();
      const shell = new THREE.Mesh(shotGeo, fresnelShell({ min: 0.1, max: 0.92, power: 2, env: 1.6, irid: 0.3 }));
      shell.renderOrder = 4;
      const liqMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        roughness: 0.05,
        clearcoat: 1,
        emissiveIntensity: 0.3,
        depthWrite: false,
      });
      const liq = new THREE.Mesh(shotLiq, liqMat);
      liq.position.y = SHOT.floor + 0.004;
      liq.renderOrder = 3;
      g.add(liq, shell);
      g.visible = false;
      this.shots.push({ g, liq, liqMat });
      this.rig.add(g);

      const mat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        roughness: 0.04,
        clearcoat: 1,
        emissive: 0xffffff,
        emissiveIntensity: 0.12,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      mesh.renderOrder = 3;
      mesh.frustumCulled = false;
      mesh.visible = false;
      this.streams.push({ mesh, mat });
      this.rig.add(mesh);
    }
    const sp = sparkleTexture();
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sp, transparent: true, depthWrite: false }));
      s.visible = false;
      s.renderOrder = 6;
      this.sparkles.push(s);
      this.rig.add(s);
    }

    /* ── tweezers ── */
    const prongGeo = new THREE.CylinderGeometry(0.05, 0.026, 1.7, 18);
    prongGeo.scale(1, 1, 0.55);
    prongGeo.translate(0, 0.85, 0);
    const pm = chrome({ roughness: 0.14, color: 0xd9dde2 });
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(prongGeo, pm);
      p.position.x = s * 0.02;
      this.prongs.push(p);
      this.tweezers.add(p);
    }
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 20), pm);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.y = 1.7;
    this.tweezers.add(hinge);
    this.tweezers.visible = false;
    this.rig.add(this.tweezers);

    this.rig.add(this.glass, this.shaker);
  }

  /* ───────────── helpers ───────────── */

  private setFill(f: number) {
    if (Math.abs(f - this.fill) < 0.004) return;
    this.fill = f;
    const { geometry, surface } = liquidGeometry(f);
    this.liquid.geometry.dispose();
    this.liquid.geometry = geometry;
    this.surfaceY = surface;
    this.liquid.visible = f > 0.015;
  }

  private placeGarnish(dx: number, dy: number, rot: number) {
    const dir = this.tmp.copy(PICK.b).sub(PICK.a);
    const ang = Math.atan2(-dir.x, dir.y);
    this.garnish.position.set(PICK.a.x + dx, PICK.a.y + dy, PICK.a.z);
    this.garnish.rotation.set(0, 0, ang + rot);
    this.garnishAng = ang + rot;
  }

  private dress(c: Cocktail) {
    if (this.shown === c) return;
    this.shown = c;
    const col = new THREE.Color(c.liquid);
    this.liquidMat.color.copy(col);
    this.liquidMat.emissive.copy(col);
    this.glowMat.color.copy(col).lerp(new THREE.Color(0xffffff), 0.15);
    if (c.status === "ready") {
      c.ingredients.length; // gems are coloured from the mix plan
    }
  }

  /** Bottom-centre and height of a DOM anchor, in world units at z = 0. */
  private anchor(el: HTMLElement | null, camera: THREE.PerspectiveCamera, canvas: HTMLElement | null) {
    if (!el || !canvas) return null;
    const c = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!c.height || !r.height) return null;
    const viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const k = viewH / c.height;
    return {
      x: (r.left + r.width / 2 - c.left - c.width / 2) * k,
      y: -(r.bottom - c.top - c.height / 2) * k,
      h: r.height * k,
      viewW: c.width * k,
      viewH,
    };
  }

  private sparkle(i: number, at: THREE.Vector3, age: number, color: THREE.Color, size = 0.5) {
    const s = this.sparkles[i % this.sparkles.length];
    if (age < 0 || age > 0.42) return;
    const k = Math.sin((age / 0.42) * Math.PI);
    s.visible = true;
    s.position.copy(at);
    s.material.color.copy(color).lerp(new THREE.Color(0xffffff), 0.5);
    s.material.opacity = k * 0.9;
    s.material.rotation = age * 2;
    s.scale.setScalar(size * (0.35 + k * 0.9));
  }

  /** A stream from `a` arcing along `dir` into `b`, drawn between `tail` and `head` (0–1 along it). */
  private stream(i: number, a: THREE.Vector3, dir: THREE.Vector3, b: THREE.Vector3, tail: number, head: number, colors: THREE.Color[], radius: number) {
    const s = this.streams[i];
    if (head <= tail + 0.01) {
      s.mesh.visible = false;
      return;
    }
    const ctrl = a.clone().addScaledVector(dir, a.distanceTo(b) * 0.38);
    const full = new THREE.QuadraticBezierCurve3(a.clone(), ctrl, b.clone());
    const sub = new SubCurve(full, tail, head);
    const segs = 28;
    const geo = new THREE.TubeGeometry(sub, segs, radius, 10, false);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const centre = new THREE.Vector3();
    const t = now();
    for (let j = 0; j <= segs; j++) {
      const u = j / segs;
      const along = tail + (head - tail) * u;
      sub.getPoint(u, centre);
      // thins as it falls, rounds off at the head
      const taper = (1 - along * 0.45) * (j === segs ? 0.2 : j === segs - 1 ? 0.75 : 1) * (j === 0 && tail > 0.02 ? 0.4 : 1);
      // colours run down the stream: the mix at the top, the drink at the bottom
      const idx = colors.length > 2 ? (along * 3 + t * 2.4) % (colors.length - 1) : 0;
      const k = Math.floor(idx);
      c.copy(colors[k]).lerp(colors[Math.min(colors.length - 1, k + 1)], idx - k);
      if (colors.length > 2) c.lerp(colors[colors.length - 1], clamp01(along * 1.25));
      for (let r = 0; r <= 10; r++) {
        const vi = j * 11 + r;
        this.tmp.fromBufferAttribute(pos, vi).sub(centre).multiplyScalar(taper).add(centre);
        pos.setXYZ(vi, this.tmp.x, this.tmp.y, this.tmp.z);
        col[vi * 3] = c.r;
        col[vi * 3 + 1] = c.g;
        col[vi * 3 + 2] = c.b;
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    s.mesh.geometry.dispose();
    s.mesh.geometry = geo;
    s.mesh.visible = true;
  }

  private hideTransient() {
    this.shots.forEach((s) => (s.g.visible = false));
    this.streams.forEach((s) => (s.mesh.visible = false));
    this.sparkles.forEach((s) => (s.visible = false));
    this.tweezers.visible = false;
  }

  private colorGems(plan: MixPlan | null) {
    this.gems.forEach((g, i) => {
      const p = plan?.gems[i];
      g.mesh.visible = !!p;
      if (!p) return;
      const m = g.mesh.material as THREE.MeshPhysicalMaterial;
      const col = new THREE.Color(p.color);
      m.color.copy(col);
      m.attenuationColor.copy(col);
      m.emissive.copy(col);
      g.size = p.size;
    });
  }

  /** Gems tumbling inside a shaker that is being shaken: springs to their slots + the shaker's inertia. */
  private tumble(dt: number, acc: THREE.Vector3, energy: number, capOn: boolean) {
    const n = Math.max(1, Math.ceil(dt / (1 / 200)));
    const h = dt / n;
    for (let s = 0; s < n; s++) {
      for (const g of this.gems) {
        if (!g.mesh.visible) continue;
        const r = 0.24 * g.size;
        const ax = -70 * (g.pos.x - g.rest.x) - 5 * g.vel.x - acc.x + (Math.random() - 0.5) * 90 * energy;
        const ay = -70 * (g.pos.y - g.rest.y) - 5 * g.vel.y - acc.y + (Math.random() - 0.5) * 120 * energy;
        const az = -70 * (g.pos.z - g.rest.z) - 5 * g.vel.z + (Math.random() - 0.5) * 70 * energy;
        g.vel.x += ax * h;
        g.vel.y += ay * h;
        g.vel.z += az * h;
        g.pos.addScaledVector(g.vel, h);
        // walls
        const lim = shakerRadius(g.pos.y) - r - 0.02;
        const rad = Math.hypot(g.pos.x, g.pos.z);
        if (rad > lim) {
          const nx = g.pos.x / rad;
          const nz = g.pos.z / rad;
          g.pos.x = nx * lim;
          g.pos.z = nz * lim;
          const vn = g.vel.x * nx + g.vel.z * nz;
          if (vn > 0) {
            g.vel.x -= 1.6 * vn * nx;
            g.vel.z -= 1.6 * vn * nz;
            g.spin.x += vn * 3;
          }
        }
        const floor = SHAKER.floor + r * 0.9;
        if (g.pos.y < floor) {
          g.pos.y = floor;
          if (g.vel.y < 0) g.vel.y *= -0.45;
        }
        const ceil = capOn ? SHAKER.h + 0.5 - r : SHAKER.h - r;
        if (g.pos.y > ceil) {
          g.pos.y = ceil;
          if (g.vel.y > 0) g.vel.y *= -0.5;
        }
        g.spin.x += (Math.random() - 0.5) * energy * 40 * h;
        g.spin.z += (Math.random() - 0.5) * energy * 40 * h;
        g.spin.multiplyScalar(1 - 2.2 * h);
      }
    }
    for (const g of this.gems) {
      g.mesh.position.copy(g.pos);
      g.mesh.rotation.x += g.spin.x * dt;
      g.mesh.rotation.z += g.spin.z * dt;
    }
  }

  /* ───────────── every frame ───────────── */

  private lastT = -1;

  update(store: BarStore, camera: THREE.PerspectiveCamera) {
    // springs run on the same clock as the timeline (capped, so a hiccup doesn't fling things)
    const t = now();
    const dt = this.lastT < 0 ? 1 / 60 : Math.min(Math.max(t - this.lastT, 0), 1 / 20);
    this.lastT = t;
    const tau = t - store.t0;
    const ph = store.phase;
    const red = store.reduced;
    const c = store.cocktail;
    const plan = store.plan;
    const snapping = !!store.snap;
    const entered = ph !== this.lastPhase || store.t0 !== this.lastT0;
    this.sparkles.forEach((s) => (s.visible = false));
    if (entered) {
      this.lastPhase = ph;
      this.lastT0 = store.t0;
      this.entry = { x: this.rx.x, y: this.ry.x, s: this.rs.x };
      this.hideTransient();
      if (ph === "mix" || ph === "hold" || ph === "shake" || ph === "pour") this.colorGems(plan);
      if (ph === "mix") {
        this.cap.position.set(0, SHAKER.h + 3, 0);
        this.cap.rotation.set(0, 0, 0);
        this.cap.visible = false;
      }
      if (ph === "hold") {
        this.gems.forEach((g) => {
          g.pos.copy(g.rest);
          g.vel.set(0, 0, 0);
          g.mesh.scale.setScalar(g.size);
        });
      }
    }

    /* the rig follows its anchor (springs = the physical transitions between layouts) */
    const finalish = ph === "final";
    const shakerish = ph === "mix" || ph === "hold" || ph === "shake";
    const a = this.anchor(finalish ? store.anchors.final : store.anchors.main, camera, store.canvas);
    if (a) {
      const refH = shakerish ? 2.92 : 1.98;
      const s = a.h / refH;
      if (!this.placed || red || store.snap) {
        store.snap = false;
        this.rx.snap(a.x);
        this.ry.snap(a.y);
        this.rs.snap(s);
        this.placed = true;
      }
      this.rig.position.set(this.rx.step(a.x, dt), this.ry.step(a.y, dt), 0);
      this.rig.scale.setScalar(this.rs.step(s, dt));
    }

    /* ── word on the menu (hero) ── */
    let shownC = c;
    let swapX = 0;
    if (ph === "hero") {
      const w = t - store.wordT0;
      if (w < 0.55 && !red) {
        const out = w < 0.2;
        if (out) {
          swapX = -store.wordDir * easeIn(w / 0.2) * 2.6;
          shownC = this.shown ?? c;
        } else swapX = store.wordDir * (1 - backOut(seg(w, 0.2, 0.55), 1.2)) * 2.6;
      }
    }
    this.dress(shownC);
    const ready = shownC.status === "ready";

    /* ── the glass ── */
    let glassOn = false;
    let gx = 0,
      gy = 0,
      gRot = 0,
      gScale = 1;
    let fill = ready ? 1 : 0;
    let iceOn = [ready, ready, ready];
    let garnishOn = ready;
    let floatK = 0;
    let glassFade = 1;
    if (ph === "hero" || ph === "final") {
      glassOn = true;
      gx = swapX;
      floatK = 1;
    } else if (ph === "mix") {
      const k = red ? 1 : seg(tau, 0, 0.46);
      glassOn = k < 1;
      // hold the glass where it stood (the rig is already moving to the shaker's layout)…
      const rs = this.rig.scale.x || 1;
      gScale = this.entry.s / rs;
      gx = (this.entry.x - this.rig.position.x) / rs;
      gy = (this.entry.y - this.rig.position.y) / rs;
      // …and slide it off to the left
      gx -= (easeIn(k) * 6.5 * this.entry.s) / rs;
      gy += (Math.sin(k * Math.PI) * 0.15 * this.entry.s) / rs;
      gRot = easeIn(k) * 0.35;
    } else if (ph === "pour") {
      // the glass appears underneath once the shaker is up: fades in, rises a touch, settles
      const k = red ? 1 : seg(tau, 0.36, 0.7);
      glassOn = k > 0;
      gy = -(1 - backOut(k, 1.6)) * 0.35;
      gScale = 0.86 + 0.14 * backOut(k, 1.6);
      glassFade = Math.min(1, k * 1.6);
      fill = red ? 1 : easeInOut(seg(tau, 0.72, 1.72));
      iceOn = [0, 1, 2].map((i) => red || tau > 0.95 + i * 0.22);
      garnishOn = false;
    } else if (ph === "garnish") {
      glassOn = true;
    }
    this.glass.visible = glassOn;
    (this.glassShell.material as THREE.Material).userData.u.uFade.value = glassFade;
    (this.gShadow.material as THREE.MeshBasicMaterial).opacity = glassFade;
    if (glassOn) {
      const bob = floatK && !red ? Math.sin(t * 1.35) * 0.028 : 0;
      this.glass.position.set(gx, gy + bob, 0);
      this.glass.rotation.set(0, floatK && !red ? Math.sin(t * 0.42) * 0.22 : 0, gRot + (floatK && !red ? Math.sin(t * 0.9) * 0.012 : 0));
      this.glass.scale.setScalar(gScale);
      this.setFill(ready ? fill : 0);
      this.ice.forEach((m, i) => {
        const on = ready && iceOn[i];
        m.visible = on;
        if (!on) return;
        const base = ICE[i].p;
        let drop = 0;
        if (ph === "pour" && !red) {
          const k = seg(tau, 0.95 + i * 0.22, 1.3 + i * 0.22);
          drop = (1 - easeOut(k)) * 0.7 - Math.sin(k * Math.PI) * 0.05;
        }
        const ySurf = Math.min(base.y, this.surfaceY - 0.04);
        m.position.set(base.x, ySurf + drop + Math.sin(t * 1.6 + i * 2) * 0.012, base.z);
        m.rotation.y = i + t * 0.15;
        const sc = ph === "pour" ? clamp01(seg(tau, 0.95 + i * 0.22, 1.05 + i * 0.22) * 1.4) : 1;
        m.scale.setScalar(0.001 + sc);
      });
      this.liquid.visible = ready && fill > 0.015;
    }

    /* ── garnish: tweezers bring the olive, let go, plop ── */
    this.tweezers.visible = false;
    this.ripple.visible = false;
    if (ph === "garnish" && ready) {
      garnishOn = true;
      const held = { dx: 0.34, dy: 0.78, rot: 0.3 };
      let dx = 0,
        dy = 0,
        rot = 0;
      const tz = this.tweezers;
      if (red) {
        // just there
      } else if (tau < 0.92) {
        const k = easeOut(seg(tau, 0.28, 0.82));
        dx = held.dx + (1 - k) * 1.3;
        dy = held.dy + (1 - k) * 2.6;
        rot = held.rot;
        garnishOn = tau > 0.28;
      } else {
        const f = seg(tau, 0.92, 1.12);
        const k = easeIn(f);
        dx = held.dx * (1 - k);
        dy = held.dy * (1 - k);
        rot = held.rot * (1 - k);
        if (f >= 1) {
          // plop: a little bounce on the rim, then still
          const b = tau - 1.12;
          dy = Math.abs(Math.sin(b * 16)) * 0.12 * Math.exp(-b * 7);
          rot = Math.sin(b * 13) * 0.08 * Math.exp(-b * 6);
          const rk = clamp01(b / 0.55);
          this.ripple.visible = rk < 1;
          this.ripple.position.set(0.25, this.surfaceY + 0.01, 0.1);
          this.ripple.scale.setScalar(0.08 + easeOut(rk) * 0.5);
          (this.ripple.material as THREE.MeshBasicMaterial).opacity = (1 - rk) * 0.85;
        }
      }
      this.placeGarnish(dx, dy, rot);
      // tweezers hold the top of the pick, open, and leave
      if (!red && tau < 1.5 && tau > 0.28) {
        tz.visible = true;
        if (tau < 0.92) {
          this.garnish.updateMatrixWorld(true);
          this.heldTop.copy(this.garnish.localToWorld(this.tmp.set(0, this.pickLen, 0)));
          this.rig.worldToLocal(this.heldTop);
        }
        const leave = easeIn(seg(tau, 1.0, 1.45));
        tz.position.set(this.heldTop.x + leave * 1.6, this.heldTop.y - 0.06 + leave * 3, this.heldTop.z + 0.03);
        tz.rotation.set(0, 0, -0.5);
        const open = seg(tau, 0.86, 0.95);
        this.prongs[0].rotation.z = 0.02 + open * 0.09;
        this.prongs[1].rotation.z = -0.02 - open * 0.09;
      }
    } else {
      this.placeGarnish(0, 0, 0);
    }
    this.garnish.visible = glassOn && ready && garnishOn;

    /* the eye reads the room: follows the pointer, glances, blinks */
    if (this.garnish.visible) {
      this.olive.getWorldPosition(this.tmp);
      const viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const viewW = viewH * camera.aspect;
      let lx = clamp(((store.pointer.x * viewW) / 2 - this.tmp.x) / 2.2, -1, 1);
      let ly = clamp(((store.pointer.y * viewH) / 2 - this.tmp.y) / 2.2, -1, 1);
      if (t - store.pointer.t > 4) {
        // nobody's moving: it checks the room by itself
        const g = Math.sin(t * 0.7) + Math.sin(t * 1.9) * 0.5;
        lx = g > 0.9 ? 0.9 : g < -0.9 ? -0.9 : 0;
        ly = 0.1;
      }
      if (ph === "garnish") {
        const b = tau - 1.25;
        lx = b < 0 ? 0 : b < 0.2 ? -1 : b < 0.42 ? 1 : 0;
        ly = b > 0 && b < 0.42 ? -0.2 : 0;
      }
      // the olive leans with the pick: turn "look left/right" into its own frame
      const ga = -(this.garnishAng + this.glass.rotation.z);
      const llx = lx * Math.cos(ga) - ly * Math.sin(ga);
      const lly = lx * Math.sin(ga) + ly * Math.cos(ga);
      this.eye.rotation.y = this.lookSp.x.step(llx * 0.55, dt);
      this.eye.rotation.x = this.lookSp.y.step(-lly * 0.4, dt);
      if (t > this.blinkAt + 0.16) this.blinkAt = t + 2.8 + Math.random() * 3;
      const blinking = t > this.blinkAt && !red;
      this.eye.scale.y = blinking ? 0.1 : 1;
    }

    /* ── the shaker ── */
    const shakerOn = ph === "mix" || ph === "hold" || ph === "shake" || (ph === "pour" && tau < T.pour);
    this.shaker.visible = shakerOn;
    let shX = 0,
      shY = 0,
      shR = 0,
      shSY = 1;
    let capOn = false;
    let intensity = 0;
    if (ph === "mix") {
      // drops in from above, lands with a little squash
      const land = 0.48;
      if (red) {
        shY = 0;
      } else if (tau < land) {
        shY = (1 - easeIn(seg(tau, 0.08, land))) * 5;
      } else {
        const b = tau - land;
        shSY = 1 - 0.08 * Math.exp(-b * 9) * Math.cos(b * 26);
      }
      // gems arrive with each pour
      if (plan) {
        plan.steps.forEach((st) => {
          st.glasses.forEach((gl, k) => {
            const u = tau - st.start;
            const gem = this.gems[gl.gem];
            this.pourGem(gem, u - k * 0.05, gl.side, red, gl.gem);
            // a two-shot pour from one glass drops a second gem
          });
        });
        plan.gems.forEach((pg, i) => {
          const owner = plan.steps[pg.step];
          if (owner.glasses.some((g) => g.gem === i)) return;
          this.pourGem(this.gems[i], tau - owner.start - 0.16, owner.glasses[0].side, red, i);
        });
        this.pours(tau, plan, red, c);
        // cap on at the end
        const capT = tau - plan.end;
        if (capT > 0) {
          capOn = true;
          this.cap.visible = true;
          const k = red ? 1 : easeIn(seg(capT, 0, 0.28));
          this.cap.position.set(0, SHAKER.h + (1 - k) * 2.6, 0);
          if (capT > 0.28 && !red) shSY *= 1 - 0.05 * Math.exp(-(capT - 0.28) * 10) * Math.cos((capT - 0.28) * 30);
        } else this.cap.visible = false;
      }
    } else if (ph === "hold" || ph === "shake") {
      capOn = true;
      this.cap.visible = true;
      this.cap.position.set(0, SHAKER.h, 0);
      this.hideTransient();
      let I: number;
      let hz: number;
      if (ph === "hold") {
        if (snapping) this.sI.snap(store.hold);
        I = this.sI.step(red ? 0 : store.hold, dt);
        hz = 2.4 + 3.8 * I;
      } else {
        const k = seg(tau, 0, 0.62);
        I = red ? 0 : Math.sin(Math.PI * Math.min(1, k * 1.15)) * 1.65 + (k < 0.15 ? 0.6 : 0);
        I = Math.max(0, I);
        this.sI.snap(0);
        hz = 6.5;
      }
      intensity = I;
      this.phase += dt * Math.PI * 2 * hz;
      const amp = Math.pow(I, 1.15);
      // a diagonal throw (up-right / down-left) with the wrist rolling a beat behind
      const tx = 0.11 * amp * Math.sin(this.phase);
      const ty = 0.24 * amp * Math.sin(this.phase) + 0.04 * amp;
      const tr = -0.15 * amp * Math.sin(this.phase + 0.9) - 0.03 * amp * Math.sin(this.phase * 0.31);
      shX = this.sx.step(tx, dt);
      shY = this.sy.step(ty, dt);
      shR = this.sr.step(tr, dt);
      if (ph === "shake") shSY = 1 + 0.05 * Math.sin(this.phase * 2) * Math.min(1, I);
      // the gems feel the shaker's acceleration
      const off = this.tmp.set(shX, shY, 0);
      const vel = this.tmp2.copy(off).sub(this.prevOff).divideScalar(Math.max(dt, 1e-3));
      const acc = vel.clone().sub(this.prevVel).divideScalar(Math.max(dt, 1e-3)).multiplyScalar(0.55);
      acc.applyAxisAngle(new THREE.Vector3(0, 0, 1), -shR);
      this.prevOff.copy(off);
      this.prevVel.copy(vel);
      if (acc.length() > 260) acc.setLength(260);
      this.tumble(dt, red ? new THREE.Vector3() : acc, red ? 0 : I * 0.6, true);
      this.shakeRest = I < 0.01;
    } else if (ph === "pour") {
      // cap pops off, shaker rises and tips, then leaves
      this.hideTransient();
      // the cap pops straight up and away before anything tips
      const capK = red ? 1 : seg(tau, 0, 0.4);
      this.cap.visible = capK < 1;
      this.cap.position.set(easeIn(capK) * 0.9, SHAKER.h + easeOut(Math.min(1, capK * 3)) * 0.35 + easeIn(capK) * 5, 0);
      this.cap.rotation.z = -easeIn(capK) * 1.4;
      // lift, then tip around its middle (not its base), pour, and leave
      const lift = red ? 1 : easeInOut(seg(tau, 0.08, 0.46));
      const tip = red ? 1 : easeInOut(seg(tau, 0.26, 0.66));
      const leave = red ? 0 : easeIn(seg(tau, 1.78, T.pour));
      const C = SHAKER.h / 2;
      shR = POUR_POSE.rot * tip - leave * 0.9;
      const cx = POUR_POSE.cx * lift + leave * 2.4;
      const cy = C + (POUR_POSE.cy - C) * lift + leave * 3.2;
      shX = cx + Math.sin(shR) * C;
      shY = cy - Math.cos(shR) * C;
      // gems pour out, one after another
      this.gems.forEach((g, i) => {
        if (!plan?.gems[i]) return;
        const k = red ? 1 : seg(tau, 0.75 + i * 0.16, 0.95 + i * 0.16);
        g.mesh.scale.setScalar(g.size * (1 - easeIn(k)) + 0.001);
        g.mesh.position.lerp(this.tmp.set(-0.1, SHAKER.h - 0.4, 0), k * 0.4);
      });
    }
    this.shaker.position.set(shX, shY, 0);
    this.shaker.rotation.set(0, ph === "mix" || ph === "hold" ? Math.sin(t * 0.5) * 0.12 : 0, shR);
    this.shakerInner.scale.set(1 / Math.sqrt(shSY), shSY, 1 / Math.sqrt(shSY));
    store.intensity = intensity;
    if (!capOn && ph !== "pour") this.cap.visible = false;

    /* the stream out of the shaker into the glass */
    if (ph === "pour" && !red) {
      const head = easeIn(seg(tau, 0.6, 0.86));
      const tail = easeIn(seg(tau, 1.55, 1.8));
      const rimLocal = new THREE.Vector3(-shakerRadius(SHAKER.h) + 0.05, SHAKER.h + 0.02, 0.05);
      const from = this.shaker.localToWorld(rimLocal.clone());
      this.rig.worldToLocal(from);
      const dir = new THREE.Vector3(-Math.sin(shR), Math.cos(shR), 0).normalize();
      const to = new THREE.Vector3(0.06, Math.max(0.98, this.surfaceY - 0.05), 0.15);
      const cols = plan ? [...plan.gems.map((g) => new THREE.Color(g.color)), new THREE.Color(c.liquid)] : [new THREE.Color(c.liquid)];
      this.stream(0, from, dir, to, tail, head, cols, 0.075);
      this.streams[1].mesh.visible = false;
      // ice drops sparkle as they land
      for (let i = 0; i < 3; i++) this.sparkle(i, this.tmp.set(ICE[i].p.x, this.surfaceY + 0.05, ICE[i].p.z + 0.2), tau - (1.15 + i * 0.22), new THREE.Color(c.liquid), 0.42);
    } else if (ph !== "mix") {
      this.streams.forEach((s) => (s.mesh.visible = false));
    }

    /* floor: a shadow under the shaker (stays on the floor while it lifts), and under the glass
       its own shadow plus a glow the colour of the drink, like light through a full glass */
    const shakerLift = Math.max(0, shY - (ph === "pour" ? 0 : 0));
    this.shadow.visible = shakerOn && ph !== "pour";
    this.shadow.position.set(shX * 0.5, 0.002, 0.05);
    this.shadow.scale.set(1.55 * (1 - Math.min(0.5, shakerLift * 0.12)), 0.8, 1);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 1 - Math.min(0.9, shakerLift * 0.3);
    this.gShadow.visible = glassOn;
    this.gShadow.scale.set(1.2, 0.62, 1);
    this.glow.visible = glassOn && ready && fill > 0.15;
    this.glow.scale.set(2.3 * fill, 1.2 * fill, 1);
    this.glowMat.opacity = 0.5 * fill;
  }

  /** One shot glass (or two) for the current pours, and their streams. */
  private pours(tau: number, plan: MixPlan, red: boolean, c: Cocktail) {
    let used = 0;
    this.shots.forEach((s) => (s.g.visible = false));
    this.streams.forEach((s) => (s.mesh.visible = false));
    if (red) return;
    for (const st of plan.steps) {
      const u = tau - st.start;
      if (u < 0 || u > T.step) continue;
      for (const gl of st.glasses) {
        if (used >= this.shots.length) break;
        const shot = this.shots[used];
        const sx = gl.side === "left" ? -1 : 1;
        const P = { x: sx * 0.98, y: 2.66 };
        const F = { x: sx * 3.6, y: 4.4 };
        const kin = backOut(seg(u, 0, STEP.inEnd), 1.1);
        const kout = easeIn(seg(u, STEP.outStart, T.step));
        const tilt = easeInOut(seg(u, 0.24, STEP.tiltEnd)) * (1 - easeInOut(seg(u, STEP.streamEnd - 0.06, STEP.outStart + 0.12)));
        const g = shot.g;
        g.visible = true;
        g.scale.setScalar(gl.size);
        g.position.set(F.x + (P.x - F.x) * kin + kout * sx * 2.6, F.y + (P.y - F.y) * kin + kout * 2.2, 0.35);
        // tip toward the shaker: the left glass turns clockwise, the right one counter-clockwise
        g.rotation.set(0, 0, sx * (0.25 * kin + 1.72 * tilt));
        const col = new THREE.Color(gl.color);
        shot.liqMat.color.copy(col);
        shot.liqMat.emissive.copy(col);
        const left = 1 - easeInOut(seg(u, STEP.streamStart + 0.06, STEP.streamEnd - 0.04));
        shot.liq.scale.set(1, Math.max(0.02, left), 1);
        shot.liq.visible = left > 0.03;
        // stream from the lip into the shaker
        const head = easeIn(seg(u, STEP.streamStart, STEP.land));
        const tail = easeIn(seg(u, STEP.streamEnd - 0.2, STEP.streamEnd));
        if (head > 0) {
          g.updateMatrixWorld();
          const lip = g.localToWorld(new THREE.Vector3(-sx * SHOT.lip * 0.92, SHOT.h, 0));
          this.rig.worldToLocal(lip);
          const dir = new THREE.Vector3(-sx * 0.55, -0.4, 0).normalize();
          const to = new THREE.Vector3(sx * 0.14, 1.55, 0.25);
          this.stream(used, lip, dir, to, tail, head, [col, col], 0.05 * gl.size);
        }
        used++;
      }
    }
    void c;
  }

  /** One gem: appears where the liquid lands, drops to its slot, bounces once. */
  private pourGem(gem: Gem | undefined, u: number, side: "left" | "right", red: boolean, i: number) {
    if (!gem) return;
    const landAt = STEP.land;
    if (red) {
      gem.mesh.position.copy(gem.rest);
      gem.mesh.scale.setScalar(gem.size);
      gem.pos.copy(gem.rest);
      return;
    }
    if (u < landAt) {
      gem.mesh.scale.setScalar(0.001);
      return;
    }
    const sx = side === "left" ? -1 : 1;
    const v = u - landAt;
    const start = new THREE.Vector3(sx * 0.14, 1.62, 0.25);
    const fall = easeIn(clamp01(v / 0.3));
    const p = start.clone().lerp(gem.rest, fall);
    if (v > 0.3) {
      const b = v - 0.3;
      p.y += Math.abs(Math.sin(b * 14)) * 0.09 * Math.exp(-b * 8);
    }
    gem.mesh.position.copy(p);
    gem.pos.copy(gem.mesh.position);
    const grow = backOut(clamp01(v / 0.2), 2.2);
    gem.mesh.scale.setScalar(Math.max(0.001, gem.size * grow));
    gem.mesh.rotation.set(i * 0.9 + v * 2 * (1 - fall), i * 1.7, i * 0.5);
    // the moment it turns from liquid to gem
    this.sparkle(i, this.tmp.copy(start).add(this.tmp2.set(0, 0.05, 0.3)), v, new THREE.Color((gem.mesh.material as THREE.MeshPhysicalMaterial).color), 0.3);
  }
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** The part of a curve between two points along it (a stream that hasn't reached, or has left) */
class SubCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private full: THREE.Curve<THREE.Vector3>,
    private a: number,
    private b: number
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    return this.full.getPoint(this.a + (this.b - this.a) * t, target);
  }
}

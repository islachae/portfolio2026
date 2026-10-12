/**
 * Jellycat of the Day: the claw machine and the game, in plain three.js (no React in here).
 * JellycatOfTheDay.tsx makes one of these on its canvas and talks to it through a few methods
 * (setDir, nudge, drop, again) and three callbacks (onBusy, onPrize, onMiss).
 *
 *   idle → down → close → up → carry → release → reveal → shown → back → idle
 *                          ↘ (slipped or empty) → home → idle
 */
import * as THREE from "three";
import { jellycats, type Jellycat } from "@/content/jellycats";
import { col, furSway, rbox } from "./fur";
import { makePlush } from "./plush";

export type GameEvents = {
  onBusy: (busy: boolean) => void;
  onPrize: (j: Jellycat) => void;
  onMiss: (kind: "slip" | "empty") => void;
};

type State = "idle" | "down" | "close" | "up" | "carry" | "release" | "reveal" | "shown" | "back" | "home";
type Prize = { j: Jellycat; group: THREE.Group; home: THREE.Vector3; s: number; vy: number; squashT: number };

const S = 0.64; // default size in the machine
const MW = 7.8, HW = MW / 2; // machine width: four plush side by side
const DECK = 2.46, RAILZ = 0.2, HOME_Y = 5.0;
const CHUTE = -(HW - 1.0), DOORX = -(HW - 1.4), KX = -0.45;
const X_MIN = CHUTE, X_MAX = HW - 0.45;
const REVEAL = new THREE.Vector3(DOORX + 1.0, 0, 6.0);
const PI = Math.PI; // physically based lights: ×π gives the brightness these numbers were tuned at

const ease = (t: number) => {
  t = Math.min(1, Math.max(0, t));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class ClawGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  private floorMat = new THREE.ShadowMaterial({ opacity: 0.2 });
  private prizes: Prize[] = [];
  private car!: THREE.Mesh;
  private cable!: THREE.Mesh;
  private hub!: THREE.Mesh;
  private knob!: THREE.Mesh;
  private fingers: { turn: THREE.Group; open: THREE.Group }[] = [];

  private clawX = CHUTE;
  private hubY = HOME_Y;
  private openA = 0.1;
  private dir = 0;
  private state: State = "idle";
  private t = 0;
  private from = { hub: 0, to: 0, x: 0 };
  private held: Prize | null = null;
  private target: Prize | null = null;
  private holdOffset = 0;
  private willSlip = false;
  private slipped: Prize | null = null;
  private landed: Prize | null = null;

  private cam = { from: this.blankView(), to: this.blankView(), now: this.blankView(), k: 1, view: "machine" as "machine" | "reveal" };
  private raf = 0;
  private last = 0;
  private running = false;
  private ro: ResizeObserver;
  private viewRot = new THREE.Matrix3();
  private slow = 0;
  private frames = 0;
  private fpsT = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private host: HTMLElement,
    private events: GameEvents,
    private reduced: () => boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.build();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.machineView(this.cam.now);
    this.syncTheme();
  }

  /* ── scene ── */

  private build() {
    const sc = this.scene;
    sc.add(new THREE.HemisphereLight(col(0xffffff), col(0xe3dcea), 0.62 * PI));
    const key = new THREE.DirectionalLight(col(0xfff0d8), 0.7 * PI);
    key.position.set(-5, 10, 11);
    key.target.position.set(0, 2.5, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.05;
    key.shadow.radius = 3;
    sc.add(key, key.target);
    const inside = new THREE.PointLight(col(0xffd8cc), 0.55 * PI, 0, 0); // the warm glow in the window
    inside.position.set(0, 6.1, 0.4);
    sc.add(inside);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    sc.add(floor);

    // lilac and matte, like a desk toy: deep window, lit header, warm glow inside
    const LAV = 0xc9b6e0, LAV_D = 0xb39ed1;
    const solid = (geo: THREE.BufferGeometry, hex: number, rough = 1, cast = true) => {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col(hex), roughness: rough, metalness: 0 }));
      m.receiveShadow = true;
      m.castShadow = cast;
      sc.add(m);
      return m;
    };
    const roundBox = (w: number, h: number, d: number, r: number) => rbox(w, h, d, r, 0.25);
    solid(roundBox(MW, 2.4, 4.3, 0.16), LAV, 0.85).position.y = 1.2;
    solid(new THREE.BoxGeometry(MW - 0.4, 0.06, 3.9), 0xf6e8ec, 1, false).position.y = DECK - 0.03;
    for (const sx of [-1, 1]) {
      solid(new THREE.BoxGeometry(0.2, 4.4, 4.3), LAV, 0.9, false).position.set(sx * (HW - 0.1), 4.6, 0);
      solid(roundBox(0.5, 4.4, 0.4, 0.08), LAV, 0.85, false).position.set(sx * (HW - 0.25), 4.6, 1.95);
    }
    solid(roundBox(MW, 1.15, 4.3, 0.16), LAV, 0.85, false).position.y = 7.3;
    const lightbox = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.7, 0.62), new THREE.MeshBasicMaterial({ color: col(0xf7f2fc) }));
    lightbox.position.set(0, 7.3, 2.153);
    sc.add(lightbox);
    solid(new THREE.BoxGeometry(MW - 0.5, 0.14, 0.32), LAV_D, 0.9, false).position.set(0, 6.72, 1.98);
    const back = solid(new THREE.PlaneGeometry(MW - 0.4, 4.4), 0xf5d0d8, 1, false);
    back.position.set(0, 4.6, -2.05);
    (back.material as THREE.MeshStandardMaterial).emissive = col(0x3a2027);
    solid(roundBox(1.5, 0.9, 0.06, 0.03), LAV_D, 0.9, false).position.set(DOORX, 1.0, 2.15);
    const hole = solid(new THREE.PlaneGeometry(0.95, 0.95), 0x6d5a8a, 1, false);
    hole.rotation.x = -Math.PI / 2;
    hole.position.set(CHUTE, DECK + 0.004, RAILZ);
    const chute = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false }));
    chute.position.set(CHUTE, DECK + 0.3, RAILZ);
    sc.add(chute);
    solid(roundBox(MW - 0.5, 0.28, 0.9, 0.1), LAV_D, 0.85).position.set(0, 2.32, 2.35);
    solid(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 12), 0xd8d4de, 0.4).position.set(KX, 2.67, 2.4);
    this.knob = solid(new THREE.SphereGeometry(0.15, 20, 14), 0xfaf8fc, 0.35);
    this.knob.position.set(KX, 2.9, 2.4);
    solid(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24), 0xfaf8fc, 0.4).position.set(KX + 1.2, 2.51, 2.4);
    solid(new THREE.PlaneGeometry(0.42, 0.42), 0x1d1a22, 0.6, false).position.set(HW - 1.0, 1.0, 2.153);
    solid(new THREE.BoxGeometry(MW - 0.8, 0.1, 0.1), 0xd9d5df, 0.5, false).position.set(0, 6.5, RAILZ);

    // the claw: carriage on the rail, a cable, a hub, three curved fingers that open and close
    this.car = solid(new THREE.BoxGeometry(0.6, 0.3, 0.5), 0xe9e7ee, 0.4, false);
    this.car.position.set(0, 6.4, RAILZ);
    this.cable = solid(new THREE.CylinderGeometry(0.025, 0.025, 1, 8), 0x8d8f96, 0.5, false);
    this.hub = solid(new THREE.CylinderGeometry(0.2, 0.26, 0.3, 20), 0xeceaf0, 0.3, false);
    const fingerMat = new THREE.MeshStandardMaterial({ color: col(0xe4e3ea), roughness: 0.25 });
    for (let k = 0; k < 3; k++) {
      const arc = 2.25, R = 0.56;
      const fg = new THREE.TorusGeometry(R, 0.045, 8, 20, arc);
      fg.rotateZ(Math.PI / 2 - arc);
      fg.translate(0, -R, 0);
      const turn = new THREE.Group();
      turn.rotation.y = (k * Math.PI * 2) / 3 + 0.5;
      const open = new THREE.Group();
      turn.add(open);
      open.add(new THREE.Mesh(fg, fingerMat));
      sc.add(turn);
      this.fingers.push({ turn, open });
    }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.6, 4.1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, depthWrite: false }));
    glass.position.set(0, 4.55, 2.08);
    sc.add(glass);
    for (const [x, w] of [[-1.7, 0.5], [-1.0, 0.2]]) {
      const st = new THREE.Mesh(new THREE.PlaneGeometry(w, 3.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false }));
      st.position.set(x, 4.6, 2.09);
      st.rotation.z = -0.5;
      sc.add(st);
    }

    for (const j of jellycats) {
      const group = new THREE.Group();
      group.add(makePlush[j.id]());
      const s = j.scale ?? S;
      const home = new THREE.Vector3(j.x, DECK, RAILZ);
      group.position.copy(home);
      group.rotation.y = j.yaw;
      group.scale.setScalar(s);
      sc.add(group);
      this.prizes.push({ j, group, home, s, vy: 0, squashT: 0 });
    }
  }

  /** The floor shadow takes its colour from the page (light or dark). */
  syncTheme() {
    const cs = getComputedStyle(this.host);
    const c = cs.getPropertyValue("--jc-shadow").trim();
    const a = parseFloat(cs.getPropertyValue("--jc-shadow-a"));
    if (c) this.floorMat.color.set(c);
    if (!Number.isNaN(a)) this.floorMat.opacity = a;
  }

  /* ── camera ── */

  private blankView() {
    return { p: new THREE.Vector3(), t: new THREE.Vector3() };
  }
  /** Straight on and close: the lit header at the top, the controls at the bottom; the base can fall out of frame. */
  private machineView(out: { p: THREE.Vector3; t: THREE.Vector3 }) {
    const tan = Math.tan((this.camera.fov * Math.PI) / 360);
    const d = Math.max(3.4 / tan, (HW + 0.2) / (tan * this.camera.aspect));
    // a tall stage (phones) keeps the header near the top instead of floating mid-air
    const y = Math.min(4.8, 8.0 - 0.94 * d * tan);
    out.t.set(0, y, 0);
    out.p.set(0, y + d * 0.045, d);
    return out;
  }
  private revealView(out: { p: THREE.Vector3; t: THREE.Vector3 }) {
    const tan = Math.tan((this.camera.fov * Math.PI) / 360);
    // the plush fills the top half; the prize card covers the bottom half
    const d = Math.max(2.45 / tan, 1.1 / (tan * this.camera.aspect));
    out.t.set(REVEAL.x, 0.25, REVEAL.z);
    out.p.set(REVEAL.x, 0.25 + d * 0.12, REVEAL.z + d);
    return out;
  }
  private goCam(view: "machine" | "reveal") {
    const c = this.cam;
    c.view = view;
    c.from.p.copy(c.now.p);
    c.from.t.copy(c.now.t);
    if (view === "machine") this.machineView(c.to);
    else this.revealView(c.to);
    c.k = this.reduced() ? 1 : 0;
  }
  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const c = this.cam;
    if (c.view === "machine") this.machineView(c.to);
    else this.revealView(c.to);
    if (c.k >= 1) {
      c.now.p.copy(c.to.p);
      c.now.t.copy(c.to.t);
    }
    if (!this.running) this.render();
  }

  /* ── input ── */

  setDir(d: number) {
    this.dir = d;
  }
  /** A drag across the stage, in pixels. */
  nudge(dx: number) {
    if (this.state !== "idle") return;
    this.clawX = Math.min(X_MAX, Math.max(X_MIN, this.clawX + dx * (9 / Math.max(320, this.host.clientWidth))));
  }
  get idle() {
    return this.state === "idle";
  }
  get showing() {
    return this.state === "shown";
  }

  drop() {
    if (this.state !== "idle") return;
    let best = 9;
    this.target = null;
    for (const p of this.prizes) {
      const dx = Math.abs(p.group.position.x - this.clawX);
      if (dx < best && p.group.position.y >= DECK - 0.01) {
        best = dx;
        this.target = p;
      }
    }
    if (best > 0.5) this.target = null;
    // dead centre catches almost always; off to the side it starts to slip
    const chance = this.target ? Math.min(0.92, Math.max(0, 1.08 - best / 0.42)) : 0;
    this.willSlip = Math.random() > chance;
    this.from.hub = this.hubY;
    this.from.to = this.target ? DECK + this.target.j.top * this.target.s + 0.06 : DECK + 0.95;
    this.state = "down";
    this.t = 0;
    this.events.onBusy(true);
  }

  again() {
    if (this.state !== "shown") return;
    this.state = "back";
    this.t = 0;
    this.goCam("machine");
  }

  /* ── the loop ── */

  setActive(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) {
      this.last = performance.now();
      this.fpsT = this.last;
      this.frames = 0;
      this.raf = requestAnimationFrame(this.frame);
    } else {
      cancelAnimationFrame(this.raf);
      this.render();
    }
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(1 / 30, (now - this.last) / 1000 || 1 / 60);
    this.last = now;
    this.step(dt);
    this.render();
    // a slow device trades sharpness for smoothness, never the other way round
    this.frames++;
    if (now - this.fpsT > 600) {
      const span = now - this.fpsT, fps = (this.frames * 1000) / span;
      this.slow = span < 1500 && fps < 38 ? this.slow + 1 : 0;
      if (this.slow >= 3 && this.renderer.getPixelRatio() > 1) {
        this.renderer.setPixelRatio(Math.max(1, this.renderer.getPixelRatio() - 0.5));
        this.resize();
        this.slow = 0;
      }
      this.frames = 0;
      this.fpsT = now;
    }
  };

  render() {
    this.camera.position.copy(this.cam.now.p);
    this.camera.lookAt(this.cam.now.t);
    this.camera.updateMatrixWorld();
    this.viewRot.setFromMatrix4(this.camera.matrixWorldInverse);
    furSway.value.set(0, -0.004, 0).applyMatrix3(this.viewRot);
    this.renderer.render(this.scene, this.camera);
  }

  step(dt: number) {
    this.t += dt;
    const t = this.t;
    switch (this.state) {
      case "idle":
        this.clawX = Math.min(X_MAX, Math.max(X_MIN, this.clawX + this.dir * 1.7 * dt));
        this.openA = lerp(this.openA, 0.1, 1 - Math.exp(-8 * dt));
        break;
      case "down":
        this.hubY = lerp(this.from.hub, this.from.to, ease(t / 1.15));
        this.openA = lerp(0.1, 0.6, Math.min(1, t / 0.5));
        if (t >= 1.15) this.to("close");
        break;
      case "close":
        this.openA = lerp(0.6, -0.12, ease(t / 0.45));
        if (t >= 0.45) {
          if (this.target) {
            this.held = this.target;
            this.holdOffset = this.hubY - this.held.group.position.y;
          }
          this.from.hub = this.hubY;
          this.to("up");
        }
        break;
      case "up": {
        this.hubY = lerp(this.from.hub, HOME_Y, ease(t / 1.2));
        const h = this.held;
        if (h) {
          h.group.position.y = this.hubY - this.holdOffset;
          h.group.rotation.z = Math.sin(t * 7) * 0.05;
          if (this.willSlip && t > 0.5) {
            this.slipped = h;
            h.vy = 0;
            this.held = null;
            this.openA = 0.25;
          }
        }
        if (t >= 1.2) {
          if (this.held) {
            this.from.x = this.clawX;
            this.to("carry");
          } else this.miss(this.target ? "slip" : "empty");
        }
        break;
      }
      case "carry": {
        const h = this.held!;
        const dur = Math.max(0.5, Math.abs(this.from.x - CHUTE) / 1.5);
        this.clawX = lerp(this.from.x, CHUTE, ease(t / dur));
        h.group.position.x = this.clawX;
        h.group.rotation.z = Math.sin(t * 5) * 0.06;
        if (t >= dur) {
          h.vy = 0;
          this.to("release");
        }
        break;
      }
      case "release": {
        const h = this.held!;
        this.openA = lerp(-0.12, 0.6, ease(t / 0.3));
        h.vy -= 14 * dt;
        h.group.position.y += h.vy * dt;
        if (h.group.position.y < DECK - 1.6) {
          h.group.visible = false;
          this.to("reveal");
          this.events.onPrize(h.j);
          this.goCam("reveal");
        }
        break;
      }
      case "reveal": {
        // out of the prize door, over to the front, full size
        const h = this.held!;
        const k = ease(t / 0.9);
        h.group.visible = true;
        h.group.position.set(lerp(DOORX, REVEAL.x, k), lerp(0.4, REVEAL.y, k) + Math.sin(Math.PI * k) * 1.2, lerp(2.5, REVEAL.z, k));
        h.group.scale.setScalar(lerp(h.s * 0.8, h.s / S, k));
        h.group.rotation.set(0, lerp(h.j.yaw, 0, k), 0);
        this.clawX = lerp(this.clawX, CHUTE, 0.1);
        this.openA = lerp(this.openA, 0.1, 0.1);
        if (t >= 0.9) this.to("shown");
        break;
      }
      case "shown": {
        const h = this.held!;
        if (!this.reduced()) {
          h.group.rotation.y = Math.sin(t * 0.8) * 0.35;
          const hop = (t % 3.2) / 0.5;
          h.group.position.y = hop < 1 ? Math.sin(Math.PI * hop) * 0.18 : 0;
        }
        break;
      }
      case "back": {
        const h = this.held!;
        const k = ease(t / 0.9);
        h.group.position.set(lerp(REVEAL.x, h.home.x, k), lerp(0, h.home.y, k) + Math.sin(Math.PI * k) * 1.5, lerp(REVEAL.z, h.home.z, k));
        h.group.scale.setScalar(lerp(h.s / S, h.s, k));
        h.group.rotation.set(0, lerp(0, h.j.yaw, k), 0);
        if (t >= 0.9) {
          h.group.position.copy(h.home);
          this.held = null;
          this.to("idle");
          this.events.onBusy(false);
        }
        break;
      }
      case "home": {
        const dh = Math.max(0.4, Math.abs(this.from.x - CHUTE) / 1.8);
        this.clawX = lerp(this.from.x, CHUTE, ease(t / dh));
        this.openA = lerp(this.openA, 0.1, 0.1);
        if (t >= dh) {
          this.to("idle");
          this.events.onBusy(false);
        }
        break;
      }
    }

    // a slipped plush tumbles back onto the pile and squashes
    const sl = this.slipped;
    if (sl) {
      sl.vy -= 14 * dt;
      sl.group.position.y += sl.vy * dt;
      sl.group.rotation.z *= 0.9;
      if (sl.group.position.y <= DECK) {
        sl.group.position.y = DECK;
        sl.squashT = 0;
        this.landed = sl;
        this.slipped = null;
      }
    }
    const ld = this.landed;
    if (ld) {
      ld.squashT += dt;
      const q = Math.exp(-5 * ld.squashT) * Math.sin(ld.squashT * 22) * 0.16;
      ld.group.scale.set(ld.s * (1 + q * 0.5), ld.s * (1 - q), ld.s * (1 + q * 0.5));
      if (ld.squashT > 1.2) {
        ld.group.scale.setScalar(ld.s);
        ld.group.rotation.z = 0;
        this.landed = null;
      }
    }

    // the claw rig follows clawX / hubY / openA
    this.car.position.x = this.clawX;
    this.hub.position.set(this.clawX, this.hubY, RAILZ);
    this.cable.position.set(this.clawX, (6.3 + this.hubY) / 2, RAILZ);
    this.cable.scale.y = 6.3 - this.hubY;
    for (const f of this.fingers) {
      f.turn.position.set(this.clawX, this.hubY - 0.05, RAILZ);
      f.open.rotation.z = this.openA;
    }
    this.knob.position.x = KX + (this.state === "idle" ? this.dir * 0.08 : 0);

    const c = this.cam;
    if (c.k < 1) {
      c.k = Math.min(1, c.k + dt / 1.1);
      const e = ease(c.k);
      c.now.p.lerpVectors(c.from.p, c.to.p, e);
      c.now.t.lerpVectors(c.from.t, c.to.t, e);
    }
  }

  private to(s: State) {
    this.state = s;
    this.t = 0;
  }
  private miss(kind: "slip" | "empty") {
    this.events.onMiss(kind);
    this.from.x = this.clawX;
    this.to("home");
  }

  /** Development only (screen recordings): put the claw somewhere, and make the next grab hold. */
  dev() {
    return {
      setX: (x: number) => (this.clawX = x),
      sure: () => (this.willSlip = false),
      step: (dt: number, n: number) => {
        for (let i = 0; i < n; i++) this.step(dt);
        this.render();
      },
    };
  }

  dispose() {
    this.setActive(false);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
      for (const mt of mats) {
        for (const v of Object.values(mt)) if (v instanceof THREE.Texture) v.dispose();
        mt.dispose();
      }
    });
    this.renderer.dispose();
  }
}

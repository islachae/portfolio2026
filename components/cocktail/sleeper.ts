/**
 * The sleepy face some garnishes have (Amae's cream, Yuánfèn's foam).
 *
 * It dozes: eyes closed, breathing, a z now and then. When the visitor comes close it wakes up
 * (eyes open, a blink now and then, a blush, a small hop) and leans toward them; when they
 * leave it nods off again. Build the character's own shapes into `body`.
 */
import * as THREE from "three";
import { arcGeometry, zTexture } from "./kit";
import { Spring } from "./spring";

/** The round part the face is drawn on: centre height, radius, vertical squash */
export type Dome = { y: number; r: number; sy: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
let zs: THREE.Texture | null = null;

export class Sleeper {
  /** breathes, leans and hops: add the character's shapes to it */
  readonly body = new THREE.Group();
  private eyesClosed = new THREE.Group();
  private eyesOpen = new THREE.Group();
  private smile: THREE.Mesh;
  private blushMat: THREE.MeshBasicMaterial;
  private z: THREE.Sprite[] = [];
  private awake = new Spring(0, 40, 9);
  private wasAwake = false;
  private wakeT = -10;
  private leanSp = new Spring(0, 30, 8);
  private blinkAt = 2;

  /**
   * @param dome  what the face sits on
   * @param f     where its features are (x, y in the body's units; x is mirrored for the pair):
   *              `size` scales the features (1 suits a dome of radius 0.4); `z` is where the z's start
   */
  constructor(
    private dome: Dome,
    private f: { eye: [number, number]; smile: number; blush: [number, number]; z: [number, number]; size?: number; blushColor?: THREE.ColorRepresentation }
  ) {
    const k = f.size ?? 1;
    const ink = new THREE.MeshBasicMaterial({ color: 0x2b1d20 });
    this.blushMat = new THREE.MeshBasicMaterial({ color: f.blushColor ?? 0xff7da0, transparent: true, opacity: 0.3, depthWrite: false });
    const pupil = new THREE.MeshPhysicalMaterial({ color: 0x23171a, roughness: 0.1, clearcoat: 1 });
    const glint = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const sx of [-1, 1]) {
      // asleep: two content curves; awake: two shiny dots
      const at = this.onDome(sx * f.eye[0], f.eye[1]);
      const lid = new THREE.Mesh(arcGeometry(0.042 * k, Math.PI + 0.3, 2 * Math.PI - 0.3, 0.011 * k), ink);
      lid.position.copy(at);
      lid.rotation.y = Math.atan2(at.x, at.z) * 0.9;
      this.eyesClosed.add(lid);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03 * k, 20, 14), pupil);
      eye.scale.set(0.85, 1.12, 0.4);
      eye.position.copy(at);
      const gl = new THREE.Mesh(new THREE.SphereGeometry(0.009 * k, 10, 8), glint);
      gl.position.copy(at).add(new THREE.Vector3(0.01 * k, 0.014 * k, 0.012 * k));
      this.eyesOpen.add(eye, gl);
      const bat = this.onDome(sx * f.blush[0], f.blush[1], 0.004);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.045 * k, 24), this.blushMat);
      blush.scale.set(1.3, 0.75, 1);
      blush.position.copy(bat);
      blush.rotation.y = Math.atan2(bat.x, bat.z);
      blush.renderOrder = 6;
      this.body.add(blush);
    }
    this.smile = new THREE.Mesh(arcGeometry(0.03 * k, Math.PI + 0.5, 2 * Math.PI - 0.5, 0.0095 * k), ink);
    this.smile.position.copy(this.onDome(0, f.smile));
    this.eyesOpen.visible = false;
    this.body.add(this.eyesClosed, this.eyesOpen, this.smile);
    zs ??= zTexture();
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zs, transparent: true, depthWrite: false }));
      s.visible = false;
      s.renderOrder = 7;
      this.z.push(s);
      this.body.add(s);
    }
  }

  /** A point on the front of the dome (to put something on its face) */
  onDome(x: number, y: number, lift = 0.008) {
    const d = this.dome;
    return new THREE.Vector3(x, y, Math.sqrt(Math.max(1e-4, d.r * d.r - x * x - ((y - d.y) / d.sy) ** 2)) + lift);
  }

  /**
   * Every frame.
   * @returns how awake it is (0–1)
   */
  step(
    t: number,
    dt: number,
    o: {
      /** the visitor is close enough to wake it */
      near: boolean;
      /** which side they are on, −1…1 (0 when nobody is there) */
      toward: number;
      red: boolean;
      /** z's may float up (only around a finished drink) */
      dream: boolean;
      /** pressed flat for a moment (something landed on it) */
      squish?: number;
      /** how far it leans toward the visitor when awake (radians) */
      lean?: number;
    }
  ) {
    const red = o.red;
    if (red) this.awake.snap(o.near ? 1 : 0);
    const aw = clamp01(this.awake.step(o.near ? 1 : 0, dt));
    const up = aw > 0.5;
    if (up && !this.wasAwake) this.wakeT = t;
    this.wasAwake = up;
    if (t > this.blinkAt + 0.14) this.blinkAt = t + 2.2 + Math.random() * 2.5;
    const blink = up && t > this.blinkAt && !red;
    this.eyesOpen.visible = up && !blink;
    this.eyesClosed.visible = !up || blink;
    this.blushMat.opacity = 0.3 + 0.45 * aw;
    this.smile.scale.set(1 + 0.3 * aw, 1 + 0.7 * aw, 1);
    // leans toward you when you're there; otherwise a slow, sleepy sway
    const reach = o.lean ?? 0.15;
    const lean = this.leanSp.step(red ? 0 : -o.toward * (reach * 0.2 + reach * aw) + (1 - aw) * Math.sin(t * 0.8) * 0.02, dt);
    const w = t - this.wakeT;
    const hop = red ? 0 : Math.abs(Math.sin(w * 11)) * 0.05 * Math.exp(-w * 5);
    const breath = red ? 0 : Math.sin(t * 1.7) * 0.03 * (1 - aw);
    const squish = o.squish ?? 0;
    const wide = (1 + breath * 0.3) * (1 + squish * 0.6);
    this.body.scale.set(wide, (1 + breath) * (1 - squish), wide);
    this.body.rotation.z = lean;
    this.body.position.y = hop;
    // z's float up while it sleeps
    const [zx, zy] = this.f.z;
    const k = this.f.size ?? 1;
    const dir = Math.sign(zx) || 1;
    this.z.forEach((z, i) => {
      const cyc = 2.8;
      const age = ((t + (i * cyc) / 2) % cyc) / cyc;
      const on = !red && o.dream && aw < 0.25;
      z.visible = on;
      if (!on) return;
      z.position.set(zx + dir * (age * 0.16 * k) + Math.sin(age * 6 + i) * 0.03 * k, zy + age * 0.4 * k, 0.1);
      z.scale.setScalar((0.09 + age * 0.09) * k);
      z.material.opacity = Math.sin(age * Math.PI) * (1 - aw * 4);
    });
    return aw;
  }
}

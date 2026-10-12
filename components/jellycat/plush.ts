/**
 * The plush in the claw machine, each one a group standing on the floor at its origin, facing +z.
 * Units: the sun's body is 2 across. They're scaled down in the machine (content/jellycats.ts).
 */
import * as THREE from "three";
import type { JellycatId } from "@/content/jellycats";
import { col, cordLegs, face, furMaterial, furPart, merge, rbox, sstep, surface } from "./fur";

const zSeam = (p: THREE.Vector3) => 1 - sstep(0, 0.055, Math.abs(p.z));
const none = () => 0;

/** A plump disc of a sun with eight soft rays, sitting on two corduroy boots. */
function sun() {
  const C = 0.6, P = 1.3, FLAT = -0.82;
  const bz = (x: number, y: number) => C * Math.pow(Math.sqrt(Math.max(0, 1 - x * x - y * y)), P);
  const bodyGeo = surface(
    (u, v, p) => {
      const th = u * Math.PI * 2, ph = v * Math.PI, r = Math.sin(ph), zc = Math.cos(ph);
      let y = r * Math.sin(th);
      if (y < FLAT) y = FLAT + (y - FLAT) * 0.25; // it sits: the bottom is pressed flat
      p.set(r * Math.cos(th), y, C * (zc < 0 ? -1 : 1) * Math.pow(Math.abs(zc), P));
    },
    72,
    48,
    zSeam,
  );
  const RL = 0.56, RA = 0.31, RB = 0.22, RY = -0.16;
  const rayGeo = surface(
    (u, v, p) => {
      const th = u * Math.PI * 2, t = 1 - (1 - v) * (1 - v);
      const rr = 0.42 * (1 - t) + 0.58 * Math.sqrt(Math.max(0, 1 - t * t));
      p.set(RA * rr * Math.cos(th), RY + (RL - RY) * t, RB * rr * Math.sin(th));
    },
    20,
    14,
    (p) => Math.max(zSeam(p), 1 - sstep(0, 0.12, p.y)),
  );
  const EX = 0.2, EY = -0.1, MW = 0.09, MY = -0.335, MK = 0.045 / (MW * MW);
  const root = new THREE.Group(), body = new THREE.Group();
  body.position.y = 0.9;
  root.add(body);
  furPart(body, bodyGeo, furMaterial({ color: 0xf8ba27, eye: [EX, EY, bz(EX, EY)], mouth: [MW, MY, MK], cheek: [0.37, -0.25] }));
  const rayMat = furMaterial({ color: 0xf8ba27 });
  for (const deg of [108, 72, 144, 36, 180, 0, 216, -36]) {
    const A = (deg * Math.PI) / 180, low = Math.sin(A) < -0.3;
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(A) * 0.9, Math.sin(A) * 0.9, 0);
    pivot.rotation.z = A - Math.PI / 2;
    const flop = new THREE.Group();
    flop.rotation.set(low ? 0.32 : 0, 0, -(low ? 0.03 : 0.13) * Math.cos(A)); // side rays droop a little
    pivot.add(flop);
    furPart(flop, rayGeo, rayMat);
    body.add(pivot);
  }
  face(body, bz, EX, EY, MW, MY, MK);
  cordLegs(root, { cx: 0, hipY: 0.2, hipZ: 0.36, footZ: 0.8, spread: 0.24, boot: 1, hex: 0x99633f });
  return root;
}

/** A pixel pointing hand: a cream panel stacked on a charcoal outline, built from rolled blocks. */
function cursor() {
  const U = 0.12, CX = 6.3, OUT = 0.085;
  // [x0, x1, y0, y1] in pixels: index finger, three short fingers, palm, wrist, thumb, thumb tip
  const rects = [
    [2, 4.4, 7, 16], [5, 6.6, 7, 11.6], [7.2, 8.8, 7, 11], [9.4, 11, 7, 10.2],
    [2, 11, 2.2, 8], [2.6, 10, 0, 2.6], [0.8, 2.4, 3.6, 6.6], [0, 1.6, 5.4, 7.4],
  ];
  const layer = (pad: number, depth: number, zc: number, r: number) =>
    merge(
      rects.map((rc) => {
        const g = rbox((rc[1] - rc[0]) * U + 2 * pad, (rc[3] - rc[2]) * U + 2 * pad, depth, r);
        g.translate(((rc[0] + rc[1]) / 2 - CX) * U, ((rc[2] + rc[3]) / 2) * U, zc);
        return g;
      }),
    );
  const EX = 0.15, EY = 0.38, MW = 0.075, MY = 0.25, MK = 0.05 / (MW * MW);
  const root = new THREE.Group(), body = new THREE.Group();
  body.position.y = 0.4;
  body.rotation.z = 0.24;
  root.add(body);
  furPart(body, layer(0, 0.3, 0.05, 0.06), furMaterial({ color: 0xf1e9d8, len: 0.05, density: 110, eye: [EX, EY, 0.2], mouth: [MW, MY, MK] }));
  furPart(body, layer(OUT, 0.34, -0.02, 0.07), furMaterial({ color: 0x3a3a40, len: 0.03, density: 140 }));
  face(body, () => 0.2, EX, EY, MW, MY, MK);
  cordLegs(root, { cx: 0.06, hipY: 0.48, hipZ: 0, footZ: 0.42, spread: 0.25, boot: 1.22, hex: 0xc08a5a });
  return root;
}

/** Tartan for the bandana: red with dark bands and a thin cream line, drawn once. */
function tartan() {
  const c2 = document.createElement("canvas");
  c2.width = c2.height = 128;
  const x = c2.getContext("2d")!;
  x.fillStyle = "#b11f2b";
  x.fillRect(0, 0, 128, 128);
  x.fillStyle = "rgba(28, 16, 18, 0.55)";
  for (const [a, w] of [[18, 22], [80, 10], [104, 6]]) {
    x.fillRect(a, 0, w, 128);
    x.fillRect(0, a, 128, w);
  }
  x.fillStyle = "rgba(236, 214, 170, 0.85)";
  for (const [a, w] of [[50, 3], [118, 2]]) {
    x.fillRect(a, 0, w, 128);
    x.fillRect(0, a, 128, w);
  }
  const tx = new THREE.CanvasTexture(c2);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(2.2, 2.2);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/** A sitting black terrier made of soft blobs; the brows and beard get longer, shaggier fur. */
function scottie() {
  const M4 = new THREE.Matrix4(), E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
  const at = (g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    Q.setFromEuler(E.set(rx, ry, rz));
    g.applyMatrix4(M4.compose(V.set(x, y, z), Q, ONE));
    return g;
  };
  const blob = (rx: number, ry: number, rz: number) =>
    surface(
      (u, v, p) => {
        const th = u * Math.PI * 2, ph = v * Math.PI, sn = Math.sin(ph);
        p.set(rx * sn * Math.sin(th), ry * Math.cos(ph), rz * sn * Math.cos(th));
      },
      30,
      20,
      none,
    );
  const spike = (r: number, len: number, flat: number) =>
    surface(
      (u, v, p) => {
        const th = u * Math.PI * 2, t = 1 - (1 - v) * (1 - v), rr = 0.5 * (1 - t) + 0.5 * Math.sqrt(Math.max(0, 1 - t * t));
        p.set(r * rr * Math.cos(th), len * t, r * flat * rr * Math.sin(th));
      },
      18,
      12,
      none,
    );
  const coat = [
    at(blob(0.42, 0.55, 0.5), 0, 0.62, -0.05, -0.15), // chest
    at(blob(0.46, 0.38, 0.55), 0, 0.36, -0.2), // seat
    at(blob(0.28, 0.3, 0.3), 0, 1.05, 0.03), // neck
    at(blob(0.32, 0.31, 0.34), 0, 1.32, 0.08), // head
    at(blob(0.17, 0.16, 0.3), 0, 1.27, 0.36), // long muzzle
    at(spike(0.12, 0.42, 1.0), 0, 0.55, -0.62, -0.5), // tail up
  ];
  for (const sx of [-1, 1]) {
    coat.push(at(blob(0.2, 0.26, 0.34), sx * 0.33, 0.27, -0.22)); // haunch
    coat.push(at(blob(0.12, 0.28, 0.13), sx * 0.17, 0.28, 0.27)); // front leg
    coat.push(at(blob(0.14, 0.1, 0.19), sx * 0.18, 0.09, 0.4)); // front paw
    coat.push(at(blob(0.13, 0.09, 0.17), sx * 0.37, 0.08, 0.1)); // back paw
    coat.push(at(spike(0.15, 0.36, 0.45), sx * 0.17, 1.5, 0, -0.1, 0, -sx * 0.28)); // ear
  }
  const shag = [at(blob(0.18, 0.17, 0.24), 0, 1.15, 0.42)]; // beard
  for (const sx of [-1, 1]) shag.push(at(blob(0.1, 0.045, 0.08), sx * 0.13, 1.47, 0.36, 0, 0, sx * 0.3)); // brows
  const EX = 0.135, EY = 1.38, EZ = 0.375;
  const root = new THREE.Group();
  furPart(root, merge(coat), furMaterial({ color: 0x27272c, len: 0.06, density: 92, eye: [EX, EY, EZ], mouth: [0, 9, 0] }));
  furPart(root, merge(shag), furMaterial({ color: 0x3a3a40, len: 0.1, density: 68 }));
  const eyeMat = new THREE.MeshStandardMaterial({ color: col(0x050505), roughness: 0.06 });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 18, 12), eyeMat);
    eye.position.set(sx * EX, EY, EZ + 0.03);
    root.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshStandardMaterial({ color: col(0x0e0d0d), roughness: 0.3 }));
  nose.scale.set(1.15, 0.8, 0.8);
  nose.position.set(0, 1.34, 0.66);
  nose.castShadow = true;
  root.add(nose);
  const cloth = new THREE.MeshStandardMaterial({ map: tartan(), roughness: 0.9, side: THREE.DoubleSide });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 8, 36), cloth);
  band.rotation.x = Math.PI / 2;
  band.position.set(0, 1.0, 0.05);
  const tri = new THREE.Shape();
  tri.moveTo(-0.3, 0);
  tri.lineTo(0.3, 0);
  tri.lineTo(0.06, -0.42);
  tri.lineTo(-0.3, 0);
  const flap = new THREE.Mesh(new THREE.ShapeGeometry(tri), cloth);
  flap.position.set(0, 1.0, 0.42);
  flap.rotation.set(-0.35, 0, 0.15);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), cloth);
  knot.position.set(-0.27, 1.02, 0.2);
  for (const m of [band, flap, knot]) {
    m.castShadow = true;
    root.add(m);
  }
  return root;
}

/** Clawd, the Claude Code mascot: a wide orange block, slit eyes, stubby arms, four little legs. */
function clawd() {
  const parts = [rbox(1.5, 1.0, 0.6, 0.12)];
  parts[0].translate(0, 0.75, 0);
  for (const sx of [-1, 1]) {
    const a = rbox(0.38, 0.25, 0.32, 0.08);
    a.translate(sx * 0.81, 0.625, 0);
    parts.push(a);
  }
  for (const x of [-0.5625, -0.3125, 0.3125, 0.5625]) {
    const l = rbox(0.15, 0.36, 0.42, 0.06);
    l.translate(x, 0.18, 0);
    parts.push(l);
  }
  const EX = 0.4375, EY = 0.875;
  const root = new THREE.Group();
  furPart(root, merge(parts), furMaterial({ color: 0xda7758, len: 0.045, density: 124, eye: [EX, EY, 0.3], mouth: [0, 9, 0] }));
  const eyeMat = new THREE.MeshStandardMaterial({ color: col(0x1c1715), roughness: 0.85 });
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(rbox(0.12, 0.24, 0.08, 0.03, 0.03), eyeMat);
    e.position.set(sx * EX, EY, 0.29);
    e.castShadow = true;
    root.add(e);
  }
  return root;
}

export const makePlush: Record<JellycatId, () => THREE.Group> = { sun, cursor, scottie, clawd };


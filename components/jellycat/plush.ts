/**
 * The plush in the claw machine, each one a group standing on the floor at its origin, facing +z.
 * Units: the sun's body is 2 across. They're scaled down in the machine (content/jellycats.ts).
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { JellycatId } from "@/content/jellycats";
import { clamp, col, cordLegs, face, furMaterial, furPart, merge, rbox, sstep, surface } from "./fur";

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

/** Thin vertical pinstripes for the baseball's jersey and trousers. */
function pinstripe() {
  const c2 = document.createElement("canvas");
  c2.width = 64;
  c2.height = 8;
  const x = c2.getContext("2d")!;
  x.fillStyle = "#f6f4ef";
  x.fillRect(0, 0, 64, 8);
  x.fillStyle = "#2b3567";
  x.fillRect(30, 0, 4, 8);
  const tx = new THREE.CanvasTexture(c2);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

/** An ellipsoid of fabric (not fur), centred at (x, y, z). */
function ellipsoid(mat: THREE.Material, r: [number, number, number], at: [number, number, number], rot: [number, number, number] = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), mat);
  m.scale.set(...r);
  m.position.set(...at);
  m.rotation.set(...rot);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** A soft ball of fur geometry (parametric, so it can be merged with other pieces). */
const ball = (rx: number, ry: number, rz: number, x: number, y: number, z: number) => {
  const g = surface(
    (u, v, p) => {
      const th = u * Math.PI * 2, ph = v * Math.PI, sn = Math.sin(ph);
      p.set(rx * sn * Math.sin(th), ry * Math.cos(ph), rz * sn * Math.cos(th));
    },
    28,
    18,
    none,
  );
  g.translate(x, y, z);
  return g;
};

/** A baseball head with red stitched seams, a blue cap tipped to one side, and a little pinstripe body. */
function baseball() {
  const R = 0.8, HY = 1.4;
  // the seam: the classic ball curve, turned so the two arcs run down the left and right of the face
  const A = 0.8, B = 0.2, K = 2 * Math.sqrt(A * B), TURN = -Math.PI / 4;
  const seamAt = (t: number, out: THREE.Vector3) => {
    const x = A * Math.cos(t) + B * Math.cos(3 * t), y = A * Math.sin(t) - B * Math.sin(3 * t), z = K * Math.sin(2 * t);
    return out.set(x * Math.cos(TURN) - y * Math.sin(TURN), x * Math.sin(TURN) + y * Math.cos(TURN), z);
  };
  const seamPts: THREE.Vector3[] = [];
  for (let i = 0; i < 240; i++) seamPts.push(seamAt((i / 240) * Math.PI * 2, new THREE.Vector3()).multiplyScalar(R));
  const nearSeam = (p: THREE.Vector3) => {
    let d = 9;
    for (const q of seamPts) d = Math.min(d, p.distanceToSquared(q));
    return 1 - sstep(0.03, 0.11, Math.sqrt(d));
  };
  const head = surface(
    (u, v, p) => {
      const th = u * Math.PI * 2, ph = v * Math.PI, sn = Math.sin(ph);
      p.set(R * sn * Math.sin(th), R * Math.cos(ph), R * sn * Math.cos(th));
    },
    72,
    48,
    nearSeam,
  );
  // the hands are the same cream felt as the ball, so they share its mesh (head-local coordinates)
  const cream = merge([head, ball(0.13, 0.13, 0.13, -0.56, 0.4 - HY, 0.12), ball(0.13, 0.13, 0.13, 0.56, 0.4 - HY, 0.12)]);
  const zf = (x: number, y: number) => Math.sqrt(Math.max(0, R * R - x * x - y * y));
  const EX = 0.2, EY = -0.06, MW = 0.095, MY = -0.24, MK = 0.05 / (MW * MW);
  const root = new THREE.Group(), body = new THREE.Group();
  body.position.y = HY;
  root.add(body);
  furPart(body, cream, furMaterial({ color: 0xf3ecdc, len: 0.045, density: 112, eye: [EX, EY, zf(EX, EY)], mouth: [MW, MY, MK] }));
  face(body, zf, EX, EY, MW, MY, MK);

  // red chevron stitches along the seam
  const parts: THREE.BufferGeometry[] = [];
  const P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), S = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  const M = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
  const STITCHES = 78;
  for (let i = 0; i < STITCHES; i++) {
    const t = (i / STITCHES) * Math.PI * 2;
    seamAt(t, P).normalize();
    seamAt(t + 0.001, T).normalize().sub(P).normalize();
    N.copy(P);
    S.crossVectors(T, N).normalize();
    P.multiplyScalar(R + 0.012);
    for (const side of [-1, 1]) {
      a.copy(P).addScaledVector(T, 0.03); // the point of the V
      b.copy(P).addScaledVector(T, -0.03).addScaledVector(S, side * 0.075);
      const len = a.distanceTo(b);
      X.subVectors(b, a).normalize();
      Z.copy(N);
      Y.crossVectors(Z, X).normalize();
      Z.crossVectors(X, Y);
      const g = new THREE.BoxGeometry(len, 0.024, 0.018);
      g.applyMatrix4(M.makeBasis(X, Y, Z).setPosition(a.clone().add(b).multiplyScalar(0.5)));
      parts.push(g);
    }
  }
  const stitches = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ color: col(0xd8342e), roughness: 0.75 }));
  for (const g of parts) g.dispose();
  body.add(stitches);

  // the cap: a soft dome and a brim, tipped back and to the left
  const dome = surface(
    (u, v, p) => {
      const th = u * Math.PI * 2, ph = v * Math.PI * 0.5;
      p.set(0.5 * Math.sin(ph) * Math.sin(th), 0.36 * Math.cos(ph) - 0.02, 0.5 * Math.sin(ph) * Math.cos(th));
    },
    40,
    16,
    (p) => (p.y < 0.03 ? 0.6 : 0),
  );
  const brim = ball(0.42, 0.045, 0.36, 0, 0.0, 0.42);
  const button = ball(0.06, 0.04, 0.06, 0, 0.35, 0);
  const capDir = new THREE.Vector3(-0.36, 1, 0.16).normalize();
  const cap = new THREE.Group();
  cap.position.copy(capDir).multiplyScalar(R * 0.9);
  cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), capDir);
  cap.scale.setScalar(1.18);
  const capTurn = new THREE.Group();
  capTurn.rotation.y = 0.35;
  cap.add(capTurn);
  furPart(capTurn, merge([dome, brim, button]), furMaterial({ color: 0x2c55c6, len: 0.028, density: 150 }));
  body.add(cap);

  // a pinstripe body sitting on the floor, navy cuffs and feet
  const stripes = pinstripe();
  const jersey = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.92 });
  stripes.repeat.set(12, 1);
  const pantsTex = stripes.clone();
  pantsTex.repeat.set(6, 1);
  const pants = new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.92 });
  root.add(ellipsoid(jersey, [0.42, 0.36, 0.34], [0, 0.46, -0.02]));
  const navy = new THREE.MeshStandardMaterial({ color: col(0x23305e), roughness: 0.85 });
  for (const sx of [-1, 1]) {
    root.add(ellipsoid(jersey, [0.13, 0.19, 0.13], [sx * 0.37, 0.52, 0.06], [0, 0, sx * 0.85]));
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 20), navy);
    cuff.position.set(sx * 0.48, 0.43, 0.1);
    cuff.rotation.set(0, Math.PI / 2, sx * 0.7);
    root.add(cuff);
    root.add(ellipsoid(pants, [0.14, 0.13, 0.22], [sx * 0.19, 0.17, 0.24]));
  }
  furPart(root, merge([ball(0.15, 0.15, 0.17, -0.22, 0.14, 0.48), ball(0.15, 0.15, 0.17, 0.22, 0.14, 0.48)]), furMaterial({ color: 0x1f2a52, len: 0.035, density: 130 }));
  return root;
}

/** Black letters on a clear canvas, for the roof sign and the doors. */
function label(text: string, w: number, h: number) {
  const c2 = document.createElement("canvas");
  c2.width = 256;
  c2.height = Math.round((256 * h) / w);
  const x = c2.getContext("2d")!;
  x.fillStyle = "#16161a";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `700 ${Math.round(c2.height * 0.78)}px "Helvetica Neue", Arial, sans-serif`;
  x.fillText(text, 128, c2.height * 0.54, 240);
  const tx = new THREE.CanvasTexture(c2);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.4, roughness: 0.9, depthWrite: false }));
}

/** A yellow New York cab: a boxy body, slate windows, a roof sign, fat wheels and a smile on the grille. */
function taxi() {
  const at = (g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0) => {
    if (rx) g.rotateX(rx);
    g.translate(x, y, z);
    return g;
  };
  const lower = at(rbox(1.0, 0.44, 2.5, 0.13), 0, 0.49, 0);
  // the cabin leans in at the top, front and back, like a windscreen
  const cab = rbox(0.88, 0.38, 1.3, 0.1);
  const cp = cab.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < cp.count; i++) {
    const k = clamp((cp.getY(i) + 0.2) / 0.4, 0, 1);
    cp.setXYZ(i, cp.getX(i) * (1 - 0.08 * k), cp.getY(i), cp.getZ(i) * (1 - 0.26 * k));
  }
  at(cab, 0, 0.88, -0.14);
  const mirrors = [ball(0.05, 0.045, 0.06, -0.5, 0.77, 0.5), ball(0.05, 0.045, 0.06, 0.5, 0.77, 0.5)];
  const EX = 0.14, EY = 0.59, MW = 0.08, MY = 0.49, MK = 0.045 / (MW * MW), FZ = 1.25;
  const root = new THREE.Group();
  furPart(root, merge([lower, cab, ...mirrors]), furMaterial({ color: 0xf1b232, len: 0.036, density: 118, eye: [EX, EY, FZ], mouth: [MW, MY, MK] }));
  face(root, () => FZ, EX, EY, MW, MY, MK);

  // slate windows: windscreen, back window, two a side
  const SLANT = 0.4;
  const glass = [at(rbox(0.7, 0.26, 0.04, 0.015), 0, 0.89, 0.44, -SLANT), at(rbox(0.7, 0.26, 0.04, 0.015), 0, 0.89, -0.72, SLANT)];
  for (const sx of [-1, 1]) for (const z of [0.15, -0.37]) glass.push(at(rbox(0.04, 0.24, 0.42, 0.015), sx * 0.42, 0.9, z));
  furPart(root, merge(glass), furMaterial({ color: 0x56637b, len: 0.02, density: 150 }));

  // cream felt: the roof sign and the headlights
  const creamParts = [at(rbox(0.52, 0.19, 0.22, 0.06), 0, 1.16, -0.14)];
  for (const sx of [-1, 1]) creamParts.push(at(rbox(0.24, 0.14, 0.05, 0.03), sx * 0.34, 0.59, 1.25));
  furPart(root, merge(creamParts), furMaterial({ color: 0xf2eadb, len: 0.03, density: 130 }));
  for (const side of [1, -1]) {
    const sign = label("TAXI", 0.42, 0.12);
    sign.position.set(0, 1.16, -0.14 + side * 0.15);
    sign.rotation.y = side > 0 ? 0 : Math.PI;
    root.add(sign);
    const door = label("NYC", 0.26, 0.11);
    door.position.set(side * 0.545, 0.55, 0.32);
    door.rotation.y = (side * Math.PI) / 2;
    root.add(door);
  }

  // grey bumpers, red tail lights
  furPart(root, merge([at(rbox(1.04, 0.15, 0.14, 0.06), 0, 0.33, 1.25), at(rbox(1.04, 0.15, 0.14, 0.06), 0, 0.33, -1.25)]), furMaterial({ color: 0x8b8b90, len: 0.03, density: 130 }));
  furPart(root, merge([at(rbox(0.2, 0.12, 0.05, 0.03), -0.36, 0.59, -1.25), at(rbox(0.2, 0.12, 0.05, 0.03), 0.36, 0.59, -1.25)]), furMaterial({ color: 0xc23b38, len: 0.025, density: 140 }));

  // fat wheels with silver hubs, and door handles
  const tire = (x: number, z: number) => {
    const g = surface(
      (u, v, p) => {
        const th = u * Math.PI * 2, ph = v * Math.PI * 2, rr = 0.15 + 0.1 * Math.cos(ph);
        p.set(0.1 * Math.sin(ph), rr * Math.sin(th), rr * Math.cos(th));
      },
      28,
      16,
      none,
    );
    return at(g, x, 0.25, z);
  };
  const tires: THREE.BufferGeometry[] = [];
  const hubMat = new THREE.MeshStandardMaterial({ color: col(0xbfc0c4), roughness: 0.45, metalness: 0.1 });
  const handleMat = new THREE.MeshStandardMaterial({ color: col(0x1c1c20), roughness: 0.8 });
  for (const sx of [-1, 1]) {
    for (const z of [0.8, -0.8]) {
      tires.push(tire(sx * 0.47, z));
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24), hubMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(sx * 0.575, 0.25, z);
      root.add(hub);
    }
    for (const z of [0.15, -0.37]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.1), handleMat);
      h.position.set(sx * 0.52, 0.67, z);
      root.add(h);
    }
  }
  furPart(root, merge(tires), furMaterial({ color: 0x2a2a2e, len: 0.035, density: 120 }));
  return root;
}

export const makePlush: Record<JellycatId, () => THREE.Group> = { sun, cursor, scottie, baseball, taxi, clawd };


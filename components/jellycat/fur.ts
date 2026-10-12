/**
 * Shell fur and the shapes the plush are sewn from.
 *
 * Fur: the same mesh drawn SHELLS times (one InstancedMesh), each copy pushed a little further out
 * along the normal, with noise cutting holes so only strands survive toward the tips. The roots sit
 * in shade, a soft rim catches the light. `aSeam` (per vertex, 0–1) shortens the pile where two
 * panels would be sewn together; `uEye`/`uMouth` press it down around the face.
 *
 * Shapes are built in code, no model files: parametric surfaces (`surface`) for round things and
 * boxes with their edges rolled round (`rbox`) for blocky ones, merged into one mesh per fabric.
 */
import * as THREE from "three";

export const SHELLS = 20;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Colours are written as sRGB hex; three.js converts them to its linear working space. */
export const col = (hex: number) => new THREE.Color(hex);

function shellAttr(g: THREE.BufferGeometry) {
  const arr = new Float32Array(SHELLS);
  for (let i = 0; i < SHELLS; i++) arr[i] = i / (SHELLS - 1);
  g.setAttribute("aShell", new THREE.InstancedBufferAttribute(arr, 1));
  g.computeBoundingSphere();
  return g;
}

type Fn = (u: number, v: number, p: THREE.Vector3) => void;

/** A grid over (u, v) ∈ [0,1]², normals by finite differences of `fn` (so seams in u stay smooth). */
export function surface(fn: Fn, nu: number, nv: number, seamFn: (p: THREE.Vector3) => number) {
  const pos: number[] = [], nor: number[] = [], seam: number[] = [], idx: number[] = [];
  const p = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(), n = new THREE.Vector3();
  const e = 1e-3;
  for (let j = 0; j <= nv; j++) {
    const v = j / nv, vn = clamp(v, 0.004, 0.996);
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      fn(u, v, p); fn(u + e, vn, a); fn(u - e, vn, b); fn(u, vn + e, c); fn(u, vn - e, d);
      a.sub(b); c.sub(d); n.crossVectors(c, a).normalize();
      pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); seam.push(seamFn(p));
    }
  }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const q = j * (nu + 1) + i, r = q + 1, s = q + nu + 1, t = s + 1;
      idx.push(q, s, r, r, s, t);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aSeam", new THREE.Float32BufferAttribute(seam, 1));
  g.setIndex(idx);
  return shellAttr(g);
}

/** A box whose edges are rolled round like a stuffed panel; aSeam marks the middle of each rolled edge. */
export function rbox(W: number, H: number, D: number, r: number, step = 0.034) {
  const seg = (x: number) => Math.max(3, Math.round(x / step));
  const g = new THREE.BoxGeometry(W, H, D, seg(W), seg(H), seg(D));
  const pos = g.attributes.position as THREE.BufferAttribute, nor = g.attributes.normal as THREE.BufferAttribute;
  const seam = new Float32Array(pos.count);
  const hx = W / 2 - r, hy = H / 2 - r, hz = D / 2 - r;
  const p = new THREE.Vector3(), q = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    q.set(clamp(p.x, -hx, hx), clamp(p.y, -hy, hy), clamp(p.z, -hz, hz));
    n.copy(p).sub(q);
    const len = n.length();
    if (len < 1e-6) n.fromBufferAttribute(nor, i);
    else n.divideScalar(len);
    p.copy(q).addScaledVector(n, r);
    seam[i] = 1 - sstep(0.74, 0.94, Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)));
    pos.setXYZ(i, p.x, p.y, p.z);
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  g.setAttribute("aSeam", new THREE.BufferAttribute(seam, 1));
  return g;
}

/** Several pieces of the same fabric as one mesh (one draw call for all of its shells). */
export function merge(list: THREE.BufferGeometry[]) {
  const pos: number[] = [], nor: number[] = [], seam: number[] = [], idx: number[] = [];
  let off = 0;
  for (const g of list) {
    const P = g.attributes.position, N = g.attributes.normal, S = g.attributes.aSeam, I = g.index!;
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i), P.getY(i), P.getZ(i));
      nor.push(N.getX(i), N.getY(i), N.getZ(i));
      seam.push(S.getX(i));
    }
    for (let i = 0; i < I.count; i++) idx.push(I.getX(i) + off);
    off += P.count;
    g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aSeam", new THREE.Float32BufferAttribute(seam, 1));
  g.setIndex(idx);
  return shellAttr(g);
}

/* ── the fur material ── */

const VERT_PARS = /* glsl */ `
attribute float aShell; attribute float aSeam;
uniform float uFurLen; uniform float uFace; uniform vec3 uSway;
uniform vec3 uEye; uniform vec3 uMouth;
varying float vShell; varying vec3 vFurBase; varying float vSeam;
float furMask(vec3 p){
  float m = mix(1.0, 0.3, aSeam);
  float de = min(distance(p, uEye), distance(p, uEye * vec3(-1.0, 1.0, 1.0)));
  m *= mix(1.0, mix(0.15, 1.0, smoothstep(0.035, 0.13, de)), uFace);
  vec2 q = vec2(max(abs(p.x) - uMouth.x, 0.0), p.y - (uMouth.y + uMouth.z * p.x * p.x));
  float dm = length(q) + step(p.z, 0.0) * 9.0;
  m *= mix(1.0, mix(0.3, 1.0, smoothstep(0.01, 0.06, dm)), uFace);
  return m;
}`;
const VERT_MAIN = /* glsl */ `
vShell = aShell; vFurBase = position; vSeam = furMask(position);
transformed += normalize(objectNormal) * (uFurLen * vSeam * aShell);`;
const VERT_SWAY = /* glsl */ `
mvPosition.xyz += uSway * (aShell * aShell);
gl_Position = projectionMatrix * mvPosition;`;
const FRAG_PARS = /* glsl */ `
uniform float uDensity; uniform float uFace; uniform vec3 uSeed; uniform vec3 uRim; uniform vec3 uCheek; uniform vec3 uCheekCol;
varying float vShell; varying vec3 vFurBase; varying float vSeam;
float h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float vnoise(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h13(i), h13(i + vec3(1,0,0)), f.x), mix(h13(i + vec3(0,1,0)), h13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h13(i + vec3(0,0,1)), h13(i + vec3(1,0,1)), f.x), mix(h13(i + vec3(0,1,1)), h13(i + vec3(1,1,1)), f.x), f.y), f.z); }`;
const FRAG_MAIN = /* glsl */ `
vec3 furP = vFurBase + uSeed;
float furClump = vnoise(furP * 9.0);
float rnd0 = 0.5;
float furPatch = vnoise(furP * 2.4 + 7.3);
if (vShell > 0.001) {
  vec3 fp = mat3(0.80, 0.36, -0.48, -0.60, 0.48, -0.64, 0.0, 0.80, 0.60) * furP * uDensity;
  fp += (vnoise(furP * 21.0) - 0.5) * 1.3;
  vec3 ci = floor(fp); vec3 cf = fract(fp);
  vec3 rnd = h33(ci); rnd0 = rnd.y;
  float height = mix(0.68, 1.0, rnd.x) * mix(0.76, 1.0, furClump);
  float tt = vShell / height;
  float dd = length(cf - (0.5 + (rnd - 0.5) * 0.5));
  if (tt > 1.0 || dd > mix(0.83, 0.36, tt * tt)) discard;
}
float furAO = mix(0.66, 1.0, pow(vShell, 0.7));
diffuseColor.rgb *= furAO * mix(0.9, 1.06, furPatch) * mix(0.93, 1.03, rnd0) * mix(0.74, 1.0, vSeam);
float ck = uFace * uCheek.z * step(0.0, vFurBase.z) * (1.0 - smoothstep(0.04, 0.15, min(distance(vFurBase.xy, uCheek.xy), distance(vFurBase.xy, uCheek.xy * vec2(-1.0, 1.0)))));
diffuseColor.rgb = mix(diffuseColor.rgb, uCheekCol * furAO, ck * 0.5);`;
const FRAG_RIM = /* glsl */ `
{ float fres = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 2.4);
  gl_FragColor.rgb += uRim * fres * (0.3 + 0.7 * vShell); }`;

export type FurOpts = {
  color: number;
  len?: number;
  density?: number;
  /** one eye; the other is its mirror in x */
  eye?: [number, number, number];
  /** half-width, lowest y, curve */
  mouth?: [number, number, number];
  cheek?: [number, number];
  cheekCol?: number;
};

let seedN = 0;
/** Shared by every fur mesh: the tips lag a touch behind (set from the camera each frame). */
export const furSway = { value: new THREE.Vector3(0, -0.004, 0) };

export function furMaterial(o: FurOpts) {
  const c = col(o.color), ck = col(o.cheekCol ?? 0xf58a66), seed = seedN++;
  const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 });
  const uni: Record<string, THREE.IUniform> = {
    uFurLen: { value: o.len ?? 0.045 },
    uSway: furSway,
    uFace: { value: o.eye ? 1 : 0 },
    uDensity: { value: o.density ?? 118 },
    uSeed: { value: new THREE.Vector3(seed * 3.17, seed * 1.93, seed * 5.41) },
    uRim: { value: new THREE.Vector3(0.06 + c.r * 0.3, 0.06 + c.g * 0.3, 0.05 + c.b * 0.3) },
    uEye: { value: o.eye ? new THREE.Vector3(...o.eye) : new THREE.Vector3(9, 9, 9) },
    uMouth: { value: o.mouth ? new THREE.Vector3(...o.mouth) : new THREE.Vector3(0, 9, 0) },
    uCheek: { value: o.cheek ? new THREE.Vector3(o.cheek[0], o.cheek[1], 1) : new THREE.Vector3(9, 9, 0) },
    uCheekCol: { value: new THREE.Vector3(ck.r, ck.g, ck.b) },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\n" + VERT_PARS)
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n" + VERT_MAIN)
      .replace("#include <project_vertex>", "#include <project_vertex>\n" + VERT_SWAY);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\n" + FRAG_PARS)
      .replace("#include <color_fragment>", "#include <color_fragment>\n" + FRAG_MAIN)
      .replace("#include <tonemapping_fragment>", FRAG_RIM + "\n#include <tonemapping_fragment>");
  };
  // every fur material compiles to the same program; only the uniforms differ
  mat.customProgramCacheKey = () => "jc-fur";
  return mat;
}

const IDENT = new THREE.Matrix4();
const casterMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

/** A furry piece: the shells, plus a hidden copy of the bare shape that casts the shadow. */
export function furPart(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material) {
  const m = new THREE.InstancedMesh(geo, mat, SHELLS);
  for (let i = 0; i < SHELLS; i++) m.setMatrixAt(i, IDENT);
  m.instanceMatrix.needsUpdate = true;
  m.receiveShadow = true;
  m.frustumCulled = false;
  parent.add(m);
  const c = new THREE.Mesh(geo, casterMat);
  c.castShadow = true;
  parent.add(c);
}

/* ── small parts shared by several plush ── */

export const beadMat = () => new THREE.MeshStandardMaterial({ color: col(0x0c0a08), roughness: 0.12, metalness: 0 });

/** Two bead eyes and a stitched smile on a face whose surface depth is `zf(x, y)`. */
export function face(body: THREE.Object3D, zf: (x: number, y: number) => number, ex: number, ey: number, mw: number, my: number, mk: number) {
  const bead = beadMat();
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), bead);
    eye.position.set(sx * ex, ey, zf(ex, ey) + 0.022);
    eye.scale.z = 0.85;
    eye.castShadow = true;
    body.add(eye);
  }
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = -mw + (2 * mw * i) / 12, y = my + mk * x * x;
    pts.push(new THREE.Vector3(x, y, zf(x, y) + 0.03));
  }
  const thread = new THREE.MeshStandardMaterial({ color: col(0x1d120b), roughness: 0.8 });
  body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0095, 8, false), thread));
}

/** Corduroy: soft stripes painted once on a tiny canvas, used as colour and as bump. */
function cordTexture(srgb: boolean, repeat: number) {
  const cv = document.createElement("canvas");
  cv.width = 32;
  cv.height = 4;
  const cx = cv.getContext("2d")!;
  const gr = cx.createLinearGradient(0, 0, 32, 0);
  gr.addColorStop(0, "#8f8f8f");
  gr.addColorStop(0.5, "#ffffff");
  gr.addColorStop(1, "#8f8f8f");
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 32, 4);
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(repeat, 1);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}
export function cordMaterial(repeat: number, hex: number) {
  return new THREE.MeshStandardMaterial({ color: col(hex), roughness: 0.95, map: cordTexture(true, repeat), bumpMap: cordTexture(false, repeat), bumpScale: 0.012 });
}

/** Two corduroy legs from the hips forward to round boots resting on the floor. */
export function cordLegs(root: THREE.Object3D, o: { cx: number; hipY: number; hipZ: number; footZ: number; spread: number; boot: number; hex: number }) {
  const legMat = cordMaterial(10, o.hex), bootMat = cordMaterial(22, o.hex);
  for (const sx of [-1, 1]) {
    const hip = new THREE.Vector3(o.cx + sx * 0.17, o.hipY, o.hipZ);
    const footAt = new THREE.Vector3(o.cx + sx * o.spread, 0.17 * o.boot, o.footZ);
    const dir = footAt.clone().sub(hip);
    const len = dir.length();
    dir.normalize();
    const pivot = new THREE.Group();
    pivot.position.copy(hip);
    const lg = new THREE.CylinderGeometry(0.062, 0.07, len, 18, 1, true);
    lg.translate(0, len / 2, 0);
    const leg = new THREE.Mesh(lg, legMat);
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    leg.castShadow = leg.receiveShadow = true;
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), bootMat);
    b.scale.set(0.125 * o.boot, 0.165 * o.boot, 0.115 * o.boot);
    b.position.copy(footAt).sub(hip);
    b.rotation.set(-0.25, 0, sx * -0.12);
    b.castShadow = b.receiveShadow = true;
    pivot.add(leg, b);
    root.add(pivot);
  }
}

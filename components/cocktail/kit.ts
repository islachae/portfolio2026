/**
 * Word Cocktail · the 3D objects (three.js, no extra libraries).
 * Units: the glass is 1.72 tall, the shaker body 2.0. y is up, every object stands on y = 0.
 */
import * as THREE from "three";

const V2 = THREE.Vector2;

/* ───────────── studio light: what the chrome reflects ───────────── */

/** A small studio built in code and baked into an environment map (no HDR file to download). */
export function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(20, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(1.15, 1.12, 1.08) },
        mid: { value: new THREE.Color(0.86, 0.8, 0.72) },
        low: { value: new THREE.Color(0.3, 0.28, 0.26) },
      },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader:
        "uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0. ? mix(mid, top, smoothstep(0., .7, y)) : mix(mid, low, smoothstep(0., .35, -y)); gl_FragColor = vec4(c, 1.); }",
    })
  );
  scene.add(sky);
  const panel = (w: number, h: number, intensity: number, pos: [number, number, number], tint = [1, 1, 1]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  // tall softboxes: the long bright bands down the chrome
  panel(2.2, 16, 9, [-9, 2, 7]);
  panel(1.2, 16, 7, [8, 1, 8]);
  panel(4, 10, 3.2, [0, 2, 12]);
  panel(1.6, 14, 6, [11, 3, -6]);
  panel(1.6, 14, 4, [-10, 3, -7]);
  // a warm top light and a cool rim, for the little colour shifts in the reflections
  panel(10, 3, 5, [0, 12, 2], [1, 0.96, 0.9]);
  panel(3, 9, 2.4, [-6, 0, -12], [0.75, 0.85, 1.1]);
  // dark flags between the lights: chrome reads as chrome only with contrast
  const flag = (w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x0b0a0a, side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  flag(3, 16, [-4, 1, 11]);
  flag(2.5, 16, [5, 1, 11]);
  flag(5, 14, [0, 1, -13]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose();
  });
  return rt.texture;
}

/* ───────────── materials ───────────── */

export function chrome(extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf4f6f8,
    metalness: 1,
    roughness: 0.07,
    iridescence: 0.32,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [180, 520],
    envMapIntensity: 1.25,
    ...extra,
  });
}

/**
 * See-through with bright edges: glass, or the shaker's chrome "x-ray" front.
 * Alpha follows the Fresnel term, so the middle stays clear and the silhouette reflects.
 */
export function fresnelShell(opts: { color?: THREE.ColorRepresentation; metal?: number; rough?: number; min: number; max: number; power?: number; env?: number; irid?: number }) {
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xffffff,
    metalness: opts.metal ?? 0,
    roughness: opts.rough ?? 0.03,
    transparent: true,
    depthWrite: false,
    envMapIntensity: opts.env ?? 1.4,
    iridescence: opts.irid ?? 0.2,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [200, 500],
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    specularIntensity: 1,
  });
  const u = { uMin: { value: opts.min }, uMax: { value: opts.max }, uPow: { value: opts.power ?? 2 }, uFade: { value: 1 } };
  m.userData.u = u;
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uMin; uniform float uMax; uniform float uPow; uniform float uFade;")
      .replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\nfloat fr = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), uPow);\ngl_FragColor.a = mix(uMin, uMax, fr) * uFade;"
      );
  };
  m.customProgramCacheKey = () => `fresnel-${opts.power ?? 2}`;
  return m;
}

export function gemMaterial(color: THREE.ColorRepresentation, opts: { ice?: boolean } = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    flatShading: true,
    transmission: 1,
    thickness: opts.ice ? 0.5 : 0.55,
    roughness: 0.02,
    ior: 1.75,
    dispersion: 3,
    attenuationColor: c,
    attenuationDistance: opts.ice ? 0.55 : 0.42,
    iridescence: 0.55,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [220, 640],
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.7,
    emissive: c,
    emissiveIntensity: opts.ice ? 0.1 : 0.16,
  });
}

/* ───────────── shapes ───────────── */

/** A rough-cut crystal: an icosahedron with every corner nudged (the same nudge for shared corners). */
export function gemGeometry(seed: number, r = 0.22) {
  const g = new THREE.IcosahedronGeometry(r, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  const rand = mulberry(seed);
  const moved = new Map<string, [number, number, number]>();
  const stretch = [1 + (rand() - 0.5) * 0.24, 0.86 + rand() * 0.2, 1 + (rand() - 0.5) * 0.2];
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    let d = moved.get(key);
    if (!d) {
      const k = 1 + (rand() - 0.5) * 0.2;
      d = [k * stretch[0], k * stretch[1], k * stretch[2]];
      moved.set(key, d);
    }
    p.setXYZ(i, p.getX(i) * d[0], p.getY(i) * d[1], p.getZ(i) * d[2]);
  }
  g.computeVertexNormals();
  return g;
}

function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cubic(p0: THREE.Vector2, p1: THREE.Vector2, p2: THREE.Vector2, p3: THREE.Vector2, n: number) {
  return new THREE.CubicBezierCurve(p0, p1, p2, p3).getPoints(n);
}

/** Cocktail glass: a round-bottomed martini bowl on a thin stem. Bowl bottom at y ≈ 0.86, rim at 1.72. */
export const GLASS = { rim: 0.8, top: 1.72, bowlFloor: 0.9 };
const bowlOuter = () => cubic(new V2(0.07, 0.86), new V2(0.38, 0.84), new V2(0.74, 1.12), new V2(0.8, 1.72), 28);
const bowlInner = () => cubic(new V2(0.0, 0.905), new V2(0.36, 0.895), new V2(0.72, 1.14), new V2(0.778, 1.71), 40);

export function glassGeometry() {
  const pts: THREE.Vector2[] = [
    new V2(0.0, 0),
    new V2(0.42, 0),
    new V2(0.445, 0.012),
    new V2(0.44, 0.03),
    new V2(0.3, 0.05),
    new V2(0.1, 0.085),
    new V2(0.06, 0.14),
    new V2(0.044, 0.3),
    new V2(0.042, 0.6),
    new V2(0.05, 0.76),
    new V2(0.07, 0.83),
  ];
  pts.push(...bowlOuter().slice(0, -1));
  pts.push(new V2(0.8, 1.72), new V2(0.792, 1.728), new V2(0.781, 1.718));
  pts.push(...bowlInner().reverse().slice(1));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

const innerSamples = bowlInner();
/** Inner radius of the bowl at height y */
export function bowlRadius(y: number) {
  for (let i = 1; i < innerSamples.length; i++) {
    const a = innerSamples[i - 1];
    const b = innerSamples[i];
    if (y <= b.y) return a.x + ((b.x - a.x) * (y - a.y)) / Math.max(1e-6, b.y - a.y);
  }
  return innerSamples[innerSamples.length - 1].x;
}

/** The drink, filled to `fill` (0–1 of the bowl) */
export function liquidGeometry(fill: number) {
  const y0 = 0.912;
  const y1 = y0 + (1.6 - y0) * Math.max(0.02, fill);
  const pts: THREE.Vector2[] = [new V2(0, y0)];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    pts.push(new V2(Math.max(0.001, bowlRadius(y) - 0.006), y));
  }
  pts.push(new V2(0, y1));
  const g = new THREE.LatheGeometry(pts, 64);
  g.computeVertexNormals();
  return { geometry: g, surface: y1 };
}

/** Shaker body: a tumbler that widens a little toward the top. */
export const SHAKER = { h: 2.0, r0: 0.5, r1: 0.62, floor: 0.13 };
export const shakerRadius = (y: number) => SHAKER.r0 + ((SHAKER.r1 - SHAKER.r0) * y) / SHAKER.h;

export function shakerBodyGeometry(inset = 0) {
  const pts: THREE.Vector2[] = [];
  const c = 0.16; // rounded bottom corner
  for (let i = 0; i <= 10; i++) {
    const a = (Math.PI / 2) * (i / 10);
    pts.push(new V2(SHAKER.r0 - c + Math.sin(a) * c - inset, c - Math.cos(a) * c + inset * 0.5));
  }
  for (let i = 1; i <= 16; i++) {
    const y = c + ((SHAKER.h - c) * i) / 16;
    pts.push(new V2(shakerRadius(y) - inset, y));
  }
  pts.unshift(new V2(0.0, inset * 0.5));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

export function shakerBandGeometry(y0: number, y1: number, out = 0.012) {
  const pts: THREE.Vector2[] = [];
  const r = (y: number) => shakerRadius(y) + out;
  const rr = Math.min(0.03, (y1 - y0) / 3);
  pts.push(new V2(r(y0) - out * 1.3, y0));
  pts.push(new V2(r(y0), y0 + rr * 0.3));
  for (let i = 0; i <= 8; i++) {
    const y = y0 + rr + ((y1 - y0 - 2 * rr) * i) / 8;
    pts.push(new V2(r(y) + Math.sin((i / 8) * Math.PI) * 0.006, y));
  }
  pts.push(new V2(r(y1), y1 - rr * 0.3));
  pts.push(new V2(r(y1) - out * 1.3, y1));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** A rounded rolled lip at the shaker mouth */
export function shakerLipGeometry() {
  const r = shakerRadius(SHAKER.h) + 0.004;
  const g = new THREE.TorusGeometry(r, 0.03, 16, 96);
  g.rotateX(Math.PI / 2);
  g.translate(0, SHAKER.h, 0);
  return g;
}

/** The base: a heavier chrome foot */
export function shakerFootGeometry() {
  const pts: THREE.Vector2[] = [new V2(0, -0.005)];
  const c = 0.17;
  for (let i = 0; i <= 12; i++) {
    const a = (Math.PI / 2) * (i / 12);
    pts.push(new V2(SHAKER.r0 + 0.018 - c + Math.sin(a) * c, c - Math.cos(a) * c - 0.005));
  }
  pts.push(new V2(shakerRadius(0.34) + 0.018, 0.34));
  pts.push(new V2(shakerRadius(0.36) + 0.006, 0.365));
  pts.push(new V2(shakerRadius(0.36) - 0.01, 0.37));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** Cobbler cap: sleeve, shoulder, neck, little domed lid. Sits on the shaker mouth. */
export function capGeometry() {
  const r = SHAKER.r1 + 0.035;
  const pts: THREE.Vector2[] = [new V2(r - 0.03, -0.2), new V2(r, -0.19), new V2(r + 0.004, 0.14)];
  pts.push(...cubic(new V2(r + 0.004, 0.14), new V2(r, 0.36), new V2(0.36, 0.38), new V2(0.3, 0.6), 18).slice(1));
  pts.push(new V2(0.29, 0.68), new V2(0.33, 0.69), new V2(0.335, 0.72));
  pts.push(...cubic(new V2(0.335, 0.72), new V2(0.33, 0.82), new V2(0.18, 0.86), new V2(0.0, 0.865), 12).slice(1));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** Shot glass: heavy base, straight flared walls. Lip at y = 0.5. */
export const SHOT = { h: 0.5, lip: 0.215, floor: 0.1 };
export function shotGeometry() {
  const pts = [
    new V2(0, 0),
    new V2(0.165, 0),
    new V2(0.172, 0.012),
    new V2(0.215, 0.5),
    new V2(0.208, 0.508),
    new V2(0.198, 0.5),
    new V2(0.158, SHOT.floor + 0.01),
    new V2(0.15, SHOT.floor),
    new V2(0, SHOT.floor),
  ];
  const g = new THREE.LatheGeometry(pts, 48);
  g.computeVertexNormals();
  return g;
}
export function shotLiquidGeometry() {
  // unit fill: scaled in y by the amount left
  const pts = [new V2(0, 0), new V2(0.152, 0), new V2(0.188, 0.32), new V2(0, 0.32)];
  const g = new THREE.LatheGeometry(pts, 40);
  g.computeVertexNormals();
  return g;
}

/** A soft round texture: shadows and the coloured glow under the glass */
export function glowTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A four-point sparkle for the moment liquid turns into a gem */
export function sparkleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,.65)");
  g.addColorStop(0.4, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  x.fillStyle = "rgba(255,255,255,.95)";
  x.beginPath();
  x.moveTo(64, 2);
  x.quadraticCurveTo(68, 60, 126, 64);
  x.quadraticCurveTo(68, 68, 64, 126);
  x.quadraticCurveTo(60, 68, 2, 64);
  x.quadraticCurveTo(60, 60, 64, 2);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

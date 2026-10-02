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

/* ───────────── glasses ───────────── */

export type GlassKind = "coupe" | "wavy" | "goblet";
export type GlassSpec = {
  /** rim radius, rim height, foot radius */
  rim: number;
  top: number;
  base: number;
  /** the drink: where the bowl's floor is, and the surface when the glass is full */
  y0: number;
  full: number;
  /** the whole outline, foot to rim and back down the inside (a lathe profile) */
  profile: THREE.Vector2[];
  inner: THREE.Vector2[];
  outer: THREE.Vector2[];
  /** a scalloped rim: `n` waves, `amp` tall, starting to rise at height `from` */
  wave?: { n: number; amp: number; from: number };
};

function spec(o: {
  foot: THREE.Vector2[];
  outer: THREE.Vector2[];
  inner: THREE.Vector2[];
  lip: THREE.Vector2[];
  base: number;
  y0: number;
  full: number;
  wave?: GlassSpec["wave"];
}): GlassSpec {
  const rimPt = o.outer[o.outer.length - 1];
  return {
    rim: rimPt.x,
    top: rimPt.y,
    base: o.base,
    y0: o.y0,
    full: o.full,
    profile: [...o.foot, ...o.outer, ...o.lip, ...[...o.inner].reverse().slice(1)],
    inner: o.inner,
    outer: o.outer,
    wave: o.wave,
  };
}

export const GLASSES: Record<GlassKind, GlassSpec> = {
  /** Nunchi's: a round-bottomed coupe on a thin stem. Bowl bottom at y ≈ 0.86, rim at 1.72. */
  coupe: spec({
    foot: [
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
    ],
    outer: cubic(new V2(0.07, 0.86), new V2(0.38, 0.84), new V2(0.74, 1.12), new V2(0.8, 1.72), 28),
    lip: [new V2(0.792, 1.728), new V2(0.781, 1.718)],
    inner: cubic(new V2(0.0, 0.905), new V2(0.36, 0.895), new V2(0.72, 1.14), new V2(0.778, 1.71), 40),
    base: 0.445,
    y0: 0.912,
    full: 1.6,
  }),
  /** Amae's: wide and shallow, a scalloped rim, a short turned stem with a knob, a broad foot. */
  wavy: spec({
    foot: [
      new V2(0.0, 0),
      new V2(0.6, 0),
      new V2(0.635, 0.014),
      new V2(0.628, 0.04),
      new V2(0.5, 0.058),
      new V2(0.28, 0.09),
      new V2(0.14, 0.14),
      new V2(0.085, 0.22),
      new V2(0.08, 0.29),
      new V2(0.11, 0.35),
      new V2(0.165, 0.4),
      new V2(0.172, 0.44),
      new V2(0.135, 0.49),
      new V2(0.088, 0.55),
      new V2(0.076, 0.66),
      new V2(0.09, 0.77),
      new V2(0.13, 0.84),
    ],
    outer: cubic(new V2(0.14, 0.87), new V2(0.62, 0.86), new V2(1.07, 1.08), new V2(1.12, 1.6), 30),
    lip: [new V2(1.112, 1.61), new V2(1.098, 1.6)],
    inner: cubic(new V2(0.0, 0.93), new V2(0.6, 0.92), new V2(1.045, 1.1), new V2(1.098, 1.59), 40),
    base: 0.635,
    y0: 0.94,
    full: 1.46,
    wave: { n: 9, amp: 0.05, from: 1.32 },
  }),
  /** Yuánfèn's: a deep round bowl with nearly straight sides, on a short turned stem */
  goblet: spec({
    foot: [
      new V2(0.0, 0),
      new V2(0.46, 0),
      new V2(0.49, 0.012),
      new V2(0.485, 0.036),
      new V2(0.36, 0.056),
      new V2(0.17, 0.09),
      new V2(0.09, 0.15),
      new V2(0.072, 0.24),
      new V2(0.085, 0.31),
      new V2(0.125, 0.36),
      new V2(0.132, 0.4),
      new V2(0.1, 0.45),
      new V2(0.076, 0.51),
      new V2(0.08, 0.57),
      new V2(0.11, 0.62),
    ],
    outer: cubic(new V2(0.12, 0.65), new V2(0.6, 0.63), new V2(0.7, 0.92), new V2(0.74, 1.9), 30),
    lip: [new V2(0.732, 1.908), new V2(0.72, 1.898)],
    inner: cubic(new V2(0.0, 0.7), new V2(0.56, 0.69), new V2(0.67, 0.94), new V2(0.718, 1.89), 40),
    base: 0.49,
    y0: 0.71,
    full: 1.72,
  }),
};
/** Kept for the pours and the garnish, which were laid out on the plain coupe */
export const GLASS = { rim: GLASSES.coupe.rim, top: GLASSES.coupe.top, bowlFloor: 0.9 };

/** How far the rim rises at angle `th` (0 for a plain rim); `k` = 0 where the wave starts, 1 at the rim */
export function rimWave(s: GlassSpec, th: number, k = 1) {
  return s.wave ? s.wave.amp * k * (Math.cos(th * s.wave.n) + 0.35) : 0;
}

export function glassGeometry(kind: GlassKind = "coupe") {
  const s = GLASSES[kind];
  // a scalloped rim needs more steps around, or each wave is a zigzag
  const g = new THREE.LatheGeometry(s.profile, s.wave ? 216 : 72);
  if (s.wave) {
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = THREE.MathUtils.smoothstep(y, s.wave.from, s.top);
      if (k > 0) p.setY(i, y + rimWave(s, Math.atan2(p.getZ(i), p.getX(i)), k));
    }
  }
  g.computeVertexNormals();
  return g;
}

/** A thin band that follows the rim (Amae's rose-gold edge) */
export function rimGeometry(kind: GlassKind, thick = 0.013) {
  const s = GLASSES[kind];
  const pts: THREE.Vector3[] = [];
  const n = 216;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(th) * (s.rim - 0.006), s.top + rimWave(s, th) + 0.006, Math.sin(th) * (s.rim - 0.006)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), n * 2, thick, 8, true);
}

const radiusAt = (samples: THREE.Vector2[], y: number) => {
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if (y <= b.y) return a.x + ((b.x - a.x) * (y - a.y)) / Math.max(1e-6, b.y - a.y);
  }
  return samples[samples.length - 1].x;
};
/** Inner radius of the bowl at height y */
export const bowlRadius = (y: number, kind: GlassKind = "coupe") => radiusAt(GLASSES[kind].inner, y);
/** Outer radius of the bowl at height y (what a drip runs down) */
export const outerRadius = (y: number, kind: GlassKind = "coupe") => radiusAt(GLASSES[kind].outer, y);

/** The drink, filled to `fill` (0–1 of the bowl) */
export function liquidGeometry(fill: number, kind: GlassKind = "coupe") {
  const s = GLASSES[kind];
  const y0 = s.y0;
  const y1 = y0 + (s.full - y0) * Math.max(0.02, fill);
  const pts: THREE.Vector2[] = [new V2(0, y0)];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    pts.push(new V2(Math.max(0.001, bowlRadius(y, kind) - 0.006), y));
  }
  pts.push(new V2(0, y1));
  const g = new THREE.LatheGeometry(pts, 64);
  g.computeVertexNormals();
  return { geometry: g, surface: y1 };
}

/** A cut ice cube: a box with its corners knocked in, every corner a little off (Amae's ice) */
export function iceCubeGeometry(seed: number, s = 0.3) {
  const g = new THREE.BoxGeometry(s, s * 0.9, s * 0.95, 2, 2, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const rand = mulberry(seed);
  const moved = new Map<string, number>();
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const key = `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`;
    let k = moved.get(key);
    if (k === undefined) {
      k = 0.94 + rand() * 0.12;
      moved.set(key, k);
    }
    // pull toward a sphere: corners come in the most, face centres barely move
    const round = v.clone().normalize().multiplyScalar(s * 0.6);
    v.lerp(round, 0.24).multiplyScalar(k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
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

/* ───────────── Amae's garnish: a cloud of cream, a heart-topped pick, a blossom, a wheel of grapefruit ───────────── */

/** A heart outline `w` wide, centred, tip down */
export function heartShape(w: number) {
  // the classic heart path (22 × 19 units), flipped so the tip points down and centred on 0
  const k = w / 22;
  const P = (x: number, y: number): [number, number] => [(x - 5) * k, -(y - 9.5) * k];
  const s = new THREE.Shape();
  s.moveTo(...P(5, 5));
  s.bezierCurveTo(...P(5, 5), ...P(4, 0), ...P(0, 0));
  s.bezierCurveTo(...P(-6, 0), ...P(-6, 7), ...P(-6, 7));
  s.bezierCurveTo(...P(-6, 11), ...P(-3, 15.4), ...P(5, 19));
  s.bezierCurveTo(...P(12, 15.4), ...P(16, 11), ...P(16, 7));
  s.bezierCurveTo(...P(16, 7), ...P(16, 0), ...P(10, 0));
  s.bezierCurveTo(...P(7, 0), ...P(5, 5), ...P(5, 5));
  return s;
}

/** A puffy heart: an extruded outline with a deep round bevel, so it reads like a soft candy */
export function puffyHeartGeometry(w: number, puff = 0.36) {
  const g = new THREE.ExtrudeGeometry(heartShape(w), {
    depth: w * 0.08,
    bevelEnabled: true,
    bevelThickness: w * puff * 0.55,
    bevelSize: w * 0.12,
    bevelSegments: 12,
    curveSegments: 40,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** A short arc as a thin tube (closed eyes, a smile) */
export function arcGeometry(r: number, a0: number, a1: number, thick: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = a0 + ((a1 - a0) * i) / 16;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, thick, 8, false);
}

/** A hand-drawn "z" for the sleeping heart */
export function zTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  x.strokeStyle = "rgba(22,21,19,.9)";
  x.lineWidth = 6;
  x.lineCap = "round";
  x.lineJoin = "round";
  x.beginPath();
  x.moveTo(15, 17);
  x.quadraticCurveTo(32, 14, 47, 16);
  x.lineTo(16, 47);
  x.quadraticCurveTo(32, 49, 49, 46);
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** One cherry-blossom petal, `len` long: a rounded teardrop with the notch at its tip, gently cupped */
export function petalGeometry(len: number, w: number, cup = 0.5) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.95, len * 0.2, w * 0.8, len * 0.88, w * 0.2, len);
  s.lineTo(0, len * 0.86);
  s.lineTo(-w * 0.2, len);
  s.bezierCurveTo(-w * 0.8, len * 0.88, -w * 0.95, len * 0.2, 0, 0);
  const g = new THREE.ShapeGeometry(s, 14);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    p.setZ(i, (cup * (y * y)) / len + (cup * 1.4 * (x * x)) / w);
  }
  g.computeVertexNormals();
  return g;
}

/** The cut face of a pink grapefruit wheel */
export function citrusTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const disc = (r: number, fill: string | CanvasGradient) => {
    x.fillStyle = fill;
    x.beginPath();
    x.arc(128, 128, r, 0, Math.PI * 2);
    x.fill();
  };
  disc(128, "#f6a183");
  disc(117, "#fff1e4");
  const g = x.createRadialGradient(128, 128, 8, 128, 128, 110);
  g.addColorStop(0, "#ffb9a2");
  g.addColorStop(0.7, "#f98f78");
  g.addColorStop(1, "#f47a68");
  disc(109, g);
  // juice sacs: fine pale streaks running out from the middle
  x.lineCap = "round";
  for (let i = 0; i < 260; i++) {
    const a = (i / 260) * Math.PI * 2 + Math.sin(i * 12.9) * 0.03;
    const r0 = 22 + ((i * 37) % 30);
    const r1 = r0 + 14 + ((i * 53) % 34);
    x.strokeStyle = `rgba(255,236,224,${0.1 + ((i * 17) % 10) / 60})`;
    x.lineWidth = 1.6;
    x.beginPath();
    x.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0);
    x.lineTo(128 + Math.cos(a) * Math.min(106, r1), 128 + Math.sin(a) * Math.min(106, r1));
    x.stroke();
  }
  // the membranes between the segments
  x.strokeStyle = "#ffe9dc";
  x.lineWidth = 5;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    x.beginPath();
    x.moveTo(128 + Math.cos(a) * 9, 128 + Math.sin(a) * 9);
    x.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110);
    x.stroke();
  }
  disc(11, "#ffeee2");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Light through a full glass: soft streaks fanning out on the counter (tinted by the drink) */
export function causticTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const rand = mulberry(77);
  try {
    x.filter = "blur(2.5px)";
  } catch {
    /* no canvas filters: the streaks are just a little crisper */
  }
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r0 = 18 + rand() * 30;
    const len = 34 + rand() * 62;
    const w = 3 + rand() * 7;
    x.save();
    x.translate(128, 128);
    x.rotate(a);
    const g = x.createLinearGradient(r0, 0, r0 + len, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.35, `rgba(255,255,255,${0.35 + rand() * 0.4})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.beginPath();
    x.ellipse(r0 + len / 2, 0, len / 2, w, 0, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A pointed leaf, `len` long and `w` to each side, folded a little along its midrib */
export function leafGeometry(len: number, w: number, fold = 0.5) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(w * 1.25, len * 0.38, 0, len);
  s.quadraticCurveTo(-w * 1.25, len * 0.38, 0, 0);
  const g = new THREE.ShapeGeometry(s, 16);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    p.setZ(i, (fold * Math.abs(x) * 0.9) + (0.18 * y * y) / len);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * A flat band along a curve that lies against a round glass (a ribbon tied around the bowl):
 * its width runs up and down, its thickness points away from the glass's axis.
 */
export function bandGeometry(curve: THREE.Curve<THREE.Vector3>, segs: number, w: number, th: number, twist = 0) {
  const pos: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3(),
    T = new THREE.Vector3(),
    R = new THREE.Vector3(),
    B = new THREE.Vector3(),
    N = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    curve.getPointAt(u, P);
    curve.getTangentAt(u, T);
    R.set(P.x, 0, P.z).normalize();
    B.crossVectors(R, T).normalize();
    N.crossVectors(T, B).normalize();
    // silk turns over a little toward its tails; tape wouldn't
    const a = twist * Math.cos(u * Math.PI) ** 3;
    B.applyAxisAngle(T, a);
    N.applyAxisAngle(T, a);
    const e = Math.min(1, u * 9, (1 - u) * 9);
    const hw = (w / 2) * (0.45 + 0.55 * e);
    for (const [x, y] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      pos.push(P.x + B.x * hw * x + N.x * (th / 2) * y, P.y + B.y * hw * x + N.y * (th / 2) * y, P.z + B.z * hw * x + N.z * (th / 2) * y);
  }
  for (let i = 0; i < segs; i++)
    for (let f = 0; f < 4; f++) {
      const a = i * 4 + f,
        b = i * 4 + ((f + 1) % 4),
        c = a + 4,
        d = b + 4;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

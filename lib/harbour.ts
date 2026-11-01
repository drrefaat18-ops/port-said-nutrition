import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { friezeCanvas } from "./frieze";

export type Harbour = { setProgress(p: number, snap?: boolean): void; resize(): void; dispose(): void };

// ---- Time of day ---------------------------------------------------------------------------

// One gold lighthouse on the quay of four Port Said photographs. The camera is fixed by the photographs; it only pushes in.
type Stop = { at: number; plate: string; sat: number; key: number; keyI: number; az: number; el: number; env: number; lamp: number; bloom: number };
const STOPS: Stop[] = [
  { at: 0.0, plate: "dawn", sat: 0.7, key: 0xffd2b8, keyI: 1.0, az: -70, el: 12, env: 1.1, lamp: 0, bloom: 0.18 },
  { at: 0.35, plate: "day", sat: 0.2, key: 0xffe6bd, keyI: 2.2, az: -35, el: 45, env: 1.05, lamp: 0, bloom: 0.16 },
  { at: 0.67, plate: "sunset", sat: 1, key: 0xff9a4a, keyI: 1.8, az: -60, el: 10, env: 1.15, lamp: 0.2, bloom: 0.26 },
  { at: 0.88, plate: "night", sat: 0.6, key: 0xa9b8ff, keyI: 0.7, az: -50, el: 30, env: 1.2, lamp: 1, bloom: 0.3 },
];
// Measured on the plates, as fractions of the photo.
const HORIZON = 0.355; // from the bottom
const PLATE_ASPECT = 1080 / 1935;
const SPOT = 0.33; // where the tower stands across the quay
const QUAY_Y = 0.656; // quay surface at the tower, from the top
// Solved from those: eye, quay height and distance put the base and the waterline where the photo has them.
const DIST = 148, EYE = 4.6, QUAY = 3.45;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

function segment(p: number) {
  const x = clamp01(p);
  let i = 0;
  while (i < STOPS.length - 2 && x > STOPS[i + 1].at) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  return { i, a, b, t: smooth(clamp01((x - a.at) / (b.at - a.at))) };
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- Shaders -------------------------------------------------------------------------------

const BACK_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`;

// The photographs, with their sea moving, the lighthouse's reflection, its shadow and the frieze laid in.
const BACK_FRAG = /* glsl */ `
uniform sampler2D uA, uB, uRefl, uFrieze;
uniform float uMix, uTime, uShade;
uniform vec2 uCover, uBase;
uniform vec3 uGold;
varying vec2 vUv;
const float H = ${HORIZON.toFixed(3)};
vec2 ripple(vec2 q, float t) {
  float s = 1.0 / (q.y + 0.05);
  vec2 p = vec2(q.x * s * 2.2, s * 3.4);
  float a = sin(p.y * 2.3 + t * 1.1 + sin(p.x * 3.1 + t * 0.6));
  float b = sin(p.y * 4.1 - t * 1.4 + p.x * 5.3);
  return vec2(a * 0.6, b * 0.6 + a * 0.4);
}
// quay edges, measured from the top of the photo at its left tip and right edge
float line(float x, float y0, float y1) { return 1.0 - (y0 + (x - 0.125) * (y1 - y0) / 0.875); }
void main() {
  vec2 base = vec2((vUv.x - 0.5) * uCover.x + 0.5, (vUv.y - H) * uCover.y + H);
  float shore = base.x < 0.125 ? H - 0.005 : line(base.x, 0.672, 0.738);
  float d = clamp((shore - base.y) / shore, 0.0, 1.0);
  float wet = smoothstep(0.0, 0.03, shore - base.y);
  vec2 wob = ripple(vec2(base.x, d), uTime) * wet;
  vec2 uv = base + wob * vec2(0.0016, 0.0024) * (0.25 + d * d * 2.4);
  vec3 col = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);

  // gold inlay on the quay wall
  float top = line(base.x, 0.652, 0.690);
  if (base.x > 0.16 && base.y < top && base.y > shore) {
    vec4 f = texture2D(uFrieze, vec2((base.x - 0.16) / 0.84, (base.y - shore) / (top - shore)));
    col = mix(col, uGold, f.a * 0.92);
  }

  // the tower's contact shadow on the quay
  vec2 s = (vUv - uBase - vec2(0.018, 0.0)) * vec2(uCover.y / uCover.x, 9.0);
  col *= 1.0 - uShade * exp(-dot(s, s) * 90.0);

  if (wet > 0.0) {
    vec2 r = vUv + wob * vec2(0.006, 0.003) * (0.35 + d * 1.4);
    vec4 c = texture2D(uRefl, r) * 0.4 + texture2D(uRefl, r + vec2(0.0, 0.006)) * 0.3 + texture2D(uRefl, r - vec2(0.0, 0.006)) * 0.3;
    col = mix(col, c.rgb / max(c.a, 0.001), c.a * 0.5 * wet * (1.0 - d * 0.5));
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const BEAM_VERT = /* glsl */ `
varying float vT; varying vec3 vN; varying vec3 vV;
void main() {
  vT = clamp(position.z / 170.0, 0.0, 1.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const BEAM_FRAG = /* glsl */ `
uniform float uOpacity; varying float vT; varying vec3 vN; varying vec3 vV;
void main() {
  float edge = pow(abs(dot(normalize(vN), normalize(vV))), 2.4);
  gl_FragColor = vec4(1.0, 0.8, 0.45, uOpacity * edge * pow(1.0 - vT, 1.7));
}`;

// ---- Materials and shapes ------------------------------------------------------------------

function brushed(): THREE.CanvasTexture {
  const S = 512, cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#8a8a8a";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const v = 110 + Math.random() * 60;
    g.fillStyle = `rgba(${v},${v},${v},0.16)`;
    g.fillRect(Math.random() * S, Math.random() * S, 1, 20 + Math.random() * 90);
  }
  g.fillStyle = "rgba(20,20,20,0.75)";
  for (let y = 0; y < 12; y++) g.fillRect(0, (y * S) / 12, S, 2); // panel seams
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 1);
  t.anisotropy = 8;
  return t;
}

function stone(): THREE.CanvasTexture {
  const S = 256, cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#6a6a6a";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 5000; i++) {
    const v = 60 + Math.random() * 120;
    g.fillStyle = `rgba(${v},${v},${v},0.3)`;
    g.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 2);
  return t;
}

// A lathe with flat facets, the way the real tower is eight sided.
function facets(pts: [number, number][], sides: number) {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), sides).toNonIndexed();
  g.computeVertexNormals();
  return g;
}
const round = (pts: [number, number][], sides = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), sides);

// Equirect from a plate: the photo mirrored into a full circle, horizon on the equator.
function plateEnv(pmrem: THREE.PMREMGenerator, img: HTMLImageElement, saturate: number) {
  const W = 1024, H = 512, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.filter = `contrast(1.35) saturate(${saturate})`; // blue sky on gold turns it green, so day is drained
  const iw = img.naturalWidth, ih = img.naturalHeight, cut = ih * (1 - HORIZON);
  for (const flip of [false, true]) {
    g.save();
    if (flip) { g.translate(W, 0); g.scale(-1, 1); }
    g.drawImage(img, 0, 0, iw, cut, 0, 0, W / 2, H / 2);
    g.drawImage(img, 0, cut, iw, ih - cut, 0, H / 2, W / 2, H / 2);
    g.restore();
  }
  // a photographer's strip lights: what makes polished metal read as metal
  g.filter = "none";
  g.globalCompositeOperation = "lighter";
  for (const [x, w, a] of [[0.14, 0.05, 0.9], [0.36, 0.018, 0.7], [0.62, 0.09, 0.55], [0.86, 0.025, 0.8]]) {
    const b = g.createLinearGradient((x - w) * W, 0, (x + w) * W, 0);
    b.addColorStop(0, "rgba(255,240,215,0)"); b.addColorStop(0.5, `rgba(255,240,215,${a})`); b.addColorStop(1, "rgba(255,240,215,0)");
    g.fillStyle = b;
    g.fillRect((x - w) * W, H * 0.06, 2 * w * W, H * 0.7);
  }
  const t = new THREE.CanvasTexture(cv);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  const out = pmrem.fromEquirectangular(t).texture;
  t.dispose();
  return out;
}

// ---- Scene ---------------------------------------------------------------------------------

export async function createHarbour(canvas: HTMLCanvasElement): Promise<Harbour> {
  const loader = new THREE.TextureLoader();
  const plates = await Promise.all(STOPS.map((s) => loader.loadAsync(`/sky/${s.plate}.webp`)));
  for (const t of plates) { t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  // Neutral, not ACES: it leaves the photographs' colours alone below the highlights.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envs = plates.map((t, i) => plateEnv(pmrem, t.image as HTMLImageElement, STOPS[i].sat));
  pmrem.dispose();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 1500);
  camera.position.set(0, EYE, DIST); // level, so verticals stay straight and the horizon stays the photographs'
  camera.lookAt(0, EYE, 0);
  const disposables: { dispose(): void }[] = [...plates, ...envs];
  const own = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // backdrop
  const frieze = own(new THREE.CanvasTexture(friezeCanvas()));
  frieze.anisotropy = 8;
  const reflRT = own(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType }));
  const backMat = own(new THREE.ShaderMaterial({
    vertexShader: BACK_VERT, fragmentShader: BACK_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uA: { value: plates[0] }, uB: { value: plates[1] }, uRefl: { value: reflRT.texture }, uFrieze: { value: frieze }, uMix: { value: 0 }, uTime: { value: 0 }, uShade: { value: 0.6 }, uCover: { value: new THREE.Vector2(1, 1) }, uBase: { value: new THREE.Vector2(SPOT, 1 - QUAY_Y) }, uGold: { value: new THREE.Color() } },
  }));
  const back = new THREE.Mesh(own(new THREE.PlaneGeometry(2, 2)), backMat);
  back.frustumCulled = false;
  back.renderOrder = -10;
  scene.add(back);

  // the lighthouse, gold over dark granite
  const brush = own(brushed()), grain = own(stone());
  const gold = own(new THREE.MeshPhysicalMaterial({ color: 0xecc06a, metalness: 1, roughness: 0.34, roughnessMap: brush, bumpMap: brush, bumpScale: 0.25, clearcoat: 0.6, clearcoatRoughness: 0.12 }));
  const polished = own(new THREE.MeshPhysicalMaterial({ color: 0xf2d083, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1 }));
  const granite = own(new THREE.MeshStandardMaterial({ color: 0x24262c, roughness: 0.7, metalness: 0.1, roughnessMap: grain, bumpMap: grain, bumpScale: 0.6 }));
  const glass = own(new THREE.MeshStandardMaterial({ color: 0x0c1016, roughness: 0.08, metalness: 0.9, emissive: 0xffc56e, emissiveIntensity: 0 }));
  const lantern = own(new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.25, toneMapped: false }));
  const lamp = own(new THREE.MeshBasicMaterial({ color: 0xfff0c8 }));

  const hero = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, y = 0) => {
    const o = new THREE.Mesh(own(g), m);
    o.position.y = y;
    hero.add(o);
    return o;
  };

  add(facets([[0, 0], [7.6, 0], [7.6, 1.4], [6.6, 1.4], [6.6, 3], [0, 3]], 8), granite);
  add(round([[5.9, 3], [5.9, 4.4], [5.35, 4.9], [5.2, 5.4], [3.5, 39]], 96), gold);
  const radius = (y: number) => mix(5.2, 3.5, (y - 5.4) / 33.6);
  for (const y of [15.8, 27]) add(round([[radius(y) + 0.02, y - 0.3], [radius(y) + 0.24, y - 0.16], [radius(y) + 0.24, y + 0.16], [radius(y) + 0.02, y + 0.3]], 96), polished);

  // narrow arched windows on alternate faces
  const arch = new THREE.Shape();
  arch.moveTo(-0.5, 0); arch.lineTo(0.5, 0); arch.lineTo(0.5, 1.9); arch.absarc(0, 1.9, 0.5, 0, Math.PI, false); arch.lineTo(-0.5, 0);
  const archGeo = own(new THREE.ExtrudeGeometry(arch, { depth: 0.08, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 }));
  const lean = Math.atan((5.2 - 3.5) / 33.6);
  for (const y of [10.5, 21.5, 32]) for (let k = 0; k < 8; k += 2) {
    const th = ((k + 0.5) * Math.PI) / 4, a = radius(y + 1.2) - 0.05;
    const w = new THREE.Mesh(archGeo, glass);
    w.position.set(Math.sin(th) * a, y, Math.cos(th) * a);
    w.rotation.set(-lean, th, 0, "YXZ");
    hero.add(w);
  }

  // gallery, lantern room, dome
  add(round([[3.5, 39], [4.9, 40.2], [5.1, 40.2], [5.1, 40.55], [0, 40.55]]), polished);
  const rail = new THREE.InstancedMesh(own(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6)), polished, 40);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) {
    const th = (i / 40) * Math.PI * 2;
    rail.setMatrixAt(i, mtx.makeTranslation(Math.sin(th) * 4.95, 41.2, Math.cos(th) * 4.95));
  }
  hero.add(rail);
  for (const y of [41.85, 41.3]) {
    const r = add(new THREE.TorusGeometry(4.95, 0.05, 8, 64), polished, y);
    r.rotation.x = Math.PI / 2;
  }
  add(facets([[2.75, 40.55], [2.75, 41.1], [2.55, 41.25], [2.55, 45.4], [2.95, 45.5], [2.95, 45.8]], 8), glass);
  add(new THREE.SphereGeometry(1.1, 24, 16), lamp, 43.2);
  const pane = add(new THREE.CylinderGeometry(2.6, 2.6, 4.2, 8, 1, true), lantern, 43.3);
  pane.renderOrder = 2;
  for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI) / 4;
    const b = add(new THREE.BoxGeometry(0.1, 4.3, 0.1), polished, 43.3);
    b.position.x = Math.sin(th) * 2.6; b.position.z = Math.cos(th) * 2.6;
  }
  add(round([[3.0, 45.8], [2.5, 46.5], [1.5, 47.3], [0.5, 47.8], [0.2, 48.2], [0.2, 48.6]]), polished);
  add(new THREE.SphereGeometry(0.34, 24, 16), polished, 48.85);
  add(new THREE.CylinderGeometry(0.02, 0.09, 2.2, 8), polished, 50.2);
  scene.add(hero);

  // Two copies with their own reflections: the second fades in over the first across a change of plate.
  const skins = new Map<THREE.Material, THREE.Material>();
  const fade = hero.clone();
  fade.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !(m.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) { if (m.isMesh) m.visible = false; return; }
    const src = m.material as THREE.MeshStandardMaterial;
    if (!skins.has(src)) skins.set(src, own(Object.assign(src.clone(), { transparent: true, depthWrite: false })));
    m.material = skins.get(src)!;
    m.renderOrder = 1;
  });
  scene.add(fade);
  const pbrA = [...skins.keys()] as THREE.MeshStandardMaterial[], pbrB = [...skins.values()] as THREE.MeshStandardMaterial[];

  // lights: key follows the camera, the moon and lantern lift the gold at night
  const key = new THREE.DirectionalLight(0xffffff, 1);
  const lampLight = new THREE.PointLight(0xffd27a, 0, 60, 1.4);
  const wash = new THREE.PointLight(0xffc268, 0, 260, 1.1); // floodlight from off shore
  scene.add(key, key.target, lampLight, wash);

  // beam
  const beamMat = own(new THREE.ShaderMaterial({
    vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0 } },
  }));
  const coneGeo = own(new THREE.ConeGeometry(17, 170, 48, 1, true));
  coneGeo.translate(0, -85, 0);
  coneGeo.rotateX(-Math.PI / 2);
  const pivot = new THREE.Group();
  const beamB = new THREE.Mesh(coneGeo, beamMat);
  beamB.rotation.y = Math.PI;
  pivot.add(new THREE.Mesh(coneGeo, beamMat), beamB);
  scene.add(pivot);

  // finish
  const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 2 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.3, 0.6, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // loop
  let goal = 0, current = 0, reflected = -1, lastW = 0, lastH = 0, raf = 0, last = performance.now(), time = 0, disposed = false, seg = -1;
  const colA = new THREE.Color(), colB = new THREE.Color();

  function apply() {
    const { i, a, b, t } = segment(current);
    if (i !== seg) {
      seg = i;
      backMat.uniforms.uA.value = plates[i];
      backMat.uniforms.uB.value = plates[i + 1];
      for (const m of pbrA) m.envMap = envs[i];
      for (const m of pbrB) m.envMap = envs[i + 1];
    }
    backMat.uniforms.uMix.value = t;
    const env = mix(a.env, b.env, t);
    for (const m of pbrA) m.envMapIntensity = env;
    for (const m of pbrB) { m.envMapIntensity = env; m.opacity = t; }
    fade.visible = t > 0.001;

    // a slow push in: photo and lens zoom together, held on the horizon
    const push = 1 + current * 0.08, tan = (Math.tan(THREE.MathUtils.degToRad(20)) * Math.min(1, PLATE_ASPECT / camera.aspect)) / push;
    const cover = backMat.uniforms.uCover.value, glow0 = mix(a.lamp, b.lamp, t);
    cover.set(Math.min(1, camera.aspect / PLATE_ASPECT) / push, Math.min(1, PLATE_ASPECT / camera.aspect) / push);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tan));
    camera.updateProjectionMatrix();
    const x = ((SPOT - 0.5) / cover.x) * 2 * DIST * tan * camera.aspect;
    hero.position.set(x, QUAY, 0);
    fade.position.copy(hero.position);
    hero.rotation.y = fade.rotation.y = current * 1.2;
    pivot.position.set(x, QUAY + 43.2, 0);
    lampLight.position.copy(pivot.position);
    backMat.uniforms.uBase.value.set((SPOT - 0.5) / cover.x + 0.5, (1 - QUAY_Y - HORIZON) / cover.y + HORIZON);
    backMat.uniforms.uShade.value = 0.6 * (1 - glow0 * 0.5);
    backMat.uniforms.uGold.value.copy(colA.setHex(a.key)).lerp(colB.setHex(b.key), t).multiply(colB.setHex(0xd9a441)).multiplyScalar(0.55 + glow0 * 0.25);

    const az = THREE.MathUtils.degToRad(mix(a.az, b.az, t)), el = THREE.MathUtils.degToRad(mix(a.el, b.el, t));
    key.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(200);
    key.color.copy(colA.setHex(a.key)).lerp(colB.setHex(b.key), t);
    key.intensity = mix(a.keyI, b.keyI, t);

    const glow = mix(a.lamp, b.lamp, t);
    glass.emissiveIntensity = glow * 1.3;
    (skins.get(glass) as THREE.MeshStandardMaterial).emissiveIntensity = glow * 1.3;
    lantern.opacity = 0.15 + glow * 0.35;
    lamp.color.setRGB(1 + glow * 2, 0.9 + glow * 1.5, 0.7 + glow * 0.7);
    lampLight.intensity = glow * 300;
    wash.position.set(x - 46, QUAY + 30, 90);
    wash.intensity = glow * 260;
    beamMat.uniforms.uOpacity.value = glow * glow * 0.55;
    bloom.strength = mix(a.bloom, b.bloom, t);
  }

  function draw() {
    // the reflection: the same hero, flipped at the waterline, without backdrop or beam. Only redrawn when the day moves.
    if (Math.abs(current - reflected) > 0.0005) {
      reflected = current;
      back.visible = pivot.visible = false;
      hero.scale.y = fade.scale.y = -1;
      hero.position.y = fade.position.y = -QUAY;
      renderer.setRenderTarget(reflRT);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      hero.scale.y = fade.scale.y = 1;
      hero.position.y = fade.position.y = QUAY;
      back.visible = pivot.visible = true;
    }
    composer.render();
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now; time += dt;
    current += (goal - current) * Math.min(1, dt * 3.2);
    backMat.uniforms.uTime.value = time;
    pivot.rotation.y = time * 0.5;
    apply();
    draw();
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, pr = renderer.getPixelRatio(), aspect = w / h;
    if (w === lastW && h === lastH) return; // reallocating every target wipes the frame and costs memory
    lastW = w; lastH = h;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    reflRT.setSize(Math.ceil((w * pr) / 3), Math.ceil((h * pr) / 3));
    reflected = -1;
    camera.aspect = aspect;
    // lens shift: the camera stays level and the horizon drops to the plates' height, verticals stay straight
    camera.setViewOffset(w, h, 0, -(0.5 - HORIZON) * h, w, h);
    apply();
    draw(); // setSize clears the canvas: repaint now, or the poster flashes through
  }

  resize();
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p, snap = false) { goal = clamp01(p); if (snap) current = goal; },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      for (const d of disposables) d.dispose();
      rail.dispose();
      composer.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}

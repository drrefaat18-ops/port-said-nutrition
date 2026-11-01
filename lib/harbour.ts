import * as THREE from "three";

export type Harbour = { setProgress(p: number, snap?: boolean): void; resize(): void; dispose(): void };

// ---- Time of day ---------------------------------------------------------------------------

type Stop = {
  at: number;
  skyTop: number; skyBot: number; fog: number;
  key: number; keyI: number; hemiSky: number; hemiGnd: number; hemiI: number;
  deep: number; night: number; lamp: number;
};

// Same four phases as app/tokens.css: dawn, day, sunset (the handover), night.
const STOPS: Stop[] = [
  { at: 0.0, skyTop: 0x8cbff0, skyBot: 0xffd0a0, fog: 0xf6d2b4, key: 0xffc58a, keyI: 2.2, hemiSky: 0xc8dcff, hemiGnd: 0x9a806c, hemiI: 1.05, deep: 0x2b7ea0, night: 0, lamp: 0 },
  { at: 0.35, skyTop: 0x2f7fd6, skyBot: 0xcfe8f5, fog: 0xcfe4f0, key: 0xfff4e0, keyI: 2.7, hemiSky: 0xcfe6ff, hemiGnd: 0x6d8a6a, hemiI: 1.15, deep: 0x1688b8, night: 0, lamp: 0 },
  { at: 0.67, skyTop: 0x2a2a78, skyBot: 0xf2965a, fog: 0xd7907a, key: 0xffa860, keyI: 1.9, hemiSky: 0x8a7fc0, hemiGnd: 0x5a3a4a, hemiI: 0.75, deep: 0x2a2f6a, night: 0.15, lamp: 0.35 },
  { at: 0.88, skyTop: 0x02021f, skyBot: 0x0c0c70, fog: 0x0a0a4a, key: 0x8f9bff, keyI: 0.8, hemiSky: 0x3b3fb0, hemiGnd: 0x0a0a2a, hemiI: 1.0, deep: 0x05053a, night: 1, lamp: 1 },
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const c = (hex: number) => new THREE.Color(hex);

class Look {
  skyTop = new THREE.Color(); skyBot = new THREE.Color(); fog = new THREE.Color();
  key = new THREE.Color(); hemiSky = new THREE.Color(); hemiGnd = new THREE.Color(); deep = new THREE.Color();
  keyI = 0; hemiI = 0; night = 0; lamp = 0;

  set(p: number) {
    const x = Math.min(Math.max(p, 0), 1);
    let i = 0;
    while (i < STOPS.length - 2 && x > STOPS[i + 1].at) i++;
    const a = STOPS[i], b = STOPS[i + 1];
    const t = smooth(Math.min(Math.max((x - a.at) / (b.at - a.at), 0), 1));
    this.skyTop.setHex(a.skyTop).lerp(c(b.skyTop), t);
    this.skyBot.setHex(a.skyBot).lerp(c(b.skyBot), t);
    this.fog.setHex(a.fog).lerp(c(b.fog), t);
    this.key.setHex(a.key).lerp(c(b.key), t);
    this.hemiSky.setHex(a.hemiSky).lerp(c(b.hemiSky), t);
    this.hemiGnd.setHex(a.hemiGnd).lerp(c(b.hemiGnd), t);
    this.deep.setHex(a.deep).lerp(c(b.deep), t);
    this.keyI = a.keyI + (b.keyI - a.keyI) * t;
    this.hemiI = a.hemiI + (b.hemiI - a.hemiI) * t;
    this.night = a.night + (b.night - a.night) * t;
    this.lamp = a.lamp + (b.lamp - a.lamp) * t;
  }
}

// Sun rises at the dawn board, sets at the sunset board, the moon holds the night.
function sunDir(p: number, out: THREE.Vector3) {
  const t = Math.min(Math.max(p / 0.7, 0), 1);
  const el = THREE.MathUtils.degToRad(4 + 62 * Math.sin(Math.PI * t) - (p > 0.7 ? (p - 0.7) * 120 : 0));
  const az = THREE.MathUtils.degToRad(55 - 110 * t);
  return out.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)).normalize();
}
const MOON = new THREE.Vector3(-0.38, 0.5, -0.78).normalize();

// ---- Shaders -------------------------------------------------------------------------------

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() { vDir = position; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uTop, uBot, uSunDir, uSunCol, uMoonDir;
uniform float uNight;
varying vec3 vDir;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uBot, uTop, pow(h, 0.55));
  float s = max(dot(d, uSunDir), 0.0);
  float up = smoothstep(-0.1, 0.1, uSunDir.y);
  col += uSunCol * up * (pow(s, 2500.0) * 10.0 + pow(s, 70.0) * 0.45 + pow(s, 5.0) * 0.16);
  float m = max(dot(d, uMoonDir), 0.0);
  col += vec3(0.95, 0.93, 0.82) * uNight * (smoothstep(0.9992, 0.9997, m) * 1.4 + pow(m, 60.0) * 0.12);
  vec3 cell = floor(d * 260.0);
  float star = step(0.9965, hash(cell)) * smoothstep(0.05, 0.4, d.y);
  col += vec3(1.0, 0.97, 0.9) * star * uNight * (0.6 + 0.4 * hash(cell + 3.0));
  gl_FragColor = vec4(col, 1.0);
}`;

const WATER_VERT = /* glsl */ `
varying vec3 vWorld;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const WATER_FRAG = /* glsl */ `
uniform float uTime, uNight;
uniform vec3 uDeep, uTop, uBot, uFog, uLightDir, uLightCol, uLamp;
varying vec3 vWorld;
vec2 wave(vec2 p, vec2 dir, float f, float a, float sp) {
  return dir * f * a * cos(dot(dir, p) * f + uTime * sp);
}
void main() {
  vec2 p = vWorld.xz;
  vec2 g = wave(p, normalize(vec2(1.0, 0.3)), 0.35, 0.16, 1.1)
         + wave(p, normalize(vec2(-0.4, 1.0)), 0.6, 0.07, 1.5)
         + wave(p, normalize(vec2(0.7, -0.8)), 1.1, 0.025, 2.1)
         + wave(p, normalize(vec2(-1.0, -0.2)), 1.9, 0.01, 2.8);
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 4.0);
  vec3 r = reflect(-v, n);
  vec3 refl = mix(uBot, uTop, pow(clamp(r.y, 0.0, 1.0), 0.5));
  vec3 col = mix(uDeep, refl, clamp(fres, 0.0, 1.0));
  col += uLightCol * pow(max(dot(r, uLightDir), 0.0), 220.0) * (3.0 - 2.2 * uNight);
  col += uLamp * uNight * pow(max(dot(r, normalize(vec3(-0.45, 0.15, -0.9))), 0.0), 60.0) * 0.9;
  float dist = length(cameraPosition - vWorld);
  col = mix(col, uFog, 1.0 - exp(-dist * 0.0028));
  gl_FragColor = vec4(col, 1.0);
}`;

const BEAM_VERT = /* glsl */ `
varying float vT;
void main() { vT = clamp(position.z / 90.0, 0.0, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const BEAM_FRAG = /* glsl */ `
uniform float uOpacity; varying float vT;
void main() { gl_FragColor = vec4(1.0, 0.82, 0.42, uOpacity * pow(1.0 - vT, 1.6)); }`;

// ---- Props ---------------------------------------------------------------------------------

function facade(cells: number, windowsOnly: boolean): THREE.CanvasTexture {
  const w = 128 * cells, h = 192;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = windowsOnly ? "#000" : "#eadfce";
  g.fillRect(0, 0, w, h);
  if (!windowsOnly) {
    g.fillStyle = "#d9cab5";
    g.fillRect(0, 0, w, 14);
    g.fillRect(0, h - 22, w, 22);
  }
  for (let i = 0; i < cells; i++) {
    const x = i * 128 + 36, ww = 56, top = 56, bottom = 150;
    g.fillStyle = windowsOnly ? "#fff" : "#6f6253";
    g.beginPath();
    g.moveTo(x, bottom); g.lineTo(x, top + ww / 2);
    g.arc(x + ww / 2, top + ww / 2, ww / 2, Math.PI, 0);
    g.lineTo(x + ww, bottom); g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

type Figure = { draw: (g: CanvasRenderingContext2D) => void; heightUnits: number; x: number; show: number };
const line = (g: CanvasRenderingContext2D, w: number, pts: number[]) => {
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.stroke();
};
const dot = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const seg = (g: CanvasRenderingContext2D, w: number, ...p: number[][]) => p.forEach((q) => line(g, w, q));

// The procession from baby to elder, drawn from the approved sketch's silhouettes. x is the board it appears with.
const FIGURES: Figure[] = [
  { heightUnits: 26, x: -3.7, show: -0.2, draw: (g) => {
    g.beginPath(); g.ellipse(0, -15, 13, 7.5, 0, 0, Math.PI * 2); g.fill(); dot(g, -15, -19, 6.5);
    seg(g, 4, [-9, -11, -12, 0], [-3, -9, -5, 0], [6, -10, 12, -2, 16, 0], [10, -9, 18, -4]);
  } },
  { heightUnits: 66, x: -2.5, show: -0.05, draw: (g) => {
    dot(g, 0, -46, 6); seg(g, 11, [0, -40, 0, -22]); seg(g, 5, [-1, -22, -5, 0], [2, -22, 6, 0]);
    seg(g, 3.5, [-2, -38, -8, -28], [2, -38, 10, -55]); dot(g, 11, -60, 4.5);
  } },
  { heightUnits: 80, x: -1.2, show: 0.0, draw: (g) => {
    dot(g, 0, -71, 6.5); seg(g, 12, [0, -63, 0, -38]); seg(g, 5.5, [-1, -38, -6, 0], [2, -38, 8, 0]);
    seg(g, 4, [-3, -60, -9, -42], [3, -60, 10, -44]);
  } },
  { heightUnits: 120, x: 0.2, show: 0.04, draw: (g) => {
    dot(g, 0, -112, 7.5); seg(g, 3, [5, -116, 16, -112, 16, -98, 10, -92]);
    g.beginPath(); g.moveTo(-7, -102); g.lineTo(7, -102); g.lineTo(12, -50); g.lineTo(-12, -50); g.closePath(); g.fill();
    seg(g, 6, [-3, -50, -10, 0], [3, -50, 11, 0]); seg(g, 4.5, [-6, -100, -11, -70], [6, -100, 14, -74]);
  } },
  { heightUnits: 134, x: 1.6, show: 0.08, draw: (g) => {
    dot(g, 0, -124, 8); g.fillRect(-11, -114, 22, 52);
    seg(g, 8, [-4, -62, -12, 0], [4, -62, 10, 0]); seg(g, 6, [-10, -110, -16, -74], [10, -110, 17, -80]);
  } },
  { heightUnits: 112, x: 3.1, show: 0.11, draw: (g) => {
    dot(g, 7, -100, 7.5); seg(g, 17, [-3, -52, 5, -88]); seg(g, 7, [-3, -52, -8, 0], [0, -52, 7, 0]);
    seg(g, 5, [4, -84, 14, -62]); seg(g, 2.5, [14, -64, 16, 0]);
  } },
];
const PX = -12; // the procession walks along the shore beside the lighthouse
const UNIT = 0.034; // world metres per drawing unit: a stylised, larger-than-life procession

function figureTexture(f: Figure): THREE.CanvasTexture {
  const S = 3, W = 192, H = 480;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.translate(W / 2, H - 8); g.scale(S, S);
  g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
  f.draw(g);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const DAY_FIG = [0x3f9e49, 0x5fb046, 0x1a9aa0, 0x1e8da6, 0x1b5fa8, 0x0d3c78].map(c);
const NIGHT_FIG = [0x6fd08a, 0x8fdc8f, 0x4fd0d0, 0x4bb3e0, 0x6f9fff, 0x9aa8ff].map(c);

function ship(size: number, hues: number[]): THREE.Group {
  const grp = new THREE.Group();
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-11, 0); hullShape.lineTo(9, 0); hullShape.lineTo(11.8, 2.6); hullShape.lineTo(-11, 2.6); hullShape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 5, bevelEnabled: false });
  hullGeo.translate(0, -0.4, -2.5);
  grp.add(new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({ color: 0x2c3650, roughness: 0.8, flatShading: true })));
  const box = new THREE.BoxGeometry(3, 2.3, 2.3);
  const mats = hues.map((h) => new THREE.MeshStandardMaterial({ color: h, roughness: 0.7, flatShading: true }));
  let k = 0;
  for (let x = -9.5; x < 3.5; x += 3.2)
    for (const z of [-1.3, 1.3])
      for (let y = 0; y < 2; y++) {
        const m = new THREE.Mesh(box, mats[k++ % mats.length]);
        m.position.set(x, 2.8 + y * 2.35, z);
        grp.add(m);
      }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.2, 4.4), new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.6, flatShading: true }));
  bridge.position.set(7.2, 4.6, 0);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0xc9694f, flatShading: true }));
  funnel.position.set(8.2, 8.1, 0);
  grp.add(bridge, funnel);
  grp.scale.setScalar(size);
  return grp;
}

function leaf(len: number, wid: number, color: number): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(len * 0.25, wid, len * 0.7, wid * 0.9, len, 0);
  s.bezierCurveTo(len * 0.7, -wid * 0.3, len * 0.25, -wid * 0.2, 0, 0);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

// ---- Scene ---------------------------------------------------------------------------------

export async function createHarbour(canvas: HTMLCanvasElement): Promise<Harbour> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 140, 560);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);

  const look = new Look();
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // sky
  const skyMat = own(new THREE.ShaderMaterial({
    vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color() }, uBot: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color(0xfff0c8) }, uMoonDir: { value: MOON }, uNight: { value: 0 } },
  }));
  const sky = new THREE.Mesh(own(new THREE.SphereGeometry(900, 32, 16)), skyMat);
  sky.renderOrder = -1;
  scene.add(sky);

  // water
  const waterMat = own(new THREE.ShaderMaterial({
    vertexShader: WATER_VERT, fragmentShader: WATER_FRAG,
    uniforms: { uTime: { value: 0 }, uNight: { value: 0 }, uDeep: { value: new THREE.Color() }, uTop: { value: new THREE.Color() }, uBot: { value: new THREE.Color() }, uFog: { value: new THREE.Color() }, uLightDir: { value: new THREE.Vector3() }, uLightCol: { value: new THREE.Color() }, uLamp: { value: new THREE.Color(0xaa8531) } },
  }));
  const water = new THREE.Mesh(own(new THREE.PlaneGeometry(2400, 2400)), waterMat);
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
  const key = new THREE.DirectionalLight(0xffffff, 1);
  const lampLight = new THREE.PointLight(0xffd27a, 0, 90, 1.6);
  lampLight.position.set(-22, 27, -40);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(30, 40, 90);
  scene.add(hemi, key, fill, lampLight);

  const std = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    own(new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra }));

  // shore and leaves: the conference's own world in the foreground
  const shoreMat = std(0x3f8a52);
  const shore = new THREE.Mesh(own(new THREE.PlaneGeometry(200, 15, 1, 1)), shoreMat);
  shore.rotation.x = -Math.PI / 2;
  shore.position.set(0, 0.25, 5.5);
  scene.add(shore);
  const leaves: [number, number, number, number, number, number][] = [
    [-34, 4, 34, 6, 0x7cc243, 0.1], [-8, 8.5, 40, 7, 0x1a9aa0, -0.15], [14, 6, 36, 6.5, 0x5fb046, 0.12], [34, 9, 30, 5, 0x7cc243, 3.2], [-20, 9.5, 26, 5, 0x3f9e49, 3.0],
  ];
  for (const [x, z, len, wid, col, rot] of leaves) {
    const l = leaf(len, wid, col);
    l.position.set(x, 0.32, z);
    l.rotation.z = rot;
    scene.add(l);
    own(l.geometry); own(l.material as THREE.Material);
  }

  // hills under the lighthouse
  const hillMat = std(0x4f9a5a);
  for (const [x, z, sx, sy, sz] of [[-22, -42, 26, 7, 16], [-46, -52, 30, 5, 14], [4, -80, 70, 6, 20]] as number[][]) {
    const h = new THREE.Mesh(own(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), hillMat);
    h.scale.set(sx, sy, sz);
    h.position.set(x, -0.2, z);
    scene.add(h);
  }

  // lighthouse
  const lh = new THREE.Group();
  const bandLight = std(0xf7efe6), bandDark = std(0x24344d);
  const heights = 4.8, r0 = 4.2, r1 = 2.5;
  for (let i = 0; i < 5; i++) {
    const rb = r0 + (r1 - r0) * (i / 5), rt = r0 + (r1 - r0) * ((i + 1) / 5);
    const m = new THREE.Mesh(own(new THREE.CylinderGeometry(rt, rb, heights, 20)), i % 2 === 1 ? bandDark : bandLight);
    m.position.y = heights * (i + 0.5);
    lh.add(m);
  }
  const gallery = new THREE.Mesh(own(new THREE.CylinderGeometry(3.4, 3, 0.6, 20)), std(0x8c8272));
  gallery.position.y = 24.3;
  const lanternMat = own(new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
  const lantern = new THREE.Mesh(own(new THREE.CylinderGeometry(1.6, 1.6, 3, 16)), lanternMat);
  lantern.position.y = 26.1;
  const cap = new THREE.Mesh(own(new THREE.SphereGeometry(1.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)), bandDark);
  cap.position.y = 27.6;
  const finial = new THREE.Mesh(own(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6)), bandDark);
  finial.position.y = 30;
  lh.add(gallery, lantern, cap, finial);
  lh.position.set(-22, 0, -40);
  scene.add(lh);

  // beam, from the lantern
  const beamMat = own(new THREE.ShaderMaterial({
    vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0 } },
  }));
  const coneGeo = own(new THREE.ConeGeometry(9, 90, 28, 1, true));
  coneGeo.translate(0, -45, 0);
  coneGeo.rotateX(-Math.PI / 2);
  const pivot = new THREE.Group();
  pivot.position.set(-22, 26.1, -40);
  const beamA = new THREE.Mesh(coneGeo, beamMat);
  const beamB = new THREE.Mesh(coneGeo, beamMat);
  beamB.rotation.y = Math.PI;
  pivot.add(beamA, beamB);
  scene.add(pivot);

  // domed building
  const hall = new THREE.Group();
  const wingTex = facade(8, false), wingGlow = facade(8, true);
  const wingSide = std(0xeadfce);
  const wingFront = std(0xffffff, { map: wingTex, emissive: 0xf2c66a, emissiveMap: wingGlow, emissiveIntensity: 0 });
  const wingA = [wingSide, wingSide, wingSide, wingSide, wingFront, wingSide];
  disposables.push(wingTex, wingGlow);
  const wingGeo = own(new THREE.BoxGeometry(60, 10, 7));
  const wing = new THREE.Mesh(wingGeo, wingA);
  wing.position.set(0, 5, 0);
  const coreTex = facade(2, false), coreGlow = facade(2, true);
  disposables.push(coreTex, coreGlow);
  const coreSide = std(0xeadfce);
  const coreFront = std(0xffffff, { map: coreTex, emissive: 0xf2c66a, emissiveMap: coreGlow, emissiveIntensity: 0 });
  const core = new THREE.Mesh(own(new THREE.BoxGeometry(16, 16, 8)), [coreSide, coreSide, coreSide, coreSide, coreFront, coreSide]);
  core.position.set(0, 8, 0.2);
  const domeMat = std(0x2a9d9a, { roughness: 0.5, metalness: 0.2 });
  const drum = new THREE.Mesh(own(new THREE.CylinderGeometry(5.4, 5.8, 2.4, 24)), std(0xd9cab5));
  drum.position.set(0, 17.2, 0.2);
  const dome = new THREE.Mesh(own(new THREE.SphereGeometry(5.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)), domeMat);
  dome.scale.y = 1.15;
  dome.position.set(0, 18.4, 0.2);
  const spire = new THREE.Mesh(own(new THREE.CylinderGeometry(0.1, 0.1, 3, 6)), std(0xd9cab5));
  spire.position.set(0, 25.3, 0.2);
  hall.add(wing, core, drum, dome, spire);
  for (const sx of [-1, 1]) {
    const pav = new THREE.Mesh(own(new THREE.BoxGeometry(8, 14, 7.6)), std(0xeadfce));
    pav.position.set(sx * 29, 7, 0);
    const pd = new THREE.Mesh(own(new THREE.SphereGeometry(3.4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), domeMat);
    pd.scale.y = 1.1;
    pd.position.set(sx * 29, 14, 0);
    hall.add(pav, pd);
  }
  const quay = new THREE.Mesh(own(new THREE.BoxGeometry(80, 1.4, 12)), std(0x8c8272));
  quay.position.set(6, 0.3, 2);
  hall.add(quay);
  hall.position.set(14, 0, -58);
  scene.add(hall);

  // balcony houses
  const woodMat = std(0x8a5a3c);
  const houses = new THREE.Group();
  for (const [x, w, h, col] of [[0, 9, 13, 0xe9c8a0], [9.4, 8, 17, 0xcfe0d8], [17.4, 8.5, 11, 0xe3b9a0]] as number[][]) {
    const b = new THREE.Mesh(own(new THREE.BoxGeometry(w, h, 7)), std(col));
    b.position.set(x, h / 2, 0);
    houses.add(b);
    for (let lvl = 1; lvl * 4.4 < h - 2; lvl++) {
      const slab = new THREE.Mesh(own(new THREE.BoxGeometry(w + 0.8, 0.3, 1.8)), woodMat);
      slab.position.set(x, lvl * 4.4, 3.9);
      houses.add(slab);
      for (let k = -2; k <= 2; k++) {
        const post = new THREE.Mesh(own(new THREE.BoxGeometry(0.12, 1.1, 0.12)), woodMat);
        post.position.set(x + (k * w) / 5, lvl * 4.4 + 0.7, 4.7);
        houses.add(post);
      }
      const shutter = new THREE.Mesh(own(new THREE.BoxGeometry(1.4, 2.4, 0.2)), woodMat);
      shutter.position.set(x, lvl * 4.4 + 1.5, 3.55);
      houses.add(shutter);
    }
  }
  houses.position.set(56, 0, -54);
  scene.add(houses);

  // canal ships
  const shipA = ship(0.55, [0xc9694f, 0x5b8fb0, 0xd9b25e, 0x6f9a6f]);
  shipA.position.set(-80, 0, -32);
  const shipB = ship(0.4, [0x5b8fb0, 0x6f9a6f, 0xc9694f, 0xd9b25e]);
  shipB.rotation.y = Math.PI;
  shipB.position.set(90, 0, -37);
  scene.add(shipA, shipB);

  // the procession
  const figs = FIGURES.map((f, i) => {
    const tex = figureTexture(f);
    const mat = own(new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, color: DAY_FIG[i], fog: false, toneMapped: false }));
    disposables.push(tex);
    const W = 192 / 3 * UNIT, H = 480 / 3 * UNIT;
    const m = new THREE.Mesh(own(new THREE.PlaneGeometry(W, H)), mat);
    m.position.set(0, H / 2 - (8 / 3) * UNIT, 0);
    const holder = new THREE.Group();
    holder.add(m);
    holder.position.set(f.x + PX, 0.3, 4);
    scene.add(holder);
    return { holder, mat, f, i };
  });

  // camera path, one keyframe per board
  const posCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-13.5, 1.0, 10), new THREE.Vector3(-11.8, 2.4, 15), new THREE.Vector3(-4, 12, 46),
    new THREE.Vector3(30, 9, 20), new THREE.Vector3(-26, 6, 0), new THREE.Vector3(-8, 10, 6), new THREE.Vector3(0, 9, 44),
  ], false, "catmullrom", 0.3);
  const tgtCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-17, 4.5, -40), new THREE.Vector3(-11.8, 2.4, 0), new THREE.Vector3(6, 9, -50),
    new THREE.Vector3(6, 9, -58), new THREE.Vector3(12, 10, -58), new THREE.Vector3(-22, 20, -40), new THREE.Vector3(0, 14, -45),
  ], false, "catmullrom", 0.3);

  // loop
  let target = 0, current = 0, raf = 0, last = performance.now(), time = 0, disposed = false;
  const tmpSun = new THREE.Vector3(), camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();

  function apply() {
    look.set(current);
    sunDir(current, tmpSun);
    const night = look.night;
    skyMat.uniforms.uTop.value.copy(look.skyTop);
    skyMat.uniforms.uBot.value.copy(look.skyBot);
    skyMat.uniforms.uSunDir.value.copy(tmpSun);
    skyMat.uniforms.uNight.value = night;
    const wu = waterMat.uniforms;
    wu.uDeep.value.copy(look.deep); wu.uTop.value.copy(look.skyTop); wu.uBot.value.copy(look.skyBot); wu.uFog.value.copy(look.fog);
    wu.uNight.value = night;
    const lightDir = tmpSun.clone().lerp(MOON, smooth(Math.min(Math.max((night - 0.1) / 0.6, 0), 1))).normalize();
    wu.uLightDir.value.copy(lightDir);
    wu.uLightCol.value.copy(look.key);
    key.position.copy(lightDir).multiplyScalar(100);
    key.color.copy(look.key); key.intensity = look.keyI;
    hemi.color.copy(look.hemiSky); hemi.groundColor.copy(look.hemiGnd); hemi.intensity = look.hemiI;
    (scene.fog as THREE.Fog).color.copy(look.fog);
    fill.color.copy(look.hemiSky).lerp(c(0x8f9bff), night * 0.5); fill.intensity = 1.5 - night * 0.6;
    lampLight.intensity = look.lamp * 900;
    lanternMat.color.setHex(night > 0.3 ? 0xffe08a : 0xfff3c4);
    beamMat.uniforms.uOpacity.value = look.lamp * 0.32;
    wingFront.emissiveIntensity = look.lamp * 1.6;
    coreFront.emissiveIntensity = look.lamp * 1.6;
    for (const { mat, i, f } of figs) {
      mat.color.copy(DAY_FIG[i]).lerp(NIGHT_FIG[i], night);
      const t = smooth(Math.min(Math.max((current - f.show) / 0.05 + 0.001, 0), 1));
      mat.opacity = t;
    }
    posCurve.getPoint(Math.min(Math.max(current, 0), 1), camPos);
    tgtCurve.getPoint(Math.min(Math.max(current, 0), 1), camTgt);
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    sky.position.copy(camera.position);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now; time += dt;
    current += (target - current) * Math.min(1, dt * 3.2);
    waterMat.uniforms.uTime.value = time;
    pivot.rotation.y = time * 0.5;
    shipA.position.x = ((time * 1.0 + 5) % 200) - 100;
    shipB.position.x = 100 - ((time * 0.8 + 10) % 200);
    for (const { holder, f, i } of figs) {
      const appear = smooth(Math.min(Math.max((current - f.show) / 0.05 + 0.001, 0), 1));
      holder.scale.setScalar(0.6 + 0.4 * appear);
      holder.position.y = 0.3 + Math.abs(Math.sin(time * 2.2 + i)) * 0.05 * (i === 0 ? 0 : 1);
      holder.rotation.y = Math.atan2(camera.position.x - holder.position.x, camera.position.z - holder.position.z);
    }
    apply();
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 68 : 52;
    camera.updateProjectionMatrix();
  }

  resize();
  apply();
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p, snap = false) { target = Math.min(Math.max(p, 0), 1); if (snap) current = target; },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}

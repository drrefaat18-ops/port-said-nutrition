import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Tier } from "@/content";
import { logoScale, rollUpCount, standSize } from "./mail";

const MAX_ROLLS = 3;

function logoLabel(): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f6efe0"; g.fillRect(0, 0, 512, 128);
  g.fillStyle = "#090968"; g.font = "600 44px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("Your logo", 256, 66);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// A gold-framed stand at the tier's printed proportions. Sizes are relative: the agenda gives them no units.
export async function createStand(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(34, 2, 0.1, 100);

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xe6bd6a, metalness: 1, roughness: 0.22, clearcoat: 0.6 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x090968, roughness: 0.45, metalness: 0.2 });
  const label = logoLabel();
  const panelMat = new THREE.MeshStandardMaterial({ map: label, roughness: 0.5 });
  const unit = new THREE.BoxGeometry(1, 1, 1);

  const rig = new THREE.Group();
  const floor = new THREE.Mesh(unit, navy);
  const wall = new THREE.Mesh(unit, navy);
  const trim = new THREE.Mesh(unit, gold);
  const panel = new THREE.Mesh(unit, [navy, navy, navy, navy, panelMat, navy]);
  const rolls = Array.from({ length: MAX_ROLLS }, () => new THREE.Mesh(unit, gold));
  rig.add(floor, wall, trim, panel, ...rolls);
  scene.add(rig);

  // eased toward the chosen tier
  const goal = { w: 6, d: 2, logo: 8, rolls: 3 }, now = { ...goal };
  let raf = 0, last = performance.now(), turn = 0, disposed = false;

  function layout() {
    const { w, d, logo, rolls: count } = now, H = 2.4;
    floor.scale.set(w, 0.08, d); floor.position.y = 0.04;
    wall.scale.set(w, H, 0.06); wall.position.set(0, H / 2 + 0.08, -d / 2);
    trim.scale.set(w + 0.04, 0.05, 0.1); trim.position.set(0, H + 0.1, -d / 2);
    const pw = Math.min(w * 0.92, 0.6 + logo * 0.35);
    panel.scale.set(pw, pw / 4, 0.03); panel.position.set(0, H * 0.72, -d / 2 + 0.05);
    rolls.forEach((r, i) => {
      const show = Math.min(Math.max(count - i, 0), 1);
      r.scale.set(0.5 * show, 1.5 * show, 0.03 * show);
      r.position.set(-w / 2 + 0.4 + i * 0.65, 0.08 + 0.75 * show, d / 2 - 0.3);
    });
  }

  function frame(t: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = t; return; }
    const dt = Math.min((t - last) / 1000, 0.1);
    last = t; turn += dt * 0.25;
    for (const k of ["w", "d", "logo", "rolls"] as const) now[k] += (goal[k] - now[k]) * Math.min(1, dt * 5);
    layout();
    rig.rotation.y = Math.sin(turn) * 0.45;
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const dist = 3.5 / (Math.tan(THREE.MathUtils.degToRad(17)) * Math.min(camera.aspect, 1.6));
    camera.position.set(0, 2.6, dist);
    camera.lookAt(0, 1.2, 0);
  }

  const key = new THREE.DirectionalLight(0xfff0d8, 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  resize();
  layout();
  raf = requestAnimationFrame(frame);

  return {
    setTier(tier: Tier) {
      const { w, d } = standSize(tier.area);
      Object.assign(goal, { w, d, logo: logoScale(tier.logo), rolls: rollUpCount(tier) });
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      for (const x of [gold, navy, panelMat, label, unit, scene.environment!]) x.dispose();
      renderer.dispose();
    },
  };
}

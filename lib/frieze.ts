// The conference's procession, baby to elder, as a gold inlay for the quay wall. White on transparent.
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

export function friezeCanvas(): HTMLCanvasElement {
  const W = 2048, H = 128, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
  FIGURES.forEach((f, i) => {
    g.save();
    g.translate(((i + 0.5) / FIGURES.length) * W, H - 6);
    g.scale(0.82, 0.82);
    f.draw(g);
    g.restore();
  });
  g.fillRect(0, 2, W, 2); g.fillRect(0, H - 4, W, 2); // inlaid rules
  return cv;
}

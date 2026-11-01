// One gold line drawing per session, drawn in once. Decoration only: no fact lives here.
const LINES: Record<number, string[]> = {
  1: ["M50 90a40 40 0 1 1 0-80 40 40 0 0 1 0 80", "M50 76a26 26 0 1 1 0-52 26 26 0 0 1 0 52", "M50 62a12 12 0 1 1 0-24 12 12 0 0 1 0 24"], // growth rings
  2: ["M34 8c0 28 32 28 32 56s-32 8-32 28", "M66 8c0 28-32 28-32 56s32 8 32 28", "M38 24h24M38 48h24M38 72h24"], // helix
  3: ["M6 54h24l8-20 12 44 10-34 6 10h28"], // pulse
  4: ["M50 72a22 22 0 1 1 0-44 22 22 0 0 1 0 44", "M50 28V12M50 88V72M28 50H12M88 50H72M34 34 23 23M77 77 66 66M34 66 23 77M77 23 66 34"], // immune cell
  5: ["M50 10c6 20 26 30 26 50a26 26 0 0 1-52 0c0-20 20-30 26-50", "M50 86a13 13 0 0 1-13-13c0-10 13-16 13-26 0 10 13 16 13 26a13 13 0 0 1-13 13"], // energy
  6: ["M50 12l32 19v38L50 88 18 69V31z", "M50 34l14 8v16l-14 8-14-8V42z"], // molecule
  7: ["M6 76c14 0 18-52 44-52s30 52 44 52", "M6 88h88"], // a life's curve
};

export default function SessionVisual({ n }: { n: number }) {
  return (
    <svg className="visual" viewBox="0 0 100 100" aria-hidden="true">
      {LINES[n]?.map((d) => <path key={d} d={d} pathLength={1} />)}
    </svg>
  );
}

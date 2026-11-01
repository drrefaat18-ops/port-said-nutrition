"use client";

import { useEffect, useRef, useState } from "react";
import type { Tier } from "@/content";
import { capable } from "@/lib/capable";
import { logoScale, rollUpCount, standSize } from "@/lib/mail";

type Scene = { setTier(t: Tier): void; resize(): void; dispose(): void };

// The flat plan: what shows with the 3D off, and until it paints.
function StandPlan({ tier }: { tier: Tier }) {
  const { w, d } = standSize(tier.area);
  const logo = Math.min(w * 0.9, 0.5 + logoScale(tier.logo) * 0.4);
  const x = (8 - w) / 2, y = (4 - d) / 2;
  return (
    <div className="plan">
      <svg viewBox="0 0 8 4" role="img" aria-label={`Stand ${tier.area}, logo ${tier.logo}`}>
        <rect x={x} y={y} width={w} height={d} fill="none" stroke="currentColor" strokeWidth="0.03" />
        <rect x={(8 - logo) / 2} y={y + 0.1} width={logo} height="0.5" fill="none" stroke="currentColor" strokeWidth="0.02" />
        <text x="4" y={y + 0.44} textAnchor="middle">Your logo</text>
        {Array.from({ length: rollUpCount(tier) }, (_, i) => (
          <rect key={i} x={x + 0.2 + i * 0.5} y={y + d - 0.3} width="0.3" height="0.1" fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

export default function Stand({ tier }: { tier: Tier }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | undefined>(undefined);
  const latest = useRef(tier);
  const [live, setLive] = useState(false);

  useEffect(() => {
    latest.current = tier;
    scene.current?.setTier(tier);
  }, [tier]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      webgl = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl = false;
    }
    if (!capable({ reduced, webgl })) return;

    let gone = false;
    const back = () => { scene.current?.dispose(); scene.current = undefined; setLive(false); };
    const onLost = (e: Event) => { e.preventDefault(); back(); };
    const ro = new ResizeObserver(() => scene.current?.resize());

    import("@/lib/stand")
      .then(({ createStand }) => createStand(cv))
      .then((s) => {
        if (gone) return s.dispose();
        scene.current = s;
        s.setTier(latest.current);
        ro.observe(cv);
        cv.addEventListener("webglcontextlost", onLost);
        setLive(true);
      })
      .catch(back);

    return () => {
      gone = true;
      ro.disconnect();
      cv.removeEventListener("webglcontextlost", onLost);
      scene.current?.dispose();
      scene.current = undefined;
    };
  }, []);

  return (
    <div className="stand-view">
      {!live && <StandPlan tier={tier} />}
      <canvas ref={canvas} className={live ? "live" : ""} aria-hidden="true" />
      {live && <span className="sr-only">Stand {tier.area}, logo {tier.logo}</span>}
    </div>
  );
}

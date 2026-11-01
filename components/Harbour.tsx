"use client";

import { useEffect, useRef, useState } from "react";
import { capable } from "@/lib/capable";

type Scene = { setProgress(p: number, snap?: boolean): void; resize(): void; dispose(): void };

// The 3D harbour, over the poster. It fades in on its first frame and gives way to the poster if it fails.
// Phones drop WebGL under memory pressure, so a lost context is rebuilt when the browser gives it back.
export default function Harbour() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

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

    let scene: Scene | undefined;
    let gone = false;
    let latest = parseFloat(document.documentElement.style.getPropertyValue("--day")) || 0;
    const back = () => { scene?.dispose(); scene = undefined; setLive(false); };
    const onProgress = (e: Event) => { latest = (e as CustomEvent<number>).detail; scene?.setProgress(latest); };
    const onLost = (e: Event) => { e.preventDefault(); back(); };
    const ro = new ResizeObserver(() => scene?.resize());
    const boot = () =>
      import("@/lib/harbour")
        .then(({ createHarbour }) => createHarbour(cv))
        .then((s) => {
          if (gone) return s.dispose();
          scene = s;
          s.setProgress(latest, true);
          setLive(true);
        })
        .catch(back);

    window.addEventListener("harbour:progress", onProgress);
    cv.addEventListener("webglcontextlost", onLost);
    cv.addEventListener("webglcontextrestored", boot);
    ro.observe(cv);
    boot();

    return () => {
      gone = true;
      ro.disconnect();
      window.removeEventListener("harbour:progress", onProgress);
      cv.removeEventListener("webglcontextlost", onLost);
      cv.removeEventListener("webglcontextrestored", boot);
      scene?.dispose();
    };
  }, []);

  return <canvas ref={canvas} className={live ? "harbour live" : "harbour"} aria-hidden="true" />;
}

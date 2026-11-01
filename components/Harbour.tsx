"use client";

import { useEffect, useRef, useState } from "react";
import { capable } from "@/lib/capable";

// The 3D harbour, over the poster. It fades in on its first frame and gives way to the poster if it fails.
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

    let scene: { setProgress(p: number, snap?: boolean): void; resize(): void; dispose(): void } | undefined;
    let gone = false;
    let latest = parseFloat(document.documentElement.style.getPropertyValue("--day")) || 0;
    const back = () => { scene?.dispose(); scene = undefined; setLive(false); };
    const onProgress = (e: Event) => { latest = (e as CustomEvent<number>).detail; scene?.setProgress(latest); };
    const onLost = (e: Event) => { e.preventDefault(); back(); };
    const ro = new ResizeObserver(() => scene?.resize());
    window.addEventListener("harbour:progress", onProgress);

    import("@/lib/harbour")
      .then(({ createHarbour }) => createHarbour(cv))
      .then((s) => {
        if (gone) return s.dispose();
        scene = s;
        s.setProgress(latest, true);
        ro.observe(cv);
        cv.addEventListener("webglcontextlost", onLost);
        setLive(true);
      })
      .catch(back);

    return () => {
      gone = true;
      ro.disconnect();
      window.removeEventListener("harbour:progress", onProgress);
      cv.removeEventListener("webglcontextlost", onLost);
      scene?.dispose();
    };
  }, []);

  return <canvas ref={canvas} className={live ? "harbour live" : "harbour"} aria-hidden="true" />;
}

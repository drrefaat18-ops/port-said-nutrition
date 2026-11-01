"use client";

import { useEffect, useRef, useState } from "react";
import { capable } from "@/lib/capable";
import type { Harbour as Scene } from "@/lib/harbour";

const MAX_LOSSES = 3;
const RESTORE_WAIT = 1200; // ms. iOS may never give a lost context back

// A small readout for testing on a real phone: ?debug=1
function readout(info: () => string) {
  if (!new URLSearchParams(window.location.search).has("debug")) return () => {};
  const el = document.createElement("pre");
  el.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;margin:0;padding:6px 8px;font:12px/1.4 monospace;color:#fff;background:rgb(0 0 0 / 0.75);pointer-events:none";
  document.body.append(el);
  const id = window.setInterval(() => { el.textContent = info(); }, 500);
  return () => { window.clearInterval(id); el.remove(); };
}

// The 3D harbour, over the poster. It fades in on its first frame and gives way to the poster if it fails;
// the poster carries the same tower, so the lighthouse stays either way.
// Phones drop WebGL under memory pressure, so a lost scene is rebuilt lighter, on a fresh canvas if it has to be.
export default function Harbour() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const log = useRef({ losses: 0, restores: 0, fails: 0 });
  const [fresh, setFresh] = useState(0);
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
    let gone = false, lost = false, wait = 0;
    let latest = parseFloat(document.documentElement.style.getPropertyValue("--day")) || 0;
    const phone = window.matchMedia("(pointer: coarse)").matches;
    const back = () => { scene?.dispose(); scene = undefined; setLive(false); };
    const onFail = () => { log.current.fails++; back(); };
    const onProgress = (e: Event) => { latest = (e as CustomEvent<number>).detail; scene?.setProgress(latest); };
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      log.current.losses++;
      back();
      if (log.current.losses <= MAX_LOSSES) wait = window.setTimeout(() => setFresh((n) => n + 1), RESTORE_WAIT);
    };
    const ro = new ResizeObserver(() => scene?.resize());
    const boot = () => {
      const level = log.current.losses ? 2 : phone ? 1 : 0;
      return import("@/lib/harbour")
        .then(({ createHarbour }) => createHarbour(cv, { level, onFail }))
        .then((s) => {
          if (gone || lost) return s.dispose();
          scene = s;
          s.setProgress(latest, true);
          setLive(true);
        })
        .catch(onFail);
    };
    const onRestored = () => {
      window.clearTimeout(wait);
      lost = false;
      log.current.restores++;
      boot();
    };

    window.addEventListener("harbour:progress", onProgress);
    cv.addEventListener("webglcontextlost", onLost);
    cv.addEventListener("webglcontextrestored", onRestored);
    ro.observe(cv);
    boot();
    const stop = readout(() => {
      const s = scene?.stats();
      return `3D ${s ? "on" : "OFF"}  frames ${s?.frames ?? "-"}  px ${s?.pixelRatio ?? "-"}  err ${s?.glError ?? "-"}\nlost ${log.current.losses}  restored ${log.current.restores}  failed ${log.current.fails}\nday ${latest.toFixed(2)}`;
    });

    return () => {
      gone = true;
      stop();
      window.clearTimeout(wait);
      ro.disconnect();
      window.removeEventListener("harbour:progress", onProgress);
      cv.removeEventListener("webglcontextlost", onLost);
      cv.removeEventListener("webglcontextrestored", onRestored);
      scene?.dispose();
      setLive(false);
    };
  }, [fresh]);

  return <canvas key={fresh} ref={canvas} className={live ? "harbour live" : "harbour"} aria-hidden="true" />;
}

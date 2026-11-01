"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { dayPhase } from "@/lib/day";

const COUNT = 7;

// Seven boards through one day. Scroll drives --day on the root and the `harbour:progress` event.
export default function Boards({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const at = useRef(0);
  const go = useRef<(dir: 1 | -1) => void>(() => {});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const boards = gsap.utils.toArray<HTMLElement>(".board");
    const lenis = still ? null : new Lenis({ lerp: 0.09 });
    lenis?.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let resizing = false;
    const progress = () => {
      if (resizing) return;
      const span = boards[COUNT - 1].offsetTop || 1;
      const p = Math.min(Math.max(window.scrollY / span, 0), 1);
      root.style.setProperty("--day", p.toFixed(4));
      root.dataset.phase = dayPhase(p);
      window.dispatchEvent(new CustomEvent("harbour:progress", { detail: p }));
      const i = Math.round(p * (COUNT - 1));
      if (i !== at.current) { at.current = i; setIndex(i); }
    };
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: progress });

    // a phone turned, or its address bar moved: stay on the current board
    // The address bar only changes the height: leave the scroll alone. ScrollTrigger resets the scroll
    // when it refreshes, 200ms after a turn, so the board is restored after that.
    let timer = 0, width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      resizing = true; // the scroll offset is meaningless while the viewport changes
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const top = boards[at.current].offsetTop;
        lenis?.resize();
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
        window.scrollTo(0, top);
        resizing = false;
        progress();
      }, 350);
    };
    window.addEventListener("resize", onResize);

    go.current = (dir) => {
      const next = Math.min(Math.max(at.current + dir, 0), COUNT - 1);
      const top = boards[next].offsetTop;
      if (lenis) lenis.scrollTo(top, { duration: 1.3 });
      else window.scrollTo({ top, behavior: "auto" });
    };

    if (!still)
      boards.forEach((b) =>
        gsap.from(b.querySelectorAll(".plate > *"), {
          y: 22, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08,
          scrollTrigger: { trigger: b, start: "top 70%", toggleActions: "play none none reverse" },
        }),
      );

    // open on the board named in the address, if any
    if (window.location.hash) {
      const target = document.querySelector<HTMLElement>(window.location.hash);
      if (target) window.scrollTo(0, target.offsetTop);
    }
    progress();

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
      st.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <header className="bar">
        <p className="counter" aria-label={`Board ${index + 1} of ${COUNT}`}>
          {String(index + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
        </p>
        <nav aria-label="Site">
          <Link href="/agenda">Agenda</Link>
          <Link href="/sponsors">Sponsors</Link>
        </nav>
      </header>
      <main className="boards">{children}</main>
      <div className="steps">
        <button type="button" onClick={() => go.current(-1)} disabled={index === 0} aria-label="Previous board">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" onClick={() => go.current(1)} disabled={index === COUNT - 1} aria-label="Next board">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </>
  );
}

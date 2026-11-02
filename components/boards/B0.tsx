import { conference } from "@/content";

const LOGOS = [
  { src: "/logos/conference.png", alt: "" },
  { src: "/logos/syndicate.png", alt: "Port Said Medical Syndicate" },
  { src: "/logos/efncc.png", alt: "Egyptian Foundation of Nutrition and Child Care (EFNCC)" },
];

// "Port Said" over "Nutrition Conference"
const words = conference.name.split(" ");
const [lead, rest] = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];

// The opening: open sky only, the three logos at one size across the top, the conference in the middle.
// Its sky is opaque, so the lighthouse rises into view as this board scrolls away.
export default function B0() {
  return (
    <section className="board hero" id="top" aria-labelledby="t0">
      <ul className="hero-logos" aria-label="Logos">
        {LOGOS.map((l) => (
          <li key={l.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.src} alt={l.alt} width={240} height={240} />
          </li>
        ))}
      </ul>
      <div className="hero-title">
        <div className="flourish" aria-hidden="true"><i /></div>
        <h1 id="t0">
          <span>{lead}</span>
          <span>{rest}</span>
        </h1>
        <p className="hero-theme">{conference.theme}</p>
        <div className="flourish" aria-hidden="true"><i /></div>
        <p className="hero-when">
          <span>{conference.date}</span>
          <i aria-hidden="true" />
          <span>{conference.venue}</span>
        </p>
      </div>
      <a className="hero-cue" href="#b2" aria-label="Scroll to the presidents">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </section>
  );
}

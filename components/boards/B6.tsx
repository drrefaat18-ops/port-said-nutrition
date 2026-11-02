import Link from "next/link";
import { conference } from "@/content";

// Night: the lighthouse beam sweeps across the four tiers; each one leads to its place on /sponsors, and the button to the page itself.
export default function B6() {
  return (
    <section className="board" id="b6" aria-labelledby="t6">
      <div className="plate">
        <h2 id="t6">Sponsorship Packages</h2>
        <ul className="rows tiers">
          {conference.tiers.map((t) => (
            <li key={t.name}>
              <Link href={`/sponsors?tier=${encodeURIComponent(t.name)}`}>
                <span>{t.name}</span>
                <span>{t.price}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="cta" href="/sponsors">
          <span>View all packages</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </section>
  );
}

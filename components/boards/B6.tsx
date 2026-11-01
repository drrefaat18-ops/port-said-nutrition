import Link from "next/link";
import { conference } from "@/content";

// Night: the lighthouse beam sweeps across the four tiers; each one leads to its place on /sponsors.
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
      </div>
    </section>
  );
}

import { conference } from "@/content";

// Sunset: where a sponsor sits in the day. The conference colours hand over to M Square's here.
export default function B5() {
  const symposia = conference.days
    .flatMap((d) => d.items)
    .flatMap((i) => (i.kind === "slot" && i.symposium ? [i] : []));
  return (
    <section className="board" id="b5" aria-labelledby="t5">
      <div className="plate">
        <h2 id="t5">Company Symposium</h2>
        <ul className="rows">
          {symposia.map((s) => (
            <li key={s.title}>
              <span>{s.title}</span>
              <span>{s.time}</span>
            </li>
          ))}
        </ul>
        <h3>Exhibition Area</h3>
        <ul className="rows cells">
          {conference.tiers.map((t) => (
            <li key={t.name}>
              <span>{t.name}</span>
              <span>{t.area}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

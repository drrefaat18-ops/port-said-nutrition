import Link from "next/link";
import { conference } from "@/content";

// Day: the programme at a glance, counted from the data.
export default function B3() {
  const [day1, day2] = conference.days;
  const day1Sessions = day1.items.filter((i) => i.kind === "session").length;
  const day2Sessions = day2.items.filter((i) => i.kind === "long").length;
  const symposia = conference.days.flatMap((d) => d.items).filter((i) => i.kind === "slot" && i.symposium).length;
  return (
    <section className="board" id="b3" aria-labelledby="t3">
      <div className="plate">
        <h2 id="t3">Agenda</h2>
        <ul className="glance">
          <li>{conference.days.length} days</li>
          <li>{day1Sessions} sessions on {day1.title}</li>
          <li>{day2Sessions} sessions on {day2.title}</li>
          <li>{symposia} company symposia</li>
        </ul>
        <p>
          <Link href="/agenda">Open the agenda</Link>
        </p>
      </div>
    </section>
  );
}

import { conference, type Item } from "@/content";

type Session = Extract<Item, { kind: "session" }>;
type Slot = Extract<Item, { kind: "slot" }>;

const [day1, day2] = conference.days;

// Each session gets a board, carrying the slots that follow it in the programme.
const opening: Slot[] = [];
const stops: { session: Session; after: Slot[] }[] = [];
for (const item of day1.items) {
  if (item.kind === "session") stops.push({ session: item, after: [] });
  else if (item.kind === "slot") (stops.at(-1)?.after ?? opening).push(item);
}

function Slots({ slots }: { slots: Slot[] }) {
  if (!slots.length) return null;
  return (
    <ul className="breaks">
      {slots.map((s) => (
        <li key={s.time}><span>{s.title}</span><span>{s.time}</span></li>
      ))}
    </ul>
  );
}

export default function AgendaBoards() {
  return (
    <>
      {stops.map(({ session: s, after }, i) => (
        <section className="board" id={i ? `session-${s.n}` : "day-1"} aria-labelledby={`s${s.n}`} key={s.n}>
          <div className="plate session">
            {i === 0 && <Slots slots={opening} />}
            <p className="eyebrow">{day1.title} · Session {s.n}</p>
            <h2 id={`s${s.n}`}>{s.title}</h2>
            <ul className="program">
              {s.talks.map((t) => (
                <li key={t.time}>
                  <span className="talk">{t.title}</span>
                  <span className="byline">{t.time} · <b>{t.speakers.join(", ")}</b></span>
                </li>
              ))}
            </ul>
            <Slots slots={after} />
          </div>
        </section>
      ))}
      <section className="board" id="day-2" aria-labelledby="d2">
        <div className="plate session">
          <h2 id="d2">{day2.title}</h2>
          <ul className="program">
            {day2.items.flatMap((t) => t.kind === "long" ? [
              <li key={t.time}>
                <span className="talk">{t.title}</span>
                <span className="byline">{t.time} · <b>{t.speakers.join(", ")}</b></span>
              </li>,
            ] : [])}
          </ul>
        </div>
      </section>
    </>
  );
}

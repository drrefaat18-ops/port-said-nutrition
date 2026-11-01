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

function Time({ time }: { time: string }) {
  const [from, to] = time.split(" - ");
  return <span className="when"><b>{from}</b> {to}</span>;
}

function Slots({ slots }: { slots: Slot[] }) {
  if (!slots.length) return null;
  return (
    <ul className="program breaks">
      {slots.map((s) => (
        <li key={s.time}><Time time={s.time} /><span className="talk">{s.title}</span></li>
      ))}
    </ul>
  );
}

function Talk({ time, title, speakers }: { time: string; title: string; speakers: string[] }) {
  return (
    <li>
      <Time time={time} />
      <span className="talk">{title}</span>
      <span className="speaker">{speakers.join(", ")}</span>
    </li>
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
              {s.talks.map((t) => <Talk key={t.time} {...t} />)}
            </ul>
            <Slots slots={after} />
          </div>
        </section>
      ))}
      <section className="board" id="day-2" aria-labelledby="d2">
        <div className="plate session">
          <h2 id="d2">{day2.title}</h2>
          <ul className="program">
            {day2.items.flatMap((t) => t.kind === "long" ? [<Talk key={t.time} {...t} />] : [])}
          </ul>
        </div>
      </section>
    </>
  );
}

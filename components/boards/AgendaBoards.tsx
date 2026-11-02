import { conference, type Item } from "@/content";

type Session = Extract<Item, { kind: "session" }>;
type Slot = Extract<Item, { kind: "slot" }>;

const [day1, day2] = conference.days;

// Each session gets a board, carrying the symposia that follow it in the programme.
// The other slots after a session (the opening ceremony, the coffee break) get a board of their own.
const opening: Slot[] = [];
const stops: { session: Session; after: Slot[]; moments: Slot[] }[] = [];
for (const item of day1.items) {
  if (item.kind === "session") stops.push({ session: item, after: [], moments: [] });
  else if (item.kind === "slot") {
    const stop = stops.at(-1);
    if (!stop) opening.push(item);
    else (item.symposium ? stop.after : stop.moments).push(item);
  }
}

// A gold line drawing for each moment: a laurel for the ceremony, a cup for the break.
function Emblem({ title }: { title: string }) {
  const cup = /coffee/i.test(title);
  return (
    <svg className="emblem" viewBox="0 0 48 48" aria-hidden="true">
      {cup ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20h22v8a10 10 0 0 1-10 10h-2a10 10 0 0 1-10-10z" />
          <path d="M33 23h2.5a4 4 0 0 1 0 8H32" />
          <path d="M8 41h30" />
          <path d="M17 9c-1.5 2 1.5 4 0 6M22 8c-1.5 2.5 1.5 4.5 0 7M27 9c-1.5 2 1.5 4 0 6" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 40c-9-2-15-9-15-19M24 40c9-2 15-9 15-19" />
          <path d="M10 27c-3-1-4-4-4-6 3 0 5 2 6 4M12 33c-3 0-5-2-6-4 3-1 6 0 7 2M17 37c-3 1-5 0-7-2 3-2 5-1 7 0" />
          <path d="M38 27c3-1 4-4 4-6-3 0-5 2-6 4M36 33c3 0 5-2 6-4-3-1-6 0-7 2M31 37c3 1 5 0 7-2-3-2-5-1-7 0" />
          <path d="M24 9l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

function Moments({ moments }: { moments: Slot[] }) {
  return (
    <section className="board" id={moments[0].title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} aria-label={moments.map((m) => m.title).join(" and ")}>
      <div className="moments">
        {moments.map((m, i) => {
          const [from, to] = m.time.split(" - ");
          return (
            <div className={`plate honour moment${i ? " minor" : ""}`} key={m.time}>
              <Emblem title={m.title} />
              <p className="eyebrow">{day1.title}</p>
              <h2 className="laureate">{m.title}</h2>
              <div className="flourish" aria-hidden="true"><i /></div>
              <p className="moment-time"><b>{from}</b> – {to}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Arrival and the company symposia: a slim gold ribbon between the talks.
function Ribbons({ slots }: { slots: Slot[] }) {
  if (!slots.length) return null;
  return (
    <ul className="ribbons">
      {slots.map((s) => {
        const [from, to] = s.time.split(" - ");
        return (
          <li key={s.time} className="ribbon">
            <span className="ribbon-time"><b>{from}</b> – {to}</span>
            <i aria-hidden="true" />
            <span className="ribbon-title">{s.title}</span>
          </li>
        );
      })}
    </ul>
  );
}

// One talk on its own gold-framed panel, numbered like the Day 2 sessions.
function TalkPanel({ n, time, title, speakers }: { n: number; time: string; title: string; speakers: string[] }) {
  const [from, to] = time.split(" - ");
  return (
    <li className="talk-panel">
      <span className="medal" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <div>
        <p className="long-time"><b>{from}</b> – {to}</p>
        <h3 className="talk-title">{title}</h3>
        {speakers.length > 0 && <p className="talk-speaker">{speakers.join(", ")}</p>}
      </div>
    </li>
  );
}

export default function AgendaBoards() {
  return (
    <>
      {stops.map(({ session: s, after }, i) => (
        <section className="board" id={i ? `session-${s.n}` : "day-1"} aria-labelledby={`s${s.n}`} key={s.n}>
          <div className="plate honour session">
            {i === 0 && <Ribbons slots={opening} />}
            <p className="eyebrow">{day1.title} · Session {s.n}</p>
            <h2 id={`s${s.n}`} className="laureate">{s.title}</h2>
            <div className="flourish" aria-hidden="true"><i /></div>
            <ol className="talk-panels">
              {s.talks.map((t, k) => <TalkPanel key={t.time} n={k + 1} {...t} />)}
            </ol>
            <Ribbons slots={after} />
          </div>
        </section>
      )).flatMap((board, i) => (stops[i].moments.length ? [board, <Moments key={`m${i}`} moments={stops[i].moments} />] : [board]))}
      <section className="board" id="day-2" aria-labelledby="d2">
        <div className="plate honour day-two">
          <p className="eyebrow">{conference.name}</p>
          <h2 id="d2" className="laureate">{day2.title}</h2>
          <div className="flourish" aria-hidden="true"><i /></div>
          <ol className="long-sessions">
            {day2.items.flatMap((t, i) => {
              if (t.kind !== "long") return [];
              const [from, to] = t.time.split(" - ");
              return [
                <li key={t.time}>
                  <span className="medal" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <p className="long-time"><b>{from}</b> – {to}</p>
                  <h3 className="long-title">{t.title}</h3>
                  {t.speakers.length > 0 && <p className="long-speaker">{t.speakers.join(", ")}</p>}
                </li>,
              ];
            })}
          </ol>
        </div>
      </section>
    </>
  );
}

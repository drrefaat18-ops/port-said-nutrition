"use client";

import { useState } from "react";
import Link from "next/link";
import { conference } from "@/content";

export default function Agenda() {
  const [day, setDay] = useState(0);
  return (
    <>
      <div className="toggle" role="group" aria-label="Day">
        {conference.days.map((d, i) => (
          <button key={d.title} type="button" aria-pressed={day === i} onClick={() => setDay(i)}>{d.title}</button>
        ))}
      </div>
      <ol className="agenda">
        {conference.days[day].items.map((item, i) => (
          <li key={i} id={item.kind === "session" ? `session-${item.n}` : undefined}>
            {item.kind === "session" && (
              <details className="glass">
                <summary>
                  <span className="num">Session {item.n}</span>
                  <span>{item.title}</span>
                </summary>
                <ul className="talks">
                  {item.talks.map((t) => (
                    <li key={t.time}>
                      <span className="time">{t.time}</span>
                      <span>{t.title}</span>
                      <span className="who">{t.speakers.join(", ")}</span>
                    </li>
                  ))}
                </ul>
                <Link className="go" href={`/sessions/${item.n}`}>Open Session {item.n}</Link>
              </details>
            )}
            {item.kind === "slot" && (
              <div className={item.symposium ? "slot symposium" : "slot"}>
                <span className="time">{item.time}</span>
                <span>{item.title}</span>
              </div>
            )}
            {item.kind === "long" && (
              <div className="glass">
                <span className="time">{item.time}</span>
                <span>{item.title}</span>
                <span className="who">{item.speakers.join(", ")}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

import { conference } from "@/content";

// Dawn: name, theme line, date and venue.
export default function B1() {
  return (
    <section className="board" id="b1" aria-labelledby="t1">
      <div className="plate">
        <div className="lead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="roundel" src="/logos/conference.png" alt="" width={112} height={112} />
          <h1 id="t1">{conference.name}</h1>
        </div>
        <p className="theme">{conference.theme}</p>
        <p>
          {conference.date}
          <br />
          {conference.venue}
        </p>
      </div>
    </section>
  );
}

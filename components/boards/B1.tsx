import { conference } from "@/content";

// Dawn: the lighthouse, with name, theme line, date and venue. The logos are on the opening board.
export default function B1() {
  return (
    <section className="board" id="b1" aria-labelledby="t1">
      <div className="plate">
        <h1 id="t1">{conference.name}</h1>
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

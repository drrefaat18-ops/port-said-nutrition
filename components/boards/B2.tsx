import { conference } from "@/content";

// Right after the logo: the presidents and the coordinator, each on a card of their own, set like an honour board.
export default function B2() {
  return (
    <section className="board" id="b2" aria-labelledby="t2">
      <div className="honours">
        <div className="plate honour">
          <h2 id="t2">Conference Presidents</h2>
          <ul className="laureates">
            {conference.presidents.map((p) => (
              <li key={p} className="laureate">{p}</li>
            ))}
          </ul>
          <div className="flourish" aria-hidden="true"><i /></div>
        </div>
        <div className="plate honour coordinator">
          <h3>Conference Coordinator</h3>
          <p className="laureate second">{conference.coordinator}</p>
        </div>
      </div>
    </section>
  );
}

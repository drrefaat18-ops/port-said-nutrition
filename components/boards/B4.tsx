import { conference } from "@/content";

// Afternoon: the conference presidents and the coordinator.
export default function B4() {
  return (
    <section className="board" id="b4" aria-labelledby="t4">
      <div className="plate">
        <h2 id="t4">Conference Presidents</h2>
        <ul className="names">
          {conference.presidents.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <h3>Conference Coordinator</h3>
        <p className="names">{conference.coordinator}</p>
      </div>
    </section>
  );
}

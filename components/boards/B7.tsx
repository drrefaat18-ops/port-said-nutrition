import { conference } from "@/content";

// Night: organised by M Square, the syndicate, phones, email, venue.
export default function B7() {
  const phones = conference.phones.split(" - ");
  return (
    <section className="board" id="b7" aria-labelledby="t7">
      <div className="plate">
        <h2 id="t7">Organized by</h2>
        <div className="org">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="msquare" src="/logos/m-square.svg" alt="M Square" width={220} height={66} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="syndicate" src="/logos/syndicate.png" alt="Port Said Medical Syndicate" width={88} height={88} />
        </div>
        <p className="contact">
          {phones.map((p) => (
            <a key={p} href={`tel:${p}`}>{p}</a>
          ))}
          <a href={`mailto:${conference.email}`}>{conference.email}</a>
        </p>
        <p>
          {conference.date}, {conference.venue}
        </p>
      </div>
    </section>
  );
}

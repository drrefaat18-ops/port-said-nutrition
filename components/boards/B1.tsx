import { conference } from "@/content";

// Dawn: the conference logo and the two partners' logos in the sky, then name, theme line, date and venue.
export default function B1() {
  return (
    <section className="board" id="b1" aria-labelledby="t1">
      <div className="seals">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="roundel" src="/logos/conference.png" alt="" width={240} height={240} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="roundel minor" src="/logos/syndicate.png" alt="Port Said Medical Syndicate" width={240} height={240} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="roundel minor" src="/logos/efncc.png" alt="Egyptian Foundation of Nutrition and Child Care (EFNCC)" width={240} height={240} />
      </div>
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

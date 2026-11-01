import { conference } from "@/content";

// Morning: the theme, while the procession on the shore grows from baby to elder.
export default function B2() {
  const [from, to] = conference.theme.split(" To ");
  return (
    <section className="board" id="b2" aria-labelledby="t2">
      <div className="plate">
        <h2 id="t2" className="big">
          <span>{from}</span> <span>To {to}</span>
        </h2>
      </div>
    </section>
  );
}

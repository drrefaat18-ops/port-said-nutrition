import Organizers from "@/components/Organizers";

// Night: who organises it and who to call.
export default function B7() {
  return (
    <section className="board" id="b7" aria-labelledby="t7">
      <div className="plate">
        <h2 id="t7">Organized by</h2>
        <Organizers />
      </div>
    </section>
  );
}

// The sky photographs: the whole site works over these when the 3D scene is off or still loading.
// They cross-fade with --day, which Boards writes on the root.
export default function Poster() {
  return (
    <div className="poster" aria-hidden="true">
      {["dawn", "day", "sunset", "night"].map((s) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s} className={`poster-${s}`} src={`/sky/${s}.webp`} alt="" />
      ))}
    </div>
  );
}

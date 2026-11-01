// The drawn harbour: the whole site works over this when the 3D scene is off or still loading.
// Dawn and night drawings cross-fade with --day, which Boards writes on the root.
export default function Poster() {
  return (
    <div className="poster" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/posters/harbour-sketch.svg" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="poster-night" src="/posters/harbour-sketch-night.svg" alt="" />
    </div>
  );
}

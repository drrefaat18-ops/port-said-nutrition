import { conference } from "@/content";

// Stub: replaced by the home boards in Task 3.
export default function Home() {
  return (
    <main>
      <h1>{conference.name}</h1>
      <p>{conference.theme}</p>
    </main>
  );
}

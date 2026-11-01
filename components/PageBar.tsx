import Link from "next/link";

// The top bar of the inner pages.
export default function PageBar() {
  return (
    <header className="pagebar">
      <Link href="/" className="home">Home</Link>
      <nav aria-label="Site">
        <Link href="/agenda">Agenda</Link>
        <Link href="/sponsors">Sponsors</Link>
      </nav>
    </header>
  );
}

import Link from "next/link";

// The top bar of the inner pages.
export default function PageBar() {
  return (
    <header className="pagebar">
      <div className="bar-pill">
        <Link href="/" className="home">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </Link>
        <nav aria-label="Site">
          <Link href="/#day-1">Agenda</Link>
          <Link href="/sponsors" className="bar-cta" aria-current="page">Sponsors</Link>
        </nav>
      </div>
    </header>
  );
}

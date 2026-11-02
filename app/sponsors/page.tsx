import type { Metadata } from "next";
import PageBar from "@/components/PageBar";
import Sponsors from "@/components/Sponsors";
import { conference } from "@/content";
import "../inner.css";

export const metadata: Metadata = { title: `Sponsors - ${conference.name}` };

export default function SponsorsPage() {
  return (
    <>
      <PageBar />
      <main className="inner">
        <div className="column">
          <header className="page-head">
            <p className="eyebrow">{conference.name}</p>
            <h1>Sponsorship Packages</h1>
            <div className="flourish" aria-hidden="true"><i /></div>
            <p className="page-when">
              <span>{conference.date}</span>
              <i aria-hidden="true" />
              <span>{conference.venue}</span>
            </p>
          </header>
          <Sponsors />
        </div>
      </main>
    </>
  );
}

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
          <h1>Sponsorship Packages</h1>
          <p className="theme">{conference.date}, {conference.venue}</p>
          <Sponsors />
        </div>
      </main>
    </>
  );
}

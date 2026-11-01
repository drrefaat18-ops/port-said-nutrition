import type { Metadata } from "next";
import PageBar from "@/components/PageBar";
import Agenda from "@/components/Agenda";
import { conference } from "@/content";
import "../inner.css";

export const metadata: Metadata = { title: `Agenda - ${conference.name}` };

export default function AgendaPage() {
  return (
    <>
      <PageBar />
      <main className="inner">
        <div className="column">
          <h1>Agenda</h1>
          <p className="theme">{conference.theme}</p>
          <Agenda />
        </div>
      </main>
    </>
  );
}

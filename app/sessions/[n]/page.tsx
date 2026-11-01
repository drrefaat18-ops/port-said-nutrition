import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBar from "@/components/PageBar";
import SessionVisual from "@/components/SessionVisual";
import { conference, type Item } from "@/content";
import "../../inner.css";

type Session = Extract<Item, { kind: "session" }>;
const sessions = conference.days[0].items.filter((i): i is Session => i.kind === "session");

export const dynamicParams = false;
export const generateStaticParams = () => sessions.map((s) => ({ n: String(s.n) }));

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return { title: `Session ${n} - ${conference.name}` };
}

export default async function SessionPage({ params }: Props) {
  const n = Number((await params).n);
  const s = sessions.find((x) => x.n === n);
  if (!s) notFound();
  const last = sessions.length;
  return (
    <>
      <PageBar />
      <main className="inner">
        <div className="column">
          <SessionVisual n={n} />
          <h3>Session {n}</h3>
          <h1>{s.title}</h1>
          <ul className="talks">
            {s.talks.map((t) => (
              <li key={t.time} className="glass">
                <span className="time">{t.time}</span>
                <span>{t.title}</span>
                <span className="who">{t.speakers.join(", ")}</span>
              </li>
            ))}
          </ul>
          <nav className="pager" aria-label="Sessions">
            {n > 1 ? <Link className="go" href={`/sessions/${n - 1}`}>Session {n - 1}</Link> : <span />}
            {n < last ? <Link className="go" href={`/sessions/${n + 1}`}>Session {n + 1}</Link> : <Link className="go" href="/agenda">Agenda</Link>}
          </nav>
        </div>
      </main>
    </>
  );
}

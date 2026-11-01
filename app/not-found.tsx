import Link from "next/link";
import PageBar from "@/components/PageBar";
import "./inner.css";

export default function NotFound() {
  return (
    <>
      <PageBar />
      <main className="inner">
        <div className="column">
          <h1>This page does not exist</h1>
          <p><Link href="/">Home</Link></p>
          <p><Link href="/agenda">Agenda</Link></p>
        </div>
      </main>
    </>
  );
}

import Poster from "@/components/Poster";
import Harbour from "@/components/Harbour";
import Boards from "@/components/Boards";
import B0 from "@/components/boards/B0";
import B1 from "@/components/boards/B1";
import B2 from "@/components/boards/B2";
import AgendaBoards from "@/components/boards/AgendaBoards";
import B6 from "@/components/boards/B6";
import B7 from "@/components/boards/B7";
import "./home.css";

export default function Home() {
  return (
    <>
      <div className="stage">
        <Poster />
        <Harbour />
      </div>
      <Boards>
        <B0 /><B1 /><B2 /><AgendaBoards /><B6 /><B7 />
      </Boards>
    </>
  );
}

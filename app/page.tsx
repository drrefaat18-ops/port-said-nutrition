import Poster from "@/components/Poster";
import Harbour from "@/components/Harbour";
import Boards from "@/components/Boards";
import B1 from "@/components/boards/B1";
import B2 from "@/components/boards/B2";
import B3 from "@/components/boards/B3";
import B4 from "@/components/boards/B4";
import B5 from "@/components/boards/B5";
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
        <B1 /><B2 /><B3 /><B4 /><B5 /><B6 /><B7 />
      </Boards>
    </>
  );
}

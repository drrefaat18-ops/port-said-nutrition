import { conference, team } from "@/content";
import { mailHref } from "@/lib/mail";

// M Square's logo, then the two people to call. The syndicate's logo sits on the first board.
export default function Organizers() {
  return (
    <div className="org">
      <div className="org-logos">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/m-square.svg" alt="M Square" width={220} height={66} />
      </div>
      <ul className="people">
        {team.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong>
            <small>{p.role}</small>
            <a href={`tel:${p.phone}`}>{p.phone}</a>
          </li>
        ))}
      </ul>
      <a className="org-mail" href={mailHref(conference.email)}>{conference.email}</a>
    </div>
  );
}

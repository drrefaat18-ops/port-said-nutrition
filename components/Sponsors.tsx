"use client";

import { useEffect, useState } from "react";
import { conference } from "@/content";
import { mailHref } from "@/lib/mail";
import Organizers from "./Organizers";
import Stand from "./Stand";

const { tiers, alaCarte, registration, rooms, email } = conference;

const ROWS: [string, (t: (typeof tiers)[number]) => string | undefined][] = [
  ["Price", (t) => t.price],
  ["Sponsors", (t) => t.sponsors],
  ["Session", (t) => t.session],
  ["Logo size", (t) => t.logo],
  ["Social media", (t) => t.social],
  ["Registrations", (t) => t.registrations],
  ["Exhibition area", (t) => t.area],
  ["Roll ups", (t) => t.rollUps],
];

export default function Sponsors() {
  const [name, setName] = useState(tiers[0].name);
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("tier");
    if (tiers.some((t) => t.name === asked)) setName(asked!);
  }, []);
  const tier = tiers.find((t) => t.name === name)!;

  return (
    <>
      <section className="glass" aria-label="Choose a package">
        <fieldset className="tier-pick">
          <legend><h3>Package</h3></legend>
          {tiers.map((t) => (
            <span key={t.name}>
              <input type="radio" id={`t-${t.name}`} name="tier" checked={t.name === name} onChange={() => setName(t.name)} />
              <label htmlFor={`t-${t.name}`}>{t.name}</label>
            </span>
          ))}
        </fieldset>
        <Stand tier={tier} />
        <p className="price">{tier.price}</p>
        <ul className="facts">
          {ROWS.slice(1).flatMap(([label, get]) => {
            const v = get(tier);
            return v ? [<li key={label}><span>{label}</span><span>{v}</span></li>] : [];
          })}
        </ul>
        <a className="mailto" href={mailHref(email, tier.name)}>Email about {tier.name}</a>
      </section>

      <section className="glass" aria-labelledby="compare">
        <h2 id="compare">All packages</h2>
        <div className="scroll" tabIndex={0} role="region" aria-labelledby="compare">
          <table className="compare">
            <thead>
              <tr><td />{tiers.map((t) => <th key={t.name} scope="col">{t.name}</th>)}</tr>
            </thead>
            <tbody>
              {ROWS.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {tiers.map((t) => <td key={t.name}>{get(t) ?? ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass" aria-labelledby="alacarte">
        <h2 id="alacarte">A la carte</h2>
        <ul className="facts">
          {alaCarte.map((a) => <li key={a.name}><span>{a.name}</span><span>{a.price}</span></li>)}
        </ul>
      </section>

      <section className="glass" aria-labelledby="registration">
        <h2 id="registration">Registration</h2>
        <ul className="facts">
          {registration.prices.map((p) => <li key={p.name}><span>{p.name}</span><span>{p.price}</span></li>)}
        </ul>
        <h3>Includes</h3>
        <ul className="includes">
          {registration.includes.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </section>

      <section className="glass" aria-labelledby="rooms">
        <h2 id="rooms">Accommodation</h2>
        <ul className="facts">
          {rooms.map((r) => <li key={r.name}><span>{r.name}</span><span>{r.price}</span></li>)}
        </ul>
      </section>

      <section className="glass" aria-labelledby="org">
        <h2 id="org">Organized by</h2>
        <Organizers />
      </section>
    </>
  );
}

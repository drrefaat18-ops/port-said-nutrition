import data from "./conference.json" with { type: "json" };

export type Talk = { time: string; title: string; speakers: string[] };
export type Item =
  | { kind: "session"; n: number; title: string; talks: Talk[] }
  | { kind: "slot"; time: string; title: string; symposium: boolean }
  | { kind: "long"; time: string; title: string; speakers: string[] };
export type Tier = {
  name: string;
  price: string;
  sponsors: string;
  session?: string;
  logo: string;
  social: string;
  registrations: string;
  area: string;
  rollUps?: string;
};
export type Conference = {
  name: string;
  theme: string;
  date: string;
  venue: string;
  presidents: string[];
  coordinator: string;
  phones: string;
  email: string;
  tiers: Tier[];
  alaCarte: { name: string; price: string }[];
  registration: { includes: string[]; prices: { name: string; price: string }[] };
  rooms: { name: string; price: string }[];
  days: { title: string; items: Item[] }[];
};

export const conference = data as Conference;

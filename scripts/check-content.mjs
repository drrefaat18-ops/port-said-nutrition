import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const SOURCE = fileURLToPath(new URL("../docs/agenda-source.md", import.meta.url));
// Changes the owner approved after the PDF; checked as if they were part of it.
const CHANGES = fileURLToPath(new URL("../docs/agenda-changes.md", import.meta.url));
const norm = (s) => s.replace(/\s+/g, "").toLowerCase();

export function missing(values, source) {
  const hay = norm(source.replace(/ \^p\d+-\d+/g, ""));
  return values.filter((v) => !hay.includes(norm(v)));
}

function strings(node, key, out = []) {
  if (typeof node === "string") {
    if (key !== "kind") out.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((n) => strings(n, key, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) strings(v, k, out);
  }
  return out;
}

function shape(conference) {
  const items = conference.days.flatMap((d) => d.items);
  const sessions = items.filter((i) => i.kind === "session");
  assert.equal(conference.days.length, 2, "two days");
  assert.equal(sessions.length, 7, "7 sessions");
  assert.equal(sessions.flatMap((s) => s.talks).length, 22, "22 talks");
  assert.equal(items.filter((i) => i.kind === "slot" && i.symposium).length, 4, "4 symposia");
  assert.equal(items.filter((i) => i.kind === "long").length, 2, "2 long items");
  assert.equal(conference.tiers.length, 4, "4 tiers");
}

function main() {
  const file = new URL("../content/conference.json", import.meta.url);
  const conference = JSON.parse(readFileSync(file, "utf8"));
  const source = readFileSync(process.argv[2] ?? SOURCE, "utf8") + "\n" + (existsSync(CHANGES) ? readFileSync(CHANGES, "utf8") : "");
  const bad = missing(strings(conference), source);
  if (bad.length) {
    console.error("Not in the source copy:\n" + bad.map((b) => "  " + b).join("\n"));
    process.exit(1);
  }
  shape(conference);
  console.log("content ok: every value is in the source copy, counts match");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

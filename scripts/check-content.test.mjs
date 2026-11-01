import { test } from "node:test";
import assert from "node:assert/strict";
import { missing } from "./check-content.mjs";

test("flags a value missing from the source", () => {
  assert.deepEqual(missing(["100K EGP", "101K EGP"], "x 100K EGP x"), ["101K EGP"]);
});

test("ignores spacing and case", () => {
  assert.deepEqual(missing(["Evidence-Based Preterm"], "evidence- based  PRETERM"), []);
});

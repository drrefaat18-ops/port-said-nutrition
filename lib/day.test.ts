import { test } from "node:test";
import assert from "node:assert/strict";
import { dayPhase } from "./day.ts";

test("the day runs from dawn to night", () => {
  assert.equal(dayPhase(0), "dawn");
  assert.equal(dayPhase(1), "night");
});

test("progress outside 0..1 is clamped", () => {
  assert.equal(dayPhase(-1), "dawn");
  assert.equal(dayPhase(2), "night");
});

test("each of the seven boards has its phase", () => {
  const phases = [0, 1, 2, 3, 4, 5, 6].map((i) => dayPhase(i / 6));
  assert.deepEqual(phases, ["dawn", "morning", "day", "afternoon", "sunset", "night", "night"]);
  assert.equal(dayPhase(4 / 6), "sunset");
});

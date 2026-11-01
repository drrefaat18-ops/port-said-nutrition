import { test } from "node:test";
import assert from "node:assert/strict";
import { capable } from "./capable.ts";

test("capable is false with reduced motion", () => {
  assert.equal(capable({ reduced: true, webgl: true }), false);
});

test("capable is false without webgl", () => {
  assert.equal(capable({ reduced: false, webgl: false }), false);
});

test("capable is true otherwise, whatever the memory", () => {
  assert.equal(capable({ reduced: false, webgl: true, memory: 2 }), true);
  assert.equal(capable({ reduced: false, webgl: true, memory: 4 }), true);
  assert.equal(capable({ reduced: false, webgl: true }), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { logoScale, mailHref, rollUpCount, standSize } from "./mail.ts";

test("standSize reads the printed area", () => {
  assert.deepEqual(standSize("6X2"), { w: 6, d: 2 });
});

test("logoScale reads the printed logo size", () => {
  assert.equal(logoScale("8X"), 8);
});

test("rollUpCount reads the printed count, none when absent", () => {
  assert.equal(rollUpCount({ rollUps: "1 Roll Up" }), 1);
  assert.equal(rollUpCount({}), 0);
});

test("mailHref carries the tier", () => {
  const href = mailHref("admin@mtechsquare.com", "Gold");
  assert.ok(href.startsWith("mailto:admin@mtechsquare.com?subject="));
  assert.ok(href.includes("Gold"));
});

test("mailHref without a tier", () => {
  const href = mailHref("admin@mtechsquare.com");
  assert.ok(!href.includes("Gold"));
  assert.ok(!href.includes("undefined"));
});

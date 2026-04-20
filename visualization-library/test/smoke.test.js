import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

test("core library files exist", () => {
  assert.equal(existsSync(new URL("../src/sensemaker-chart.js", import.meta.url)), true);
  assert.equal(existsSync(new URL("../package.json", import.meta.url)), true);
});

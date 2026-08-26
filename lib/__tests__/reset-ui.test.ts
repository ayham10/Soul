import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("admin reset UI wiring", () => {
  it("uses baseline restore instead of seed reset", () => {
    const storeSource = readFileSync("lib/store.tsx", "utf8");
    const adminSource = readFileSync("app/admin/page.tsx", "utf8");

    assert.equal(storeSource.includes("saveCatalog(seed)"), false);
    assert.match(storeSource, /restoreToBaseline/);
    assert.match(storeSource, /\/api\/admin\/baseline-restore/);

    assert.equal(adminSource.includes("await reset("), false);
    assert.match(adminSource, /restoreToBaseline/);
    assert.match(adminSource, /resetBaseline/);
    assert.match(adminSource, /RESET TO 103 BASELINE|resetBaselineConfirmLabel/);
  });
});

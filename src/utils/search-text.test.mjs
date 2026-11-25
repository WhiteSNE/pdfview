import assert from "node:assert/strict";
import test from "node:test";
import { collectHits } from "./search-text.ts";

test("collectHits: returns one hit per occurrence with page and snippet", () => {
  const hits = collectHits(["one banana two banana", "banana"], "banana");
  assert.equal(hits.length, 3);
  assert.deepEqual(
    hits.map(({ page, index }) => [page, index]),
    [
      [1, 1],
      [1, 2],
      [2, 1],
    ],
  );
  assert.match(hits[0].snippet, /banana/);
});

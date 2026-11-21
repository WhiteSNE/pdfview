import assert from "node:assert/strict";
import test from "node:test";
import { collectHits, collectPageMatches, countMatches } from "./search-text.ts";

test("countMatches: counts exact text case-insensitively", () => {
  assert.equal(countMatches("Cat cat CAT", "cat"), 3);
});

test("countMatches: counts non-overlapping occurrences", () => {
  assert.equal(countMatches("aaaa", "aa"), 2);
});

test("countMatches: ignores whitespace around the query", () => {
  assert.equal(countMatches("hello world", "  world "), 1);
});

test("countMatches: returns zero for an empty query", () => {
  assert.equal(countMatches("anything", "   "), 0);
});

test("collectPageMatches: reports per-page counts and skips empty pages", () => {
  assert.deepEqual(
    collectPageMatches(["a a", "b", "A", ""], "a"),
    [
      { page: 1, count: 2 },
      { page: 3, count: 1 },
    ],
  );
});

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

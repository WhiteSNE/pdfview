import assert from "node:assert/strict";
import test from "node:test";
import { expandPageRanges } from "./pages.ts";

test("expandPageRanges: expands ranges and individual pages", () => {
  assert.deepEqual(expandPageRanges("1-3, 5, 7-8", 10), [1, 2, 3, 5, 7, 8]);
});

test("expandPageRanges: caps an oversized range at the real page count", () => {
  assert.deepEqual(expandPageRanges("1-999999999", 3), [1, 2, 3]);
});

test("expandPageRanges: drops pages outside the document", () => {
  assert.deepEqual(expandPageRanges("0, 4-6, 99", 3), []);
});

test("expandPageRanges: returns nothing until the page count is known", () => {
  assert.deepEqual(expandPageRanges("1-5", 0), []);
});

test("expandPageRanges: sorts and removes duplicates", () => {
  assert.deepEqual(expandPageRanges("3, 1-2, 2", 5), [1, 2, 3]);
});


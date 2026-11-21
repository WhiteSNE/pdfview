export type PageMatch = {
  page: number;
  count: number;
};

export type TextHit = {
  page: number;
  index: number; // 1-based position of this match within its page
  snippet: string; // the matched text with a little surrounding context
};

// Build a flat, ordered list of hits with a short context snippet for each.
export function collectHits(texts: string[], query: string): TextHit[] {
  const needle = query.trim();
  if (!needle) return [];
  const lowerNeedle = needle.toLowerCase();
  const hits: TextHit[] = [];

  texts.forEach((text, pageIndex) => {
    const lower = text.toLowerCase();
    let from = 0;
    let index = 0;
    while (true) {
      const at = lower.indexOf(lowerNeedle, from);
      if (at === -1) break;
      index += 1;
      const start = Math.max(0, at - 24);
      const end = Math.min(text.length, at + needle.length + 24);
      hits.push({
        page: pageIndex + 1,
        index,
        snippet: `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ")}${end < text.length ? "…" : ""}`,
      });
      from = at + needle.length;
    }
  });

  return hits;
}

// Count literal (case-insensitive, non-overlapping) occurrences of a query.
export function countMatches(text: string, query: string): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;
  const haystack = text.toLowerCase();
  let count = 0;
  let from = 0;
  while (true) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) break;
    count += 1;
    from = index + needle.length;
  }
  return count;
}

// Keep only pages with at least one match, with their per-page counts.
export function collectPageMatches(texts: string[], query: string): PageMatch[] {
  const matches: PageMatch[] = [];
  texts.forEach((text, index) => {
    const count = countMatches(text, query);
    if (count > 0) matches.push({ page: index + 1, count });
  });
  return matches;
}

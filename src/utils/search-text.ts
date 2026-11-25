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


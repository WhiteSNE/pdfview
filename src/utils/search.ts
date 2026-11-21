import {
  extractTextFromPage,
  getPageCount,
  isAvailable,
} from "expo-pdf-text-extract";
import {
  collectHits,
  collectPageMatches,
  type PageMatch,
  type TextHit,
} from "./search-text";

export type { PageMatch, TextHit } from "./search-text";
export { collectHits, countMatches, collectPageMatches } from "./search-text";

export type SearchResult = {
  matches: PageMatch[];
  hits: TextHit[];
  total: number;
  pageCount: number;
};

// Extract each page's text and find literal matches with per-page counts.
export async function searchPdf(uri: string, query: string): Promise<SearchResult> {
  if (!isAvailable()) {
    throw new Error("Text extraction requires a development build.");
  }
  if (!query.trim()) {
    return { matches: [], hits: [], total: 0, pageCount: 0 };
  }

  const pageCount = await getPageCount(uri);
  const texts: string[] = [];
  for (let page = 1; page <= pageCount; page += 1) {
    texts.push(await extractTextFromPage(uri, page));
  }

  const matches = collectPageMatches(texts, query);
  const hits = collectHits(texts, query);
  return {
    matches,
    hits,
    total: hits.length,
    pageCount,
  };
}

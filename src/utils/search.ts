import {
  extractTextFromPage,
  getPageCount,
  isAvailable,
} from "expo-pdf-text-extract";
import { collectHits, type TextHit } from "./search-text";

export type { TextHit } from "./search-text";
export { collectHits } from "./search-text";

export type SearchResult = {
  hits: TextHit[];
  total: number;
  pageCount: number;
};

// Extract each page's text and find literal matches.
export async function searchPdf(uri: string, query: string): Promise<SearchResult> {
  if (!isAvailable()) {
    throw new Error("Text extraction requires a development build.");
  }
  if (!query.trim()) {
    return { hits: [], total: 0, pageCount: 0 };
  }

  const pageCount = await getPageCount(uri);
  const texts: string[] = [];
  for (let page = 1; page <= pageCount; page += 1) {
    texts.push(await extractTextFromPage(uri, page));
  }

  const hits = collectHits(texts, query);
  return {
    hits,
    total: hits.length,
    pageCount,
  };
}

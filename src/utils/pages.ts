// "1-5, 8, 12-14" -> [1,2,3,4,5,8,12,13,14]
export function expandPageRanges(input: string, pageCount: number): number[] {
  if (!pageCount) return [];
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const [start, end] = part.trim().split("-").map(Number);
    if (!Number.isInteger(start) || start < 1 || start > pageCount) continue;
    const last = Math.min(Number.isInteger(end) ? end : start, pageCount);
    for (let page = start; page <= last; page++) {
      pages.add(page);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

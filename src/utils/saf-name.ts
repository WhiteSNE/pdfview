// Content URIs carry the display name percent-encoded in the last segment, e.g.
// .../document/primary%3ADownload%2FPDFView -> "PDFView".
export function safDisplayName(uri: string) {
  try {
    return decodeURIComponent(uri).split("/").filter(Boolean).pop();
  } catch {
    return uri.split("/").filter(Boolean).pop();
  }
}

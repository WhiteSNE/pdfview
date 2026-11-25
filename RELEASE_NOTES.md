# Release notes — PDFView Complete (early build)

Version: 1.0.0-complete
Branch: `main`

## What's in this build
- Open PDF files and browse recent documents (long-press to select/remove).
- Cut selected pages into a new PDF.
- Merge multiple PDFs into one PDF.
- Find text inside a document:
  - exact, case-insensitive match counting;
  - a match counter (`current / total`) and next/previous match navigation with wrap-around;
  - a snippet showing the current match's page and context.
- Page navigation (previous / next) and "Go to page".
- Print the open document via the system print dialog.
- Dark / light theme following the device setting.
- On first launch, pick an output folder for cut/merge results (Android).

## Notes
- This is a standalone release APK for evaluation. It does not need Metro or Expo Go.
- Find works on digital PDFs with embedded text. Scanned/image-only PDFs have no searchable text and will report zero matches.
- All processing is local on the device — no account, no server.
- Each release includes a `.sha256` checksum file. Verify your download with `sha256sum -c pdfview-complete-1.0.0.apk.sha256`.
- Full usage instructions are in the [User Guide](docs/USER_GUIDE.md).

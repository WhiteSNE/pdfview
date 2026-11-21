# Release notes — PDFView Reader (early build)

Version: 1.0.0-reader
Branch: `reader-only`

## What's in this build
- Open PDF files from the device and view them.
- Recent documents list with long-press multi-select and removal.
- Page navigation (previous / next) and "Go to page".
- Print the open document via the system print dialog.
- Dark / light theme following the device setting.
- No setup screen — open a PDF straight away. Opened files are copied into app storage so recents keep working.

## Not included (available in the Complete edition)
- Cut pages / merge documents.
- Find-in-document text search with match navigation.

## Notes
- This is an early build for evaluation. This is a development client; it requires a development build (`npx expo run:android --device`) and will not run in Expo Go.
- All processing is local on the device — no account, no server.
- Each release includes a `.sha256` checksum file. Verify your download with `sha256sum -c pdfview-reader-1.0.0-debug.apk.sha256`.
- Full usage instructions are in the [User Guide](docs/USER_GUIDE.md).

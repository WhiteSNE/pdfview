# PDFView Reader

A minimal, local PDF reader for Android and iOS. Open PDFs, browse recent documents, jump between pages, and print — all on your device, with no account and no server.

This is the **Reader** edition (branch `reader-only`). It intentionally has no editing tools. For cutting, merging, and text search, see the [Complete edition](https://github.com/WhiteSNE/pdfview/tree/main).

## Features
- Open PDF files from your device.
- Recent documents list (long-press to select/remove).
- Page navigation and "Go to page".
- Print via the system print dialog.
- Device dark/light theme.

## Documentation
- **[User Guide](docs/USER_GUIDE.md)** — full, step-by-step instructions for every feature.
- [Release notes](RELEASE_NOTES.md) — what is in this early build.

## Get started

This app uses native modules, so it needs a development build (it will not run in Expo Go):

```bash
npm install
npx expo run:android        # or: npx expo run:ios
```

To start the dev server separately:

```bash
npx expo start
```

There is no setup screen — tap **+** on the Home screen to open your first PDF.

## Checks

```bash
npx tsc --noEmit            # types
npx expo lint --no-cache    # lint
npm test                    # unit tests
```

## Early build packages

Prebuilt development APKs are attached to the [GitHub Releases](https://github.com/WhiteSNE/pdfview/releases) tagged `reader-*`. Each release includes a `.sha256` checksum file — verify a download with `sha256sum -c <file>.sha256`.

## Builds

Use EAS to build and sign:

```bash
npx eas-cli build
```

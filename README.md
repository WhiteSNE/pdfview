# PDFView (Complete)

A local PDF tool for Android and iOS. Open PDFs, cut pages, merge documents, find text inside a document, and print — all on your device, with no account and no server.

This is the **Complete** edition (branch `main`). For a minimal reader without editing tools, see the [Reader edition](https://github.com/WhiteSNE/pdfview/tree/reader-only).

## Features
- Open PDF files from your device; recents list with long-press multi-select/removal.
- **Cut** selected pages into a new PDF.
- **Merge** multiple PDFs into one.
- **Find** text inside a document with per-page match counts and next/previous match navigation.
- Page navigation, "Go to page", and print via the system print dialog.
- Device dark/light theme.

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

On first launch on Android, choose a folder where PDFView saves output files (results of cut/merge). Android grants access through the system folder picker; the choice is remembered.

## Checks

```bash
npx tsc --noEmit   # types
npx expo lint      # lint
npm test           # unit tests
```

## Early build packages

Prebuilt development APKs are attached to the [GitHub Releases](https://github.com/WhiteSNE/pdfview/releases) tagged `complete-*`.

## Builds

Use EAS to build and sign:

```bash
npx eas-cli build
```

# PDFView

A local PDF tool for Android and iOS. Open PDFs, cut selected pages, merge PDFs, and print them. All work happens on the device — there is no account and no server.

## Get started

```bash
npm install
npx expo start
```

This app uses native modules, so use a development build or `npx expo run:android` / `npx expo run:ios` rather than Expo Go. See the [development build guide](https://docs.expo.dev/develop/development-builds/introduction/).

On first launch, choose a folder where PDFView will save output files. Android grants access through the system folder picker; the choice is remembered.

## Checks

```bash
npx tsc --noEmit   # types
npx expo lint      # lint
npm test           # page-range parser tests
```

## Builds

Use EAS to build and sign:

```bash
npx eas-cli build
```

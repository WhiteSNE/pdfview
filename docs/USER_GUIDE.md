# PDFView Reader — User Guide

This guide explains every feature in the Reader edition and how to use it. The Reader edition is a minimal PDF viewer: it opens PDFs, keeps a recent list, lets you navigate pages and print. It has no editing tools. All work stays on your device — there is no account, no upload, and no server.

Need to cut, merge, or search text? Use the [Complete edition](https://github.com/WhiteSNE/pdfview/tree/main).

---

## 1. Home screen — Recent documents

When you open the app you land on **Recent documents**.

- **Open a document:** tap its row.
- **Select several:** long-press a row. A selection bar appears showing how many are selected.
  - Tap other rows to add/remove them from the selection.
  - Tap **Remove (n)** to delete those entries from the recents list, or **Cancel** to exit selection mode.
  - Removing from recents does **not** delete the actual PDF file from your storage.
- Each row shows the word **Opened** and the date it was opened.
- Up to 20 recent documents are kept.

Unlike the Complete edition, the Reader edition has **no first-launch folder setup** — you can open a PDF right away.

---

## 2. Open a PDF

1. Tap the **+** button (bottom-right). The system file picker opens immediately.
2. Browse to a PDF and select it.
3. The document opens in the viewer and is added to Recents.

When you open a file, PDFView keeps a stable copy in its own app storage. That means the recent entry keeps working even if the original file in Downloads is later moved or deleted.

---

## 3. The PDF viewer

- **Title bar** — the file name (long names scroll automatically). Tap `‹` to go back to Home.
- **Page bar** — shows `current / total` pages with **‹ Previous** and **Next ›** buttons.
- **Document options** — the floating `⋮` button at bottom-right, used for Go to page and Print (below).
- Pinch/scroll to zoom and pan, as in any PDF viewer.

### Go to page
1. Tap `⋮` → **Go to page**.
2. Type a page number and tap **Go** (or press Enter).

### Print
1. Tap `⋮` → **Print**.
2. The Android print dialog opens. Choose a printer or **Save as PDF**.

The Reader edition's options menu contains only **Go to page** and **Print** — there is no Find, Cut, or Merge.

---

## 4. Theme and appearance

The app follows your device's dark/light setting automatically. There is no separate in-app theme switch.

---

## 5. Frequently asked questions

**Does it need internet?** No. Everything runs locally on the device.

**Can it run in Expo Go?** No — it uses native modules. Use the development build (see the README) or an installed APK from Releases.

**Can it search text in a PDF?** No. Find is only available in the Complete edition.

**Can it edit PDFs (cut/merge)?** No. Those tools are only in the Complete edition.

**Why can't I find a file I opened?** It may have been removed from Recents with long-press → Remove. Open it again with **+**. (This only removed the list entry, not the file itself.)

---

## 6. Building from source / verifying downloads

See the [README](../README.md) for build instructions and the [release notes](../RELEASE_NOTES.md) for what is in this early build. Each GitHub Release includes an APK and a `.sha256` checksum file; verify a download with:

```bash
sha256sum -c pdfview-reader-1.0.0-debug.apk.sha256
```

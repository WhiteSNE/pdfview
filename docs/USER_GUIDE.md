# PDFView Complete — User Guide

This guide explains every feature in the Complete edition and how to use it. PDFView keeps all work on your device — there is no account, no upload, and no server.

---

## 1. First launch: choose an output folder

On Android, the first thing you see is **Choose an output folder**.

1. Tap **Choose folder**.
2. The Android folder picker opens. Browse to the location where you want PDFView to save files it creates (for example, `Downloads`).
3. If Android asks **Allow access to ...**, tap **Allow**. PDFView needs this permission so it can write your cut/merge results there.
4. Select the folder.

The choice is remembered — you normally only do this once. If you later see the message *"This file can no longer be opened. Please create it again."*, the saved folder became invalid (for example after a reset); just choose a folder again.

> **Why a folder?** Cutting and merging produce new PDF files. PDFView writes them to a folder you choose, so you can find them with any file manager.

---

## 2. Home screen — Recent documents

The Home screen lists documents you have opened or created, newest first.

- **Open a document:** tap its row.
- **Select several:** long-press a row. A selection bar appears showing how many are selected.
  - Tap other rows to add/remove them from the selection.
  - Tap **Remove (n)** to delete those entries from the recents list, or **Cancel** to exit selection mode.
  - Removing from recents does **not** delete the actual PDF file from your storage.
- Each row shows a source label — **Opened** (a file you opened) or **Created** (a result of Cut/Merge) — and the date.
- Up to 20 recent documents are kept.

---

## 3. Open a PDF

There are two ways:

**From Home**
1. Tap the **+** button (bottom-right).
2. Tap **Open Document**.
3. Pick a PDF using the system file picker.

**From within this app**
- Opening a document automatically adds it to Recents and keeps a stable copy in app storage, so the entry keeps working even if the original file in Downloads is moved or deleted.

---

## 4. The PDF viewer

When you open a PDF you get:

- **Title bar** — the file name (long names scroll automatically). Tap `‹` to go back.
- **Page bar** — shows `current / total` pages with **‹ Previous** and **Next ›** buttons.
- **Document options** — the floating `⋮` button at bottom-right (see below).
- Pinch/scroll to zoom and pan, as in any PDF viewer.

### Go to page
1. Tap `⋮` → **Go to page**.
2. Type a page number and tap **Go** (or press Enter).

### Print
1. Tap `⋮` → **Print**.
2. The Android print dialog opens. Choose a printer or **Save as PDF**.

### Find text in the document
1. Tap `⋮` → **Find**. A search bar appears under the title.
2. Type the text you want and press Enter / the keyboard's search key.
3. The counter shows your position, for example **2 / 3** (second match out of three).
4. Use **‹** and **›** to move to the previous/next match. Navigation wraps around.
5. The line under the search bar shows the current match's page and a snippet of surrounding text, e.g. `Page 2 · apple banana banana cherry`.
6. Tap **✕** to close Find.

Search details:
- Matching is **case-insensitive** and matches literal text (`cat` finds `Cat` and `CAT`).
- Each occurrence is counted separately; the same word twice on one page counts as two matches.
- Works on PDFs that contain real embedded text. Scanned/image-only PDFs have no searchable text and will report **0 / 0** with the message *"No text matches found (scanned PDFs have no searchable text)."*
- Searching a long PDF extracts text from every page first, which can take a moment; a `…` is shown while it works.

---

## 5. Cut pages

Create a new PDF containing only the pages you choose.

1. From Home, tap **+** → **Cut Document**.
2. Tap **Choose PDF** and select the source PDF. A preview appears so you can see the pages; the current page number is shown at the top.
3. In **Output filename**, the name is pre-filled as `<original>-cut`. You can change it. The `.pdf` extension is added automatically.
4. In the pages field, enter the pages you want:
   - A single page: `3`
   - Several pages: `1, 2, 5`
   - A range: `1-5`
   - Mixed: `1-5, 8, 12-14`
   - Out-of-range or invalid numbers are ignored; duplicates are counted once.
5. Tap **Save selected pages**.
6. The new PDF is written to your chosen output folder and added to Recents as **Created**. The app returns Home; tap the new entry to view it.

Page-number rules: numbering starts at 1; ranges like `3-1` produce nothing; blank/invalid input shows *"Enter pages like 1-5 or 1, 2, 3."*

---

## 6. Merge documents

Combine two or more PDFs into one, in the order you choose.

1. From Home, tap **+** → **Merge Document**.
2. Tap **ADD PDF FILES** and select two or more PDFs. You can repeat this to add more.
   - The same file is not added twice.
   - The output name is pre-filled from the first file as `<first-file>-merged`; you can edit it.
3. Each selected file appears in a numbered list. Use the **▲ / ▼** buttons to change the order — this is the order pages will appear in the merged PDF. Use **✕** to remove a file.
4. Tap **MERGE PDFS** (enabled once you have at least two files).
5. The merged PDF is saved to your output folder, added to Recents as **Created**, and you are returned Home.

---

## 7. Where are my created files?

- Cut and merge results are written to the output folder you picked on first launch (e.g. `Downloads/PDFView/`). You can open them with any file manager.
- They also appear in PDFView's Recents. Tapping a recent opens the app's own local copy, which is why results keep working even if the folder is later removed from Android's file system view.

---

## 8. Theme and appearance

The app follows your device's dark/light setting automatically. There is no separate in-app theme switch.

---

## 9. Frequently asked questions

**Does it need internet?** No. Everything runs locally on the device.

**Can it run in Expo Go?** No — it uses native modules. Use the development build (see the README) or an installed APK from Releases.

**Can it search scanned PDFs?** No. Scanning produces images, which contain no text to search. An OCR feature would be needed.

**Can it open password-protected PDFs?** The viewer may open them if the password is supplied by the system; cut/merge attempt to ignore encryption but may fail on encrypted documents. Password handling is limited.

**Why did my result fail to open?** Very old versions stored a folder URI that could not be reopened. Recreate the file, or pick your output folder again if prompted.

---

## 10. Building from source / verifying downloads

See the [README](../README.md) for build instructions and the [release notes](../RELEASE_NOTES.md) for what changed in this early build. Each GitHub Release includes an APK and a `.sha256` checksum file; verify a download with:

```bash
sha256sum -c pdfview-complete-1.0.0-debug.apk.sha256
```

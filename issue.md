# PDFView — audit fixes

Small local Expo app. Work top to bottom. Each issue has the file, the line to find, the change, and the check that proves it.

After every change:

```bash
npm test
npx tsc --noEmit
npx expo lint --no-cache
```

Native file behaviour cannot be tested by `npm test`. Do one manual Android check at the end: pick a folder, cut a PDF, merge two PDFs, reopen both from Recents.

Rules: no new dependencies, no new abstractions, do not touch unrelated code. Issues 2, 3, 5, 6 and 7 all edit `src/utils/directories.ts` — do them in that order on one branch.

---

## Must fix

- [x] **1. Merge adds the same PDF twice** — `src/app/screens/merge-document.tsx` around L38-46
  - **Find:** `if (!next.some((f) => f.uri === item.uri)) {`
  - **Change:** compare names instead: `if (!next.some((f) => f.name === item.name)) {`. The Android picker gives every pick a new cache URI, so the URI check never matches the same source file.
  - **Check:** pick the same PDF twice with "Add PDF Files"; the counter stays at 1 file and the merged PDF has no repeated pages.

- [x] **2. Generated PDFs must not overwrite opened PDFs** — `src/utils/directories.ts` around L10 and L119-127
  - **Find:** `const local = new File(OPENED_DOCUMENTS_DIR, safeName);`
  - **Change:** add `const GENERATED_DOCUMENTS_DIR = new Directory(Paths.document, "generated");` beside `OPENED_DOCUMENTS_DIR`. In `saveViewerCopy`, create that directory (same `{ idempotent: true, intermediates: true }` call) and write `local` there instead. Leave `pickAndSavePdf` on `opened/`.
  - **Check:** open `a.pdf`; cut a different PDF and name the result `a.pdf`; the old `a.pdf` still opens from Recents and still shows the original pages.

- [x] **3. A failed save must not destroy the old file** — `src/utils/directories.ts` around L107-114 and L119-127
  - **Find:** `const output = existingFile ?? directory.createFile(safeName, "application/pdf");` then `await output.write(bytes);`
  - **Change:** write to a temp file first, then copy over the target with overwrite. Do the same in `saveViewerCopy` after issue 2.

    ```ts
    const temp = directory.createFile(`.${safeName}.${Date.now()}.tmp`, "application/pdf");
    try {
      await temp.write(bytes);
      const target = existingFile ?? directory.createFile(safeName, "application/pdf");
      await temp.copy(target, { overwrite: true });
      return target;
    } finally {
      temp.delete();
    }
    ```

    `File.write` truncates the target before writing, so the old comment saying "deleting first would lose the old PDF" is wrong. Delete or correct that comment.
  - **Check:** cut or merge a PDF successfully; the output opens. Fill device storage or kill the app during a second save; the first result is still readable, not zero bytes.

---

## Should fix

- [x] **4. Remove the unused per-page match counts** — `src/utils/search.ts`, `src/utils/search-text.ts`, `src/utils/search-text.test.mjs`, `README.md` L11, `RELEASE_NOTES.md` L11
  - **Find:** `matches: PageMatch[]` in `SearchResult`; `collectPageMatches(...)` in `searchPdf`; `PageMatch`, `countMatches`, `collectPageMatches` in `search-text.ts`.
  - **Change:** delete the `matches` field, its computation, the `collectPageMatches` import and re-export, the `PageMatch` type, and both helper functions. Delete their tests in `search-text.test.mjs`; keep the `collectHits` test. Remove "per-page match counts" / "per-page" from the two docs. Do not build new UI for it.
  - **Check:** `npm test` passes with the `collectHits` test still present; `npx tsc --noEmit` passes; no screen or test refers to `matches`/`collectPageMatches` (grep the tree).

- [x] **5. Stop deleting the recents file before replacing it** — `src/utils/directories.ts` around L172-179
  - **Find:** `if (RECENTS_FILE.exists) { RECENTS_FILE.delete(); }` then `temp.rename("recent-documents.json");`
  - **Change:** replace both steps with `await temp.copy(RECENTS_FILE, { overwrite: true }); temp.delete();`. Do not delete the real file first.
  - **Check:** add and remove a recent document; restart the app; the list is correct.

- [x] **6. Android folder names never match, so duplicates pile up** — `src/utils/directories.ts` around L70-76 and L107-112
  - **Find:** `.find((item): item is Directory => item instanceof Directory && item.name === OUTPUT_DIRECTORY_NAME)` and `.find((item): item is File => item instanceof File && item.name === safeName)`
  - **Decision:** for `content://` folders, `.name` is a document ID, not the display name. Chose: reuse the saved `PDFView` folder by URI, and let Android auto-suffix same-name saves (`name (1).pdf`) instead of overwriting.
  - **Change:** match the stored output directory by `item.uri`; skip the by-name file lookup when the directory is `content://`.
  - **Check:** pick the chosen folder twice; no surprise extra `PDFView` folder. Save twice with one name; Android creates `name (1).pdf`, nothing is lost.

- [x] **7. Clean the picked filename before copying** — `src/utils/directories.ts` around L216
  - **Find:** `const saved = new File(OPENED_DOCUMENTS_DIR, document.name);`
  - **Change:** `const saved = new File(OPENED_DOCUMENTS_DIR, document.name.replace(/[/\\]/g, "_"));` — same rule already used at L106 and L123.
  - **Check:** open PDFs from the normal picker; they still land in `opened/` and open. A name with `/` no longer causes a silent failure.

- [x] **8. Clear Find results when the query changes** — `src/app/screens/pdf-viewer.tsx` around L160-169
  - **Find:** `onChangeText={setFindQuery}`
  - **Change:** use a handler that clears the old result too:

    ```tsx
    onChangeText={(text) => {
      setFindQuery(text);
      setFindResult(null);
      setCurrentHit(0);
    }}
    ```
  - **Check:** search `cat`, then type `dog`; the counter and snippet disappear until Enter is pressed again.

- [x] **10. Remove the message that does not exist from the guide** — `docs/USER_GUIDE.md` L78
  - **Find:** `with the message *"No text matches found (scanned PDFs have no searchable text)."*`
  - **Change:** end the sentence at `will report **0 / 0**.`
  - **Check:** the guide no longer describes a message the app never shows.

- [x] **11. Add a catch to the storage recheck** — `src/app/_layout.tsx` around L67-75
  - **Find:** `void checkStorageAccess().then((granted) => {`
  - **Change:** add `.catch(() => {})` to the end of that chain, like the initial check at L55-60. Do not kick the user out on a transient error.
  - **Check:** `npx tsc --noEmit` passes; app still opens normally when the folder is already stored.

---

## Needs a decision — do not do unless asked

- [ ] **9. Unused native dependencies** — `package.json`, `app.json` L34 (`react-native-blob-util` plugin)
  - Eleven direct dependencies are never imported by `src`: `@expo/ui`, `expo-constants`, `expo-font`, `expo-glass-effect`, `expo-linking`, `expo-symbols`, `expo-status-bar`, `react-native-blob-util`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`. REMINDER.md L21-25 says the user already chose to keep them.
  - Removing them requires `npm install`, a new native build, and a device smoke test. Do not remove `react-dom` or `react-native-web`; they are used for web support.
  - Ask first. If approved: remove the entries, rebuild, open/cut/merge/print, and compare APK size.

---

## Optional cleanup

- [ ] Replace "Still On Progress" in `src/app/(tabs)/about.tsx` with a real one-line About text, or hide the tab.
- [ ] Delete the empty tracked files `.gitconfig` and `.zprofile`.

---

## Done when

- [x] Issues 1-5, 7, 8, 10, 11 are checked off.
- [x] `npm test` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npx expo lint --no-cache` passes.
- [x] Manual Android check passes: pick folder, cut, merge, reopen from Recents, Find (`Muhammad` → 1/1, edit query → counter clears, Enter on no-match → 0/0).

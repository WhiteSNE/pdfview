# Reminder — PDFView repo state

Last updated: 2026-11-21. This is a note-to-self for resuming later.

## Current state

- Repo: `https://github.com/WhiteSNE/pdfview.git`
- Working branch: `main` (Complete edition), clean and pushed (`c5df162`).
- `reader-only` branch also clean and pushed (`97f4a7f`).
- Both branches have:
  - `README.md` — edition-specific overview and quick start.
  - `RELEASE_NOTES.md` — what is in the early build.
  - `docs/USER_GUIDE.md` — full step-by-step user docs.
- GitHub Releases (prereleases, with APK + `.sha256` attached):
  - `reader-v1.0.0` → `pdfview-reader-1.0.0-debug.apk`
  - `complete-v1.0.0` → `pdfview-complete-1.0.0-debug.apk`
- Local APK copies + checksums live in `releases/` (gitignored on both branches).

## Open items / things to decide

1. **APK size (~74 MB reader, ~79 MB complete).** Explained in chat, no changes made. Root causes:
   - These are debug (unminified) dev-client builds — DEX alone ~54 MB.
   - Unused deps still bundled: `expo-font`, `expo-glass-effect`, `expo-symbols`, `expo-status-bar`, `expo-linking`, `expo-constants`, `@expo/ui`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`.
   - Native libs 41 MB (armeabi-v7a only already); `libreanimated`+`libworklets` 7.7 MB unused, `libbarhopper` 3.1 MB transitive, `libpdfium` 3 MB needed.
   - Options if revisited: minified release APK (smaller but loses dev-client), prune unused deps (careful, rebuild + smoke test). User chose "just explain, don't change".
2. **Reader-only remote history still contains the APK blobs** from intermediate commit `47b18d9` (~150 MB). Latest commit removes them from the tree, but history is not rewritten. Force-push rewrite only if desired.
3. **Find has no on-page yellow highlights** — by decision, navigation is via counter + snippet + page jump. True highlights need a native bounding-box module + overlay (large effort).
4. **Password-protected PDFs** have limited handling; not deeply tested.
5. **About tab** still shows "Still On Progress" on both branches.
6. `gh` CLI is not installed; GitHub Releases were managed via the REST API using the token in git credentials.

## Useful commands

```bash
npx tsc --noEmit
npx expo lint --no-cache      # plain `expo lint` can use a stale cache
npm test
npx expo run:android --device R9RN6067A1P   # device serial may change
```

Switch editions: `git checkout main` (Complete) / `git checkout reader-only` (Reader).
Remember: switching branches changes `node_modules` requirements — run `npm install` after switching if lint/tsc report unresolved modules.

# Reminder — PDFView repo state

Last updated: 2026-11-26. This is a note-to-self for resuming later.

## Current state

- Repo: `https://github.com/WhiteSNE/pdfview.git`
- Working branch: `main` (Complete edition).
- `reader-only` branch is separate; switch with `git checkout reader-only` (run `npm install` after).
- Backup of the pre-prod working tree: `backup/main-preprod-20261126` (tag `backup-main-preprod-20261126`).
- Both branches have README, RELEASE_NOTES and `docs/USER_GUIDE.md`.
- GitHub prereleases (with APK + `.sha256`) are tagged `reader-v1.0.0` and `complete-v1.0.0`.

## Prod-readiness changes (2026-11-26)

- Android now builds only `armeabi-v7a,arm64-v8a` (emulator x86 ABIs dropped) via `expo-build-properties` in `app.json`, so the setting survives EAS prebuild.
- Release builds enable R8 minify + resource shrinking; unused GIF/WebP decoders disabled.
- `eas.json`: `production` builds an AAB (`:app:bundleRelease`), `preview` builds an installable APK, `requireCommit: true`.
- About tab no longer says "Still On Progress".
- Old `issue.md` audit scratch file removed (kept in the backup branch).

## Remaining open items

1. **Build and sign with EAS** — no local release keystore and no EAS credentials in this environment. Run `npx eas-cli build --platform android --profile production` while logged in. Google Play generated APKs are typically ~35-50 MB per device; the universal debug APK (~130 MB) is not the store download size.
2. **Find has no on-page yellow highlights** — by decision, navigation is via counter + snippet + page jump. True highlights need a native bounding-box module + overlay.
3. **Password-protected PDFs** have limited handling; not deeply tested.
4. `gh` CLI is not installed; GitHub Releases were managed via the REST API using the token in git credentials.
5. **Unused direct deps** (`@expo/ui`, `expo-font`, `expo-glass-effect`, `expo-linking`, `expo-symbols`, `expo-status-bar`, `react-native-blob-util`, gesture-handler, reanimated, worklets) are still installed; the user previously chose to keep them. Removing them requires a native rebuild + full device smoke test.

## Useful commands

```bash
npm test
npx tsc --noEmit
npx expo lint --no-cache      # plain `expo lint` can use a stale cache
npx expo config --type public # validates app.json plugins
npx eas-cli build --platform android --profile production
npx expo run:android --device R9RN6067A1P   # device serial may change
```

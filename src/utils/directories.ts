import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { safDisplayName } from "./saf-name";

export const APP_DIRECTORIES = {
  output: new Directory(Paths.document, "outputs"),
};

const RECENTS_FILE = new File(Paths.document, "recent-documents.json");
const OPENED_DOCUMENTS_DIR = new Directory(Paths.document, "opened");
const GENERATED_DOCUMENTS_DIR = new Directory(Paths.document, "generated");
const OUTPUT_DIRECTORY_FILE = new File(Paths.document, "output-directory.json");
const MAX_RECENT_DOCUMENTS = 20;
const OUTPUT_DIRECTORY_NAME = "PDFView";

export type RecentDocument = {
  name: string;
  uri: string;
  openedAt: number;
  source: "opened" | "created";
};

export function ensureAppDirectories() {
  if (Platform.OS !== "android" && !APP_DIRECTORIES.output.exists) {
    APP_DIRECTORIES.output.create();
  }
}

export async function getOutputDirectory(): Promise<Directory | null> {
  if (Platform.OS !== "android") {
    return APP_DIRECTORIES.output;
  }

  if (!OUTPUT_DIRECTORY_FILE.exists) {
    return null;
  }

  try {
    const { uri } = JSON.parse(await OUTPUT_DIRECTORY_FILE.text()) as {
      uri?: unknown;
    };
    if (typeof uri !== "string") {
      return null;
    }
    const outputDirectory = new Directory(uri);
    // SAF tree URIs are content://, not filesystem paths, so .exists is always
    // false for them — the persisted URI permission is the proof of access.
    return uri.startsWith("content://") || outputDirectory.exists
      ? outputDirectory
      : null;
  } catch {
    // The saved URI is stale or unreadable; ask the user to pick again.
    return null;
  }
}

export async function pickOutputDirectory(): Promise<Directory | null> {
  let baseDirectory: Directory;
  try {
    baseDirectory = await Directory.pickDirectoryAsync();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "The file picker was cancelled by the user"
    ) {
      return null;
    }
    throw error;
  }

  // SAF children put the display name inside the URI, so .name (basename of the
  // whole doc ID) never matches; read the decoded last segment instead. Reuse an
  // existing PDFView folder so a re-pick does not nest PDFView/PDFView.
  const outputDirectory =
    baseDirectory
      .list()
      .find(
        (item): item is Directory =>
          item instanceof Directory &&
          safDisplayName(item.uri) === OUTPUT_DIRECTORY_NAME,
      ) ?? baseDirectory.createDirectory(OUTPUT_DIRECTORY_NAME);

  // Some SAF providers hand back a tree URI that cannot be written to. Verify
  // before persisting it, otherwise every launch would restore a dead folder.
  const probe = outputDirectory.createFile(".pdfview-probe", "text/plain");
  await probe.write("");
  probe.delete();

  if (!OUTPUT_DIRECTORY_FILE.exists) {
    OUTPUT_DIRECTORY_FILE.create();
  }
  await OUTPUT_DIRECTORY_FILE.write(
    JSON.stringify({ uri: outputDirectory.uri }),
  );

  return outputDirectory;
}

export async function writeOutputPdf(
  directory: Directory,
  name: string,
  bytes: Uint8Array,
) {
  // A picked SAF directory is a content:// URI: .exists is always false and
  // create() is unsupported for it, so only create real filesystem directories.
  if (!directory.uri.startsWith("content://") && !directory.exists) {
    directory.create();
  }

  // Keep a typed name inside the chosen folder (no ../ path escapes).
  const safeName = name.replace(/[/\\]/g, "_");
  // SAF cannot find an existing child by name (.name is a document ID), so let
  // Android create a new file; it auto-suffixes duplicates instead of overwriting.
  const existingFile = directory.uri.startsWith("content://")
    ? null
    : directory
        .list()
        .find((item): item is File => item instanceof File && item.name === safeName);

  // Write to a temp file first so a failed write leaves the existing PDF intact.
  const temp = directory.createFile(`.${safeName}.${Date.now()}.tmp`, "application/pdf");
  try {
    await temp.write(bytes);
    const output = existingFile ?? directory.createFile(safeName, "application/pdf");
    await temp.copy(output, { overwrite: true });
    return output;
  } finally {
    temp.delete();
  }
}

// react-native-pdf cannot open SAF tree URIs (content://...), so keep a local
// copy of generated PDFs and store that file:// URI for the viewer/recents.
export async function saveViewerCopy(name: string, bytes: Uint8Array) {
  if (!GENERATED_DOCUMENTS_DIR.exists) {
    GENERATED_DOCUMENTS_DIR.create({ idempotent: true, intermediates: true });
  }
  const safeName = name.replace(/[/\\]/g, "_");
  const local = new File(GENERATED_DOCUMENTS_DIR, safeName);
  const temp = new File(GENERATED_DOCUMENTS_DIR, `.${safeName}.${Date.now()}.tmp`);
  try {
    await temp.write(bytes);
    await temp.copy(local, { overwrite: true });
  } finally {
    temp.delete();
  }
  return local.uri;
}

export async function pickPdfFile() {
  return DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
  });
}

export async function pickSinglePdfFile() {
  const result = await pickPdfFile();
  return result.canceled ? null : result.assets[0];
}

export async function pickMultiplePdfFiles() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
    multiple: true,
  });
  return result.canceled ? [] : result.assets;
}

export async function getRecentDocuments(): Promise<RecentDocument[]> {
  if (!RECENTS_FILE.exists) {
    return [];
  }

  try {
    const documents = JSON.parse(await RECENTS_FILE.text()) as RecentDocument[];
    return Array.isArray(documents) ? documents : [];
  } catch {
    return [];
  }
}

// Serialize writes so two flows cannot overwrite each other's changes.
let recentsQueue: Promise<unknown> = Promise.resolve();

function withRecentsLock<T>(work: () => Promise<T>): Promise<T> {
  const result = recentsQueue.then(work, work);
  recentsQueue = result.catch(() => undefined);
  return result;
}

async function writeRecents(documents: RecentDocument[]) {
  const temp = new File(Paths.document, "recent-documents.tmp");
  await temp.write(JSON.stringify(documents));
  await temp.copy(RECENTS_FILE, { overwrite: true });
  temp.delete();
}

export function saveRecentDocument(
  document: Omit<RecentDocument, "openedAt">,
): Promise<void> {
  return withRecentsLock(async () => {
    const documents = await getRecentDocuments();
    const next = [
      { ...document, openedAt: Date.now() },
      ...documents.filter(({ uri }) => uri !== document.uri),
    ].slice(0, MAX_RECENT_DOCUMENTS);
    await writeRecents(next);
  });
}

export function removeRecentDocuments(uris: string[]): Promise<void> {
  return withRecentsLock(async () => {
    if (!RECENTS_FILE.exists || uris.length === 0) {
      return;
    }
    const removedUris = new Set(uris);
    const documents = await getRecentDocuments();
    const remaining = documents.filter(({ uri }) => !removedUris.has(uri));
    await writeRecents(remaining);
  });
}

export async function pickAndSavePdf() {
  const result = await pickPdfFile();
  if (result.canceled) {
    return result;
  }
  const document = result.assets[0];
  if (!OPENED_DOCUMENTS_DIR.exists) {
    OPENED_DOCUMENTS_DIR.create({ idempotent: true, intermediates: true });
  }
  // Cache files can be evicted, so keep a stable copy in app-owned storage.
  const saved = new File(OPENED_DOCUMENTS_DIR, document.name.replace(/[/\\]/g, "_"));
  await new File(document.uri).copy(saved, { overwrite: true });
  await saveRecentDocument({
    name: document.name,
    uri: saved.uri,
    source: "opened",
  });
  return {
    ...result,
    assets: [{ ...document, uri: saved.uri }],
  };
}

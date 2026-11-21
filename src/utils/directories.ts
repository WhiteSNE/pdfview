import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";

const RECENTS_FILE = new File(Paths.document, "recent-documents.json");
const OPENED_DOCUMENTS_DIR = new Directory(Paths.document, "opened");
const MAX_RECENT_DOCUMENTS = 20;

export type RecentDocument = {
  name: string;
  uri: string;
  openedAt: number;
  source: "opened";
};

async function pickPdfFile() {
  return DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
  });
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
  if (RECENTS_FILE.exists) {
    RECENTS_FILE.delete();
  }
  temp.rename("recent-documents.json");
}

function saveRecentDocument(
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

export async function removeRecentDocuments(uris: string[]): Promise<void> {
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
  const saved = new File(OPENED_DOCUMENTS_DIR, document.name);
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

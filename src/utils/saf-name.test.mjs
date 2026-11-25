import assert from "node:assert/strict";
import test from "node:test";
import { safDisplayName } from "./saf-name.ts";

test("reads the display name from encoded SAF document URIs", () => {
  assert.equal(
    safDisplayName(
      "content://com.android.providers.downloads.documents/tree/msd%3A3442/document/msd%3A3442%2FDownload%2FPDFView",
    ),
    "PDFView",
  );
  assert.equal(
    safDisplayName(
      "content://com.android.externalstorage.documents/tree/primary%3ADownload/document/primary%3ADownload%2FPDFView",
    ),
    "PDFView",
  );
  assert.equal(
    safDisplayName(
      "content://com.android.providers.downloads.documents/tree/msd%3A3442/document/raw%3A%2Fstorage%2Femulated%2F0%2FDownload%2FPDFView%2F",
    ),
    "PDFView",
  );
});

test("handles plain file URIs and malformed escapes", () => {
  assert.equal(safDisplayName("file:///data/user/0/app/files/PDFView"), "PDFView");
  assert.equal(safDisplayName("content://x/document/bad%2"), "bad%2");
});

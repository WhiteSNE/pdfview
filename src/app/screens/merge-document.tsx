import ScreenHeader from "@/components/screenHeader";
import { useTheme } from "@/hooks/use-theme";
import {
    getOutputDirectory,
    pickMultiplePdfFiles,
    saveRecentDocument,
    saveViewerCopy,
    writeOutputPdf,
} from "@/utils/directories";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function MergeDocumentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [files, setFiles] = useState<{ name: string; uri: string }[]>([]);
  const [filenameInput, setFilenameInput] = useState("");
  const [busy, setBusy] = useState(false);

  const addFiles = async () => {
    const selected = await pickMultiplePdfFiles();
    if (!selected.length) return;

    setFiles((current) => {
      const next = [...current];
      for (const item of selected) {
        if (!next.some((f) => f.name === item.name)) {
          next.push({ name: item.name, uri: item.uri });
        }
      }
      return next;
    });

    if (!filenameInput && selected.length > 0) {
      const baseName = selected[0].name.replace(/\.pdf$/i, "");
      setFilenameInput(`${baseName}-merged`);
    }
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    setFiles((current) => {
      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const mergePdfs = async () => {
    if (busy) return;
    if (files.length < 2) {
      Alert.alert("Select at least 2 PDF files to merge.");
      return;
    }

    const rawName = filenameInput.trim().replace(/\.pdf$/i, "");
    const baseName = files[0].name.replace(/\.pdf$/i, "");
    const outputName = `${rawName || `${baseName}-merged`}.pdf`;

    setBusy(true);
    try {
      const outputDir = await getOutputDirectory();
      if (!outputDir) {
        Alert.alert("Choose an output folder", "PDFView needs a folder to save your file.");
        router.replace("/");
        return;
      }

      const outputPdf = await PDFDocument.create();

      for (const file of files) {
        const sourceBytes = await new File(file.uri).bytes();
        const sourcePdf = await PDFDocument.load(sourceBytes, {
          ignoreEncryption: true,
        });
        const indices = sourcePdf.getPageIndices();
        const pages = await outputPdf.copyPages(sourcePdf, indices);
        pages.forEach((page) => outputPdf.addPage(page));
      }

      const bytes = await outputPdf.save();
      await writeOutputPdf(outputDir, outputName, bytes);
      const viewerUri = await saveViewerCopy(outputName, bytes);

      await saveRecentDocument({
        name: outputName,
        uri: viewerUri,
        source: "created",
      });
      router.replace("/");
    } catch {
      Alert.alert("Could not merge selected PDFs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Merge Document" />

      <View style={styles.content}>
        <View style={styles.toolbar}>
          <Button
            color={theme.accent}
            title="Add PDF Files"
            onPress={() => void addFiles()}
          />
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {files.length} {files.length === 1 ? "file" : "files"} selected
          </Text>
        </View>

        {files.length > 0 && (
          <View style={styles.inputRow}>
            <TextInput
              onChangeText={setFilenameInput}
              placeholder="Output filename"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              value={filenameInput}
            />
          </View>
        )}

        <FlatList
          contentContainerStyle={styles.list}
          data={files}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              No files added yet. Tap &quot;Add PDF Files&quot; to choose PDFs
              to merge.
            </Text>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.fileItem,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.fileName, { color: theme.text }]}
              >
                {index + 1}. {item.name}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  disabled={index === 0}
                  onPress={() => moveFile(index, "up")}
                  style={styles.actionButton}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: index === 0 ? theme.textSecondary : theme.accent,
                      },
                    ]}
                  >
                    ▲
                  </Text>
                </Pressable>
                <Pressable
                  disabled={index === files.length - 1}
                  onPress={() => moveFile(index, "down")}
                  style={styles.actionButton}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color:
                          index === files.length - 1
                            ? theme.textSecondary
                            : theme.accent,
                      },
                    ]}
                  >
                    ▼
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => removeFile(index)}
                  style={styles.actionButton}
                >
                  <Text style={[styles.actionText, { color: theme.accent }]}>
                    ✕
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.saveRow}>
        <Button
          color={theme.accent}
          disabled={busy || files.length < 2}
          title={busy ? "Merging..." : "Merge PDFs"}
          onPress={() => void mergePdfs()}
        />
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={busy}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingBackdrop}>
          <View
            style={[
              styles.loadingBox,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ActivityIndicator color={theme.accent} size="large" />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Merging PDFs...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 16 },
  content: { flex: 1, gap: 12 },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  countText: { flex: 1, textAlign: "right" },
  inputRow: { paddingHorizontal: 16 },
  input: {
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  list: { paddingHorizontal: 16, gap: 8 },
  empty: { marginTop: 40, textAlign: "center" },
  fileItem: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  fileName: { flex: 1, fontSize: 14, fontWeight: "500", marginRight: 8 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: { paddingHorizontal: 6, paddingVertical: 2 },
  actionText: { fontSize: 16, fontWeight: "600" },
  saveRow: { paddingHorizontal: 16, paddingTop: 12 },
  loadingBackdrop: {
    alignItems: "center",
    backgroundColor: "#0006",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  loadingBox: {
    alignItems: "center",
    borderRadius: 12,
    gap: 16,
    padding: 24,
    width: 200,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

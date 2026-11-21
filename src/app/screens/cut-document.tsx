import ScreenHeader from "@/components/screenHeader";
import { useTheme } from "@/hooks/use-theme";
import {
    getOutputDirectory,
    pickSinglePdfFile,
    saveRecentDocument,
    saveViewerCopy,
    writeOutputPdf,
} from "@/utils/directories";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import { expandPageRanges } from "@/utils/pages";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Pdf from "react-native-pdf";

export default function CutDocumentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [file, setFile] = useState<{ name: string; uri: string } | null>(null);
  const [filenameInput, setFilenameInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [pagesInput, setPagesInput] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const selectPdf = async () => {
    const selected = await pickSinglePdfFile();
    if (selected) {
      setFile(selected);
      const baseName = selected.name.replace(/\.pdf$/i, "");
      setFilenameInput(`${baseName}-cut`);
    }
  };

  const cutPdf = async () => {
    if (busy) return;
    if (!file) {
      Alert.alert("Select a PDF first.");
      return;
    }
    const selectedPages = expandPageRanges(pagesInput, pageCount);
    if (!selectedPages.length) {
      Alert.alert("Enter pages like 1-5 or 1, 2, 3.");
      return;
    }

    const rawName = filenameInput.trim().replace(/\.pdf$/i, "");
    const baseName = file.name.replace(/\.pdf$/i, "");
    const outputName = `${rawName || `${baseName}-cut`}.pdf`;

    setBusy(true);
    try {
      const outputDirectory = await getOutputDirectory();
      if (!outputDirectory) {
        Alert.alert("Choose an output folder", "PDFView needs a folder to save your file.");
        router.replace("/");
        return;
      }

      const source = await new File(file.uri).bytes();
      const sourcePdf = await PDFDocument.load(source, {
        ignoreEncryption: true,
      });
      const outputPdf = await PDFDocument.create();
      const copiedPages = await outputPdf.copyPages(
        sourcePdf,
        selectedPages.map((page) => page - 1),
      );
      copiedPages.forEach((page) => outputPdf.addPage(page));
      const bytes = await outputPdf.save();
      await writeOutputPdf(outputDirectory, outputName, bytes);
      const viewerUri = await saveViewerCopy(outputName, bytes);
      await saveRecentDocument({
        name: outputName,
        uri: viewerUri,
        source: "created",
      });
      router.replace("/");
    } catch {
      Alert.alert("Could not cut this PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Cut PDF pages" />
      <View style={styles.toolbar}>
        <Button
          color={theme.accent}
          title={file ? "Change PDF" : "Choose PDF"}
          onPress={() => void selectPdf()}
        />
        <Text style={[styles.pageLabel, { color: theme.textSecondary }]}>
          Page {currentPage}
        </Text>
      </View>
      {file && (
        <View style={styles.inputRow}>
          <TextInput
            onChangeText={setFilenameInput}
            placeholder="Output filename"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="next"
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            value={filenameInput}
          />
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setPagesInput}
          onSubmitEditing={() => void cutPdf()}
          placeholder="1-5 for range or 1,2,3 for specific pages"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="done"
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={pagesInput}
        />
      </View>
      <View style={[styles.preview, { borderColor: theme.border }]}>
        {file ? (
          <Pdf
            source={{ uri: file.uri, cache: true }}
            style={styles.pdf}
            onPageChanged={(page, total) => {
              setCurrentPage(page);
              setPageCount(total);
            }}
          />
        ) : (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            Choose a PDF to preview its pages.
          </Text>
        )}
      </View>
      <View style={styles.saveRow}>
        <Button
          color={theme.accent}
          disabled={busy}
          title={busy ? "Cutting..." : "Save selected pages"}
          onPress={() => void cutPdf()}
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
              Cutting PDF...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, paddingBottom: 16 },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  pageLabel: { flex: 1, textAlign: "right" },
  preview: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pdf: { flex: 1, width: "100%" },
  empty: { marginTop: 40, textAlign: "center" },
  saveRow: { paddingHorizontal: 16 },
  inputRow: { paddingHorizontal: 16 },
  input: {
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
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

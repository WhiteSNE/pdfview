import { useTheme } from "@/hooks/use-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Print from "expo-print";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import type { PdfRef } from "react-native-pdf";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PdfViewerScreen() {
  const { name, uri } = useLocalSearchParams<{ name: string; uri: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gotoOpen, setGotoOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const pdf = useRef<PdfRef>(null);
  const [titleWidth, setTitleWidth] = useState(0);
  const [titleClipWidth, setTitleClipWidth] = useState(0);
  const [titleOffset] = useState(() => new Animated.Value(0));
  const title = name ?? "PDF document";
  const scrollDistance = Math.max(0, titleWidth - titleClipWidth);

  const goToPage = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= pageCount) {
      pdf.current?.setPage(nextPage);
      setMenuOpen(false);
      setGotoOpen(false);
      setPageInput("");
    }
  };

  useEffect(() => {
    titleOffset.setValue(0);
    if (!scrollDistance) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(titleOffset, {
          toValue: -scrollDistance,
          duration: Math.max(2500, scrollDistance * 25),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(titleOffset, {
          toValue: 0,
          duration: Math.max(2500, scrollDistance * 25),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return animation.stop;
  }, [scrollDistance, titleOffset]);

  if (!uri) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>PDF file missing.</Text>
      </View>
    );
  }

  // react-native-pdf crashes on SAF tree URIs; older recents entries still use
  // one, so fail gracefully instead of taking down the app.
  if (uri.startsWith("content://")) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>
          This file can no longer be opened. Please create it again.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
          <Text style={[styles.back, { color: theme.accent }]}>‹</Text>
        </Pressable>
        <View
          onLayout={({ nativeEvent }) => setTitleClipWidth(nativeEvent.layout.width)}
          style={styles.titleClip}
        >
          <Text
            onLayout={({ nativeEvent }) => setTitleWidth(nativeEvent.layout.width)}
            style={[styles.titleMeasure, { color: theme.text }]}
          >
            {title}
          </Text>
          <Animated.Text
            style={[styles.title, { color: theme.text, transform: [{ translateX: titleOffset }] }]}
          >
            {title}
          </Animated.Text>
        </View>
      </View>
      {pageCount > 0 && (
        <View style={[styles.pageBar, { borderColor: theme.border }]}>
          <Pressable disabled={page === 1} onPress={() => goToPage(page - 1)}>
            <Text style={[styles.pageButton, { color: page === 1 ? theme.textSecondary : theme.accent }]}>‹ Previous</Text>
          </Pressable>
          <Text style={[styles.pageIndicator, { color: theme.text }]}>{page} / {pageCount}</Text>
          <Pressable disabled={page === pageCount} onPress={() => goToPage(page + 1)}>
            <Text style={[styles.pageButton, { color: page === pageCount ? theme.textSecondary : theme.accent }]}>Next ›</Text>
          </Pressable>
        </View>
      )}
      <Pdf
        ref={pdf}
        source={{ uri, cache: true }}
        style={styles.pdf}
        renderActivityIndicator={() => <ActivityIndicator size="large" />}
        onLoadComplete={(numberOfPages) => setPageCount(numberOfPages)}
        onPageChanged={(currentPage, numberOfPages) => {
          setPage(currentPage);
          setPageCount(numberOfPages);
        }}
      />
      <Pressable
        accessibilityLabel="Document options"
        onPress={() => setMenuOpen(true)}
        style={[styles.fab, { backgroundColor: theme.accent, bottom: insets.bottom + 24 }]}
      >
        <Text style={[styles.fabText, { color: theme.background }]}>⋮</Text>
      </Pressable>
      <Modal animationType="fade" transparent visible={menuOpen} onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 24 }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setPageInput(String(page));
                setGotoOpen(true);
              }}
            >
              <Text style={{ color: theme.text }}>Go to page</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => void Print.printAsync({ uri })}>
              <Text style={{ color: theme.text }}>Print</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <Modal animationType="fade" transparent visible={gotoOpen} onRequestClose={() => setGotoOpen(false)}>
        <View style={styles.dialogBackdrop}>
          <View style={[styles.dialog, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>Go to page</Text>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              maxLength={String(pageCount).length}
              onChangeText={setPageInput}
              onSubmitEditing={() => goToPage(Number(pageInput))}
              placeholder={`e.g. ${pageCount}`}
              placeholderTextColor={theme.textSecondary}
              returnKeyType="go"
              style={[styles.pageInput, { borderColor: theme.accent, color: theme.text }]}
              value={pageInput}
            />
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setGotoOpen(false)} style={styles.dialogButton}>
                <Text style={{ color: theme.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => goToPage(Number(pageInput))} style={styles.dialogButton}>
                <Text style={[styles.goText, { color: theme.accent }]}>Go</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", flexDirection: "row", height: 56, paddingHorizontal: 16 },
  back: { fontSize: 40, lineHeight: 40, paddingRight: 16 },
  titleClip: { flex: 1, overflow: "hidden" },
  title: { alignSelf: "flex-start", fontSize: 16, fontWeight: "600" },
  titleMeasure: { fontSize: 16, fontWeight: "600", opacity: 0, position: "absolute" },
  pageIndicator: { fontVariant: ["tabular-nums"], marginLeft: 12, textAlign: "center" },
  pageBar: { alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  pageButton: { fontWeight: "600" },
  backdrop: { backgroundColor: "#0006", flex: 1, justifyContent: "flex-end" },
  menu: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  menuItem: { paddingHorizontal: 24, paddingVertical: 18 },
  dialogBackdrop: { alignItems: "center", backgroundColor: "#0006", flex: 1, justifyContent: "center", padding: 24 },
  dialog: { borderRadius: 16, maxHeight: "70%", padding: 20, width: "100%" },
  dialogTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  pageInput: { borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, fontSize: 18, padding: 12 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  dialogButton: { paddingHorizontal: 14, paddingVertical: 10 },
  goText: { fontWeight: "700" },
  fab: { alignItems: "center", borderRadius: 32, elevation: 6, height: 64, justifyContent: "center", position: "absolute", right: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, width: 64 },
  fabText: { fontSize: 30, lineHeight: 30 },
  pdf: { flex: 1, width: "100%" },
});

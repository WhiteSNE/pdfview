import NewButton from "@/components/newButton";
import { useTheme } from "@/hooks/use-theme";
import {
  getRecentDocuments,
  pickAndSavePdf,
  RecentDocument,
  removeRecentDocuments,
} from "@/utils/directories";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUris, setSelectedUris] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);

  const loadDocuments = useCallback(async () => {
    setDocuments(await getRecentDocuments());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDocuments();
    }, [loadDocuments]),
  );

  const openDocument = async () => {
    const result = await pickAndSavePdf();
    if (!result.canceled) {
      await loadDocuments();
      router.push({
        pathname: "/screens/pdf-viewer",
        params: { name: result.assets[0].name, uri: result.assets[0].uri },
      });
    }
  };

  const previewDocument = async (document: RecentDocument) => {
    router.push({
      pathname: "/screens/pdf-viewer",
      params: { name: document.name, uri: document.uri },
    });
  };

  const toggleSelection = (uri: string) => {
    setSelectedUris((current) =>
      current.includes(uri)
        ? current.filter((selectedUri) => selectedUri !== uri)
        : [...current, uri],
    );
  };

  const removeSelectedDocuments = async () => {
    if (removing || selectedUris.length === 0) return;

    setRemoving(true);
    try {
      await removeRecentDocuments(selectedUris);
      const removedUris = new Set(selectedUris);
      setDocuments((current) =>
        current.filter(({ uri }) => !removedUris.has(uri)),
      );
      setSelectedUris([]);
    } catch {
      Alert.alert("Could not remove selected documents from recents.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Recent documents
        </Text>
        {selectedUris.length > 0 && (
          <View style={[styles.selectionBar, { borderColor: theme.border }]}>
            <Text
              style={[styles.selectionCount, { color: theme.textSecondary }]}
            >
              {selectedUris.length} selected
            </Text>
            <Pressable disabled={removing} onPress={() => setSelectedUris([])}>
              <Text
                style={[styles.selectionAction, { color: theme.textSecondary }]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              disabled={removing}
              onPress={() => void removeSelectedDocuments()}
            >
              <Text style={[styles.selectionAction, { color: theme.accent }]}>
                {removing ? "Removing..." : `Remove (${selectedUris.length})`}
              </Text>
            </Pressable>
          </View>
        )}
        <FlatList
          contentContainerStyle={styles.list}
          data={documents}
          keyExtractor={({ uri }) => uri}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {loading ? "Loading documents..." : "No recent documents"}
            </Text>
          }
          renderItem={({ item }) => {
            const selected = selectedUris.includes(item.uri);
            const selectionMode = selectedUris.length > 0;

            return (
              <Pressable
                delayLongPress={500}
                onLongPress={() =>
                  setSelectedUris((current) =>
                    current.includes(item.uri)
                      ? current
                      : [...current, item.uri],
                  )
                }
                onPress={() => {
                  if (selectionMode) {
                    toggleSelection(item.uri);
                  } else {
                    void previewDocument(item);
                  }
                }}
                style={[
                  styles.document,
                  {
                    backgroundColor: selected
                      ? theme.backgroundSelected
                      : "transparent",
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}
              >
                <View style={styles.documentContent}>
                  <Text
                    numberOfLines={1}
                    style={[styles.documentName, { color: theme.text }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.documentMeta,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Opened · {new Date(item.openedAt).toLocaleDateString()}
                  </Text>
                </View>
                {selectionMode && (
                  <View
                    style={[
                      styles.selectionIndicator,
                      { borderColor: selected ? theme.accent : theme.border },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.selectionIndicatorFill,
                          { backgroundColor: theme.accent },
                        ]}
                      />
                    )}
                  </View>
                )}
              </Pressable>
            );
          }}
        />

        <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
          <NewButton label="+" onPress={() => void openDocument()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  selectionBar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 16,
    paddingBottom: 10,
  },
  selectionCount: { flex: 1, fontSize: 14 },
  selectionAction: { fontSize: 14, fontWeight: "600", paddingVertical: 6 },
  list: { flexGrow: 1 },
  empty: { textAlign: "center", marginTop: 32 },
  document: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  documentContent: { flex: 1 },
  documentName: { fontSize: 16, fontWeight: "600" },
  documentMeta: { marginTop: 4 },
  selectionIndicator: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: "center",
    marginLeft: 12,
    width: 20,
  },
  selectionIndicatorFill: { borderRadius: 5, height: 10, width: 10 },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
});

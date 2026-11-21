import { useTheme } from "@/hooks/use-theme";
import {
  ensureAppDirectories,
  getOutputDirectory,
  pickOutputDirectory,
} from "@/utils/directories";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    AppState,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function RootLayout() {
  const theme = useTheme();
  const [accessGranted, setAccessGranted] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(true);
  const [accessError, setAccessError] = useState(false);
  const pickingRef = useRef(false);

  const checkStorageAccess = useCallback(async () => {
    ensureAppDirectories();
    const outputDirectory = await getOutputDirectory();
    return outputDirectory !== null;
  }, []);

  const chooseOutputDirectory = async () => {
    pickingRef.current = true;
    setRequestingAccess(true);
    setAccessError(false);
    try {
      const directory = await pickOutputDirectory();
      setAccessGranted(directory !== null);
    } catch {
      setAccessGranted(false);
      setAccessError(true);
    } finally {
      pickingRef.current = false;
      setRequestingAccess(false);
    }
  };

  useEffect(() => {
    let active = true;
    void checkStorageAccess()
      .then((granted) => {
        if (active) {
          setAccessGranted(granted);
        }
      })
      .catch(() => {
        if (active) {
          setAccessGranted(false);
          setAccessError(true);
        }
      })
      .finally(() => {
        if (active) {
          setRequestingAccess(false);
        }
      });

    const subscription = AppState.addEventListener("change", (state) => {
      // The picker itself fires "active" on close — let its own result win.
      if (state === "active" && !pickingRef.current) {
        void checkStorageAccess().then((granted) => {
          if (active && !pickingRef.current) {
            setAccessGranted(granted);
          }
        });
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [checkStorageAccess]);

  if (!accessGranted) {
    return (
      <View
        style={[styles.permissionScreen, { backgroundColor: theme.background }]}
      >
        {requestingAccess ? (
          <>
            <ActivityIndicator color={theme.accent} size="large" />
            <Text
              style={[styles.permissionText, { color: theme.textSecondary }]}
            >
              Checking storage access...
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.permissionTitle, { color: theme.text }]}>
              Choose an output folder
            </Text>
            <Text
              style={[styles.permissionText, { color: theme.textSecondary }]}
            >
              {accessError
                ? "Could not open the folder picker. Please try again."
                : "Pick a folder where PDFView will save your files."}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={requestingAccess}
              onPress={() => void chooseOutputDirectory()}
              style={[
                styles.permissionButton,
                { backgroundColor: theme.accent },
              ]}
            >
              <Text
                style={[
                  styles.permissionButtonText,
                  { color: theme.backgroundElement },
                ]}
              >
                Choose folder
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  permissionScreen: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  permissionText: { fontSize: 15, textAlign: "center" },
  permissionButton: {
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionButtonText: { fontSize: 15, fontWeight: "600" },
});

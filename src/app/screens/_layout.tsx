import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Global safe area for every screen under /screens: keeps headers below the
// status bar and buttons above the gesture/navigation bar.
export default function ScreensLayout() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background }, headerShown: false }} />
    </SafeAreaView>
  );
}

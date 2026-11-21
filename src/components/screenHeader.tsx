import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
        <Text style={[styles.back, { color: theme.accent }]}>‹</Text>
      </Pressable>
      <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", height: 56, paddingHorizontal: 16 },
  back: { fontSize: 40, lineHeight: 40, paddingRight: 16 },
  title: { flex: 1, fontSize: 16, fontWeight: "600" },
});

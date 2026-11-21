import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export default function NewButton({ label, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel="Add"
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.accent }]}
    >
      <Text style={[styles.label, { color: theme.background }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 32,
    elevation: 6,
    height: 64,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 64,
  },
  label: {
    fontSize: 32,
    lineHeight: 32,
  },
});

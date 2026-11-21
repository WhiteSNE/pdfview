import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";

// Device preference by default; no manual override.
export function useTheme() {
  return Colors[useColorScheme() === "dark" ? "dark" : "light"];
}

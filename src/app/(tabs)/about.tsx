import { useTheme } from "@/hooks/use-theme";
import { Text, View, StyleSheet } from "react-native";

export default function About(){
    const theme = useTheme();
    return (
        <View style={[Styles.container, { backgroundColor: theme.background }]}>
            <Text style={{ color: theme.text }}>Still On Progress</Text>
        </View>
    )
}

const Styles = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

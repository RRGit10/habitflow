import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

type TabPlaceholderProps = {
  description: string;
  title: string;
};

export function TabPlaceholder({ description, title }: TabPlaceholderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFFFFF", flex: 1, padding: 20 },
  card: { backgroundColor: "#E1F9F0", borderRadius: 16, marginTop: 16, padding: 20 },
  title: { color: "#13275A", fontSize: 24, fontWeight: "700" },
  description: { color: "#5070A2", fontSize: 15, lineHeight: 22, marginTop: 8 },
});

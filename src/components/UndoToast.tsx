import { Pressable, StyleSheet, Text, View } from "react-native";

import { useMockHabits } from "../providers/MockHabitProvider";
import { colors, layout } from "../theme/tokens";

export function UndoToast() {
  const { undo, undoLastCheckIn } = useMockHabits();
  if (!undo) return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.toast}>
        <Text numberOfLines={1} style={styles.message}>{undo.text}</Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={undoLastCheckIn}>
          <Text style={styles.undo}>Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: layout.tabContentBottom,
    left: 16,
    position: "absolute",
    right: 16,
    zIndex: 20,
  },
  toast: {
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: 14,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  message: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  undo: {
    color: "#8DF0C1",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 16,
  },
});

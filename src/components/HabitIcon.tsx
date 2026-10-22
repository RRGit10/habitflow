import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { colors } from "../theme/tokens";

type SymbolName = SymbolViewProps["name"];

type HabitIconProps = {
  backgroundColor?: string;
  color?: string;
  name: string;
  size?: number;
};

export function habitIconName(name: string): SymbolName {
  const keyword = name.toLowerCase();
  if (keyword.includes("workout") || keyword.includes("exercise")) return "dumbbell.fill";
  if (keyword.includes("read") || keyword.includes("book")) return "book.fill";
  if (keyword.includes("water") || keyword.includes("drink")) return "drop.fill";
  if (keyword.includes("eat") || keyword.includes("meal") || keyword.includes("healthy")) return "fork.knife";
  if (keyword.includes("sleep") || keyword.includes("rest")) return "moon.fill";
  return "checkmark.circle.fill";
}

export function HabitIcon({ backgroundColor, color = colors.primary, name, size = 22 }: HabitIconProps) {
  const icon = <SymbolView name={habitIconName(name)} size={size} tintColor={color} weight="semibold" />;
  if (!backgroundColor) return icon;

  return <View style={[styles.container, { backgroundColor, height: size + 22, width: size + 22 }]}>{icon}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
  },
});

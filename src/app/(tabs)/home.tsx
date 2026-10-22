import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HabitIcon } from "../../components/HabitIcon";
import { dateLabel, greetingForTime, mockUser, type Habit } from "../../data/mock-data";
import { useMockHabits } from "../../providers/MockHabitProvider";
import { colors, layout } from "../../theme/tokens";

const isWeb = Platform.OS === "web";

const habitIconBackgrounds: Record<Habit["category"], string> = {
  drink: "#E8F4FF",
  eat: "#FFF1E3",
  read: "#EEE9FF",
  sleep: "#EEE9FF",
  workout: colors.primaryLight,
};

function LeafMark({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.leafMark, { height: size, width: size }]}>
      <View
        style={[
          styles.leaf,
          {
            borderBottomLeftRadius: size * 0.42,
            borderTopLeftRadius: size * 0.42,
            borderTopRightRadius: size * 0.42,
            height: size * 0.7,
            left: size * 0.26,
            width: size * 0.53,
          },
        ]}
      />
      <View style={[styles.leafStem, { height: size * 0.4, left: size * 0.22, top: size * 0.53, width: size * 0.1 }]} />
      <View style={[styles.leafVein, { height: size * 0.34, left: size * 0.48, top: size * 0.23, width: size * 0.09 }]} />
    </View>
  );
}

function HabitRow({ habit, onToggle }: { habit: Habit; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: habit.completedToday }}
      onPress={onToggle}
      style={styles.habitRow}
    >
      <HabitIcon backgroundColor={habitIconBackgrounds[habit.category]} name={habit.name} />
      <View style={styles.habitCopy}>
        <Text numberOfLines={1} style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.habitTime}>{habit.reminderTime ?? "No reminder"}</Text>
      </View>
      <View style={[styles.checkCircle, habit.completedToday && styles.checkCircleCompleted]}>
        {habit.completedToday ? <SymbolView name="checkmark" size={15} tintColor="#FFFFFF" weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

function EmptyHabits() {
  return (
    <View style={styles.emptyState}>
      <SymbolView name="checklist" size={30} tintColor={colors.accentBlue} weight="regular" />
      <Text style={styles.emptyTitle}>No habits yet</Text>
      <Text style={styles.emptyBody}>Create your first habit to begin building momentum.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push("/create-habit")} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>Create a habit</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const {
    activeHabits,
    allTodayComplete,
    completedTodayCount,
    longestStreak,
    overallStreak,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    toggleHabitCheckIn,
  } = useMockHabits();
  const now = useMemo(() => new Date(), []);
  const progressLabel = `${completedTodayCount}/${activeHabits.length} done`;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView bounces={false} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <LeafMark />
              <Text style={styles.brandName}>Habit Tracker</Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: pushNotificationsEnabled }}
              onPress={() => setPushNotificationsEnabled(!pushNotificationsEnabled)}
              style={[styles.pushPill, !pushNotificationsEnabled && styles.pushPillOff]}
            >
              <View style={[styles.pushDot, !pushNotificationsEnabled && styles.pushDotOff]} />
              <Text style={[styles.pushText, !pushNotificationsEnabled && styles.pushTextOff]}>
                Push {pushNotificationsEnabled ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <View style={styles.greetingLine}>
              <Text style={styles.greetingTitle}>{greetingForTime(now)}, {mockUser.firstName}</Text>
              <SymbolView name="sun.max.fill" size={22} tintColor={colors.warning} weight="medium" />
            </View>
            <Text style={styles.subtitle}>Small steps every day, big results over time.</Text>
          </View>

          <View style={styles.streakCard}>
            <View style={styles.streakHalf}>
              <SymbolView name="flame.fill" size={22} tintColor={colors.primary} weight="semibold" />
              <View>
                <Text style={styles.streakLabel}>Overall streak</Text>
                <Text style={styles.streakNumber}>{overallStreak} days</Text>
                <Text style={styles.streakHint}>
                  {allTodayComplete ? "All habits complete today" : "Finish today to keep\nit going!"}
                </Text>
              </View>
            </View>
            <View style={styles.streakDivider} />
            <View style={[styles.streakHalf, styles.streakRight]}>
              <SymbolView name="trophy.fill" size={21} tintColor={colors.primary} weight="semibold" />
              <View>
                <Text style={styles.streakLabel}>Longest streak</Text>
                <Text style={styles.streakNumber}>{longestStreak} days</Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="#49A9A6" weight="semibold" />
            </View>
          </View>

          {!pushNotificationsEnabled ? (
            <Pressable accessibilityRole="button" onPress={() => setPushNotificationsEnabled(true)} style={styles.notificationCard}>
              <SymbolView name="bell.fill" size={20} tintColor={colors.warning} weight="medium" />
              <View style={styles.notificationCopy}>
                <Text style={styles.notificationTitle}>Push notifications are off</Text>
                <Text style={styles.notificationBody}>You’ll get habit reminders and updates when{`\n`}you turn them on.</Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="#D28D19" weight="semibold" />
            </Pressable>
          ) : null}

          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today • {dateLabel(now)}</Text>
            <Text style={styles.doneText}>{progressLabel}</Text>
          </View>

          {activeHabits.length ? (
            <View style={styles.habitList}>
              {activeHabits.map((habit) => <HabitRow habit={habit} key={habit.id} onToggle={() => toggleHabitCheckIn(habit.id)} />)}
            </View>
          ) : <EmptyHabits />}
        </ScrollView>

        <Pressable accessibilityLabel="Create a habit" accessibilityRole="button" onPress={() => router.push("/create-habit")} style={styles.fab}>
          <SymbolView name="plus" size={26} tintColor="#FFFFFF" weight="medium" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { alignItems: "center", backgroundColor: colors.background, flex: 1 },
  screen: { backgroundColor: colors.background, flex: 1, maxWidth: isWeb ? 375 : undefined, overflow: "hidden", width: "100%" },
  content: { paddingBottom: layout.floatingActionContentClearance, paddingHorizontal: 16, paddingTop: 15 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  brand: { alignItems: "center", flexDirection: "row", gap: 7 },
  leafMark: { position: "relative" },
  leaf: { backgroundColor: colors.primary, position: "absolute", top: 0, transform: [{ rotate: "-6deg" }] },
  leafStem: { backgroundColor: colors.primary, borderRadius: 4, position: "absolute", transform: [{ rotate: "43deg" }] },
  leafVein: { backgroundColor: "#FFFFFF", borderRadius: 4, position: "absolute", transform: [{ rotate: "43deg" }] },
  brandName: { color: colors.navy, fontSize: 18, fontWeight: "700", letterSpacing: -0.25 },
  pushPill: { alignItems: "center", backgroundColor: "#DCF7EC", borderRadius: 99, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 7 },
  pushPillOff: { backgroundColor: "#F0F4F8" },
  pushDot: { backgroundColor: colors.primary, borderRadius: 5, height: 8, width: 8 },
  pushDotOff: { backgroundColor: "#9AA7B7" },
  pushText: { color: "#168C60", fontSize: 11, fontWeight: "700" },
  pushTextOff: { color: "#65748A" },
  greeting: { marginTop: 20 },
  greetingLine: { alignItems: "center", flexDirection: "row", gap: 5 },
  greetingTitle: { color: "#13275A", fontSize: 24, fontWeight: "700", letterSpacing: -0.45 },
  subtitle: { color: colors.muted, fontSize: 13, fontWeight: "500", marginTop: 3 },
  streakCard: { alignItems: "stretch", backgroundColor: colors.primaryLight, borderRadius: 10, flexDirection: "row", minHeight: 94, marginTop: 16, overflow: "hidden" },
  streakHalf: { alignItems: "flex-start", flex: 1, flexDirection: "row", gap: 9, paddingHorizontal: 12, paddingTop: 13 },
  streakRight: { alignItems: "center", gap: 8, paddingLeft: 13 },
  streakDivider: { backgroundColor: "#C4EFE0", height: "74%", marginTop: 12, width: 1 },
  streakLabel: { color: colors.primary, fontSize: 11, fontWeight: "600" },
  streakNumber: { color: "#123F59", fontSize: 20, fontWeight: "700", letterSpacing: -0.25, marginTop: 2 },
  streakHint: { color: "#477586", fontSize: 10, lineHeight: 12, marginTop: 4 },
  notificationCard: { alignItems: "center", backgroundColor: "#FFF5DC", borderRadius: 9, flexDirection: "row", marginTop: 10, minHeight: 66, paddingHorizontal: 12, gap: 10 },
  notificationCopy: { flex: 1 },
  notificationTitle: { color: "#31466D", fontSize: 13, fontWeight: "700" },
  notificationBody: { color: "#60789C", fontSize: 11, lineHeight: 14, marginTop: 3 },
  todayHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  todayTitle: { color: colors.navy, fontSize: 16, fontWeight: "700" },
  doneText: { color: colors.accentBlue, fontSize: 14, fontWeight: "600" },
  habitList: { gap: 6, marginTop: 8 },
  habitRow: { alignItems: "center", backgroundColor: colors.background, borderColor: "#E5EEF7", borderRadius: 9, borderWidth: 1, flexDirection: "row", height: 60, paddingHorizontal: 10, shadowColor: "#8BA6BD", shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.05, shadowRadius: 4 },
  habitCopy: { flex: 1, marginLeft: 10 },
  habitName: { color: "#20355E", fontSize: 14, fontWeight: "700" },
  habitTime: { color: colors.muted, fontSize: 11.5, marginTop: 3 },
  checkCircle: { alignItems: "center", borderColor: "#D7E6F5", borderRadius: 15, borderWidth: 1.5, height: 26, justifyContent: "center", width: 26 },
  checkCircleCompleted: { backgroundColor: colors.primary, borderColor: colors.primary },
  fab: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 27, bottom: layout.floatingActionBottom, elevation: 5, height: 54, justifyContent: "center", position: "absolute", right: 25, shadowColor: colors.primaryDark, shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.25, shadowRadius: 6, width: 54, zIndex: 5 },
  emptyState: { alignItems: "center", backgroundColor: "#F7FBFF", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 28 },
  emptyTitle: { color: colors.navy, fontSize: 17, fontWeight: "700", marginTop: 10 },
  emptyBody: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5, textAlign: "center" },
  emptyAction: { backgroundColor: colors.primary, borderRadius: 999, marginTop: 16, paddingHorizontal: 18, paddingVertical: 10 },
  emptyActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});

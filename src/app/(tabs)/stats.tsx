import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#0F2450";
const BORDER = "#DDE7F1";

type SymbolName = SymbolViewProps["name"];
type Period = "7D" | "30D";

type Habit = {
  color: string;
  completion: number;
  icon: SymbolName;
  iconBackground: string;
  id: string;
  name: string;
  schedule: string;
  scheduledDays: number;
};

const habits: Habit[] = [
  {
    id: "workout",
    name: "Workout",
    icon: "dumbbell.fill",
    color: "#18965E",
    iconBackground: "#D8F7E9",
    scheduledDays: 5,
    completion: 71,
    schedule: "Mon, Wed, Fri, Sat, Sun",
  },
  {
    id: "read",
    name: "Read",
    icon: "book.fill",
    color: "#5A54CF",
    iconBackground: "#E5E3FF",
    scheduledDays: 5,
    completion: 71,
    schedule: "Every day",
  },
  {
    id: "water",
    name: "Drink Water",
    icon: "drop.fill",
    color: "#3397ED",
    iconBackground: "#D8EDFF",
    scheduledDays: 6,
    completion: 86,
    schedule: "Every day",
  },
  {
    id: "healthy-eating",
    name: "Healthy Eating",
    icon: "fork.knife",
    color: "#FB7715",
    iconBackground: "#FFF0DE",
    scheduledDays: 4,
    completion: 57,
    schedule: "Mon, Tue, Thu, Sat",
  },
  {
    id: "sleep",
    name: "Sleep 7+ Hours",
    icon: "moon.fill",
    color: "#4246A6",
    iconBackground: "#E3E4FC",
    scheduledDays: 5,
    completion: 71,
    schedule: "Every day",
  },
];

const heatmap = [
  ["done", "done", "done", "scheduled", "scheduled", "done", "done", "scheduled", "scheduled", "scheduled", "done", "done", "scheduled", "today"],
  ["done", "done", "done", "scheduled", "scheduled", "done", "done", "missed", "scheduled", "scheduled", "done", "done", "scheduled", "scheduled"],
  ["done", "done", "done", "missed", "scheduled", "done", "done", "scheduled", "scheduled", "scheduled", "done", "scheduled", "scheduled", "scheduled"],
  ["done", "done", "done", "missed", "scheduled", "done", "done", "scheduled", "missed", "scheduled", "done", "scheduled", "scheduled", "scheduled"],
  ["done", "done", "done", "scheduled", "scheduled", "done", "done", "scheduled", "scheduled", "scheduled", "done", "scheduled", "scheduled", "scheduled"],
  ["done", "done", "done", "scheduled", "scheduled", "done", "done", "scheduled", "scheduled", "scheduled", "done", "done", "scheduled", "scheduled"],
  ["done", "done", "scheduled", "scheduled", "scheduled", "done", "done", "done", "scheduled", "scheduled", "scheduled", "scheduled", "scheduled", "scheduled"],
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StatsScreen() {
  const [period, setPeriod] = useState<Period>("7D");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  if (selectedHabit) {
    return <HabitStats habit={selectedHabit} onBack={() => setSelectedHabit(null)} />;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView bounces={false} contentContainerStyle={styles.overviewContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.overviewTitle}>Stats</Text>

        <View style={styles.overallCard}>
          <View style={styles.streakRow}>
            <View style={styles.flameCircle}>
              <Text style={styles.flame}>🔥</Text>
            </View>
            <View style={styles.overallMetric}>
              <Text style={styles.metricLabel}>Overall streak</Text>
              <Text style={styles.metricValue}>5 days</Text>
            </View>
            <View style={styles.overallDivider} />
            <View style={styles.overallMetric}>
              <Text style={styles.metricLabel}>Longest streak</Text>
              <Text style={styles.metricValue}>12 days</Text>
            </View>
          </View>
          <View style={styles.streakHint}>
            <SymbolView name="calendar" size={20} tintColor="#177753" weight="semibold" />
            <Text style={styles.streakHintText}>Finish today to keep it going</Text>
          </View>
        </View>

        <View style={styles.periodToggle}>
          <PeriodButton active={period === "7D"} label="7D" onPress={() => setPeriod("7D")} />
          <PeriodButton active={period === "30D"} label="30D" onPress={() => setPeriod("30D")} />
        </View>

        <Text style={styles.habitsTitle}>Your habits</Text>
        <View style={styles.habitsList}>
          {habits.map((habit, index) => (
            <HabitSummaryRow
              habit={habit}
              isLast={index === habits.length - 1}
              key={habit.id}
              period={period}
              onPress={() => setSelectedHabit(habit)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PeriodButton({ active, label, onPress }: { active: boolean; label: Period; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} style={[styles.periodButton, active && styles.periodButtonActive]}>
      <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function HabitSummaryRow({ habit, isLast, period, onPress }: { habit: Habit; isLast: boolean; period: Period; onPress: () => void }) {
  const scheduled = period === "7D" ? `${habit.scheduledDays} of 7 scheduled days` : `${Math.round(habit.completion * 0.3)} of 30 scheduled days`;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.habitSummaryRow, !isLast && styles.habitSummaryDivider]}>
      <View style={[styles.summaryIcon, { backgroundColor: habit.iconBackground }]}>
        <SymbolView name={habit.icon} size={26} tintColor={habit.color} weight="semibold" />
      </View>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryName}>{habit.name}</Text>
        <Text style={styles.summarySchedule}>{scheduled}</Text>
        <View style={styles.progressLine}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: habit.color, width: `${habit.completion}%` }]} />
          </View>
          <Text style={styles.completionText}>{habit.completion}%</Text>
        </View>
      </View>
      <SymbolView name="chevron.right" size={18} tintColor="#4B668D" weight="semibold" />
    </Pressable>
  );
}

function HabitStats({ habit, onBack }: { habit: Habit; onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView bounces={false} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <Pressable accessibilityLabel="Back to stats" accessibilityRole="button" hitSlop={10} onPress={onBack} style={styles.backButton}>
            <SymbolView name="chevron.left" size={23} tintColor="#13754D" weight="semibold" />
          </Pressable>
          <Text style={styles.detailTitle}>Habit Stats</Text>
        </View>

        <View style={styles.detailIdentity}>
          <View style={[styles.detailIcon, { backgroundColor: habit.color }]}>
            <SymbolView name={habit.icon} size={32} tintColor="#FFFFFF" weight="semibold" />
          </View>
          <View>
            <Text style={styles.detailName}>{habit.name}</Text>
            <Text style={styles.detailSchedule}>{habit.schedule}</Text>
          </View>
        </View>

        <View style={styles.detailMetricsCard}>
          <MetricBlock label="Current streak" value="5 days" />
          <View style={styles.detailMetricDivider} />
          <MetricBlock label="Longest streak" value="12 days" />
        </View>

        <View style={styles.detailRatesCard}>
          <RateBlock label="7-day completion rate" note="5 of 7 days" value="71%" />
          <View style={styles.detailMetricDivider} />
          <RateBlock label="30-day completion rate" note="19 of 30 days" value="63%" />
        </View>

        <Text style={styles.heatmapTitle}>30-day heatmap</Text>
        <View style={styles.heatmapRows}>
          {heatmap.map((row, rowIndex) => (
            <View key={weekdays[rowIndex]} style={styles.heatmapRow}>
              <View style={styles.heatmapCells}>
                {row.map((status, columnIndex) => (
                  <View key={`${rowIndex}-${columnIndex}`} style={[styles.heatCell, heatCellStyle(status)]} />
                ))}
              </View>
              <Text style={styles.weekdayLabel}>{weekdays[rowIndex]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <LegendItem color="#55B985" label="Done" />
          <LegendItem color="#F45B5A" label="Missed" />
          <LegendItem color="#E4EAF1" label="Not scheduled" />
          <LegendItem color="#FFFFFF" label="Today" outline="#168B5B" />
        </View>

        <View style={styles.scheduleRow}>
          <SymbolView name="calendar" size={23} tintColor="#53647D" weight="medium" />
          <View style={styles.scheduleCopy}>
            <Text style={styles.scheduleTitle}>Schedule</Text>
            <Text style={styles.scheduleValue}>{habit.schedule}</Text>
          </View>
          <SymbolView name="chevron.right" size={18} tintColor="#53647D" weight="semibold" />
        </View>

        <View style={styles.infoCard}>
          <SymbolView name="lightbulb" size={23} tintColor="#5F728F" weight="medium" />
          <Text style={styles.infoText}>This shows your last 30 days of check-ins{`\n`}for this habit. The window ends today and{`\n`}never shows future dates.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.detailMetricLabel}>{label}</Text>
      <Text style={styles.detailMetricValue}>{value}</Text>
    </View>
  );
}

function RateBlock({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.detailMetricLabel}>{label}</Text>
      <Text style={styles.rateValue}>{value}</Text>
      <Text style={styles.rateNote}>{note}</Text>
    </View>
  );
}

function LegendItem({ color, label, outline }: { color: string; label: string; outline?: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendMark, { backgroundColor: color }, outline ? { borderColor: outline, borderWidth: 2 } : undefined]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function heatCellStyle(status: string) {
  if (status === "done") return styles.heatDone;
  if (status === "missed") return styles.heatMissed;
  if (status === "today") return styles.heatToday;
  return styles.heatScheduled;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  overviewContent: {
    // NativeTabs renders above this screen. Keep the final habit fully
    // scrollable above the tab bar instead of underneath it.
    paddingBottom: 142,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  overviewTitle: {
    color: "#080F20",
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -1.1,
  },
  overallCard: {
    borderColor: BORDER,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 19,
    padding: 17,
  },
  streakRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  flameCircle: {
    alignItems: "center",
    backgroundColor: "#168B5B",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  flame: {
    fontSize: 27,
  },
  overallMetric: {
    flex: 1,
    marginLeft: 14,
  },
  metricLabel: {
    color: "#415779",
    fontSize: 12,
    fontWeight: "500",
  },
  metricValue: {
    color: "#0B1630",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginTop: 9,
  },
  overallDivider: {
    backgroundColor: "#DFE7EF",
    height: 78,
    width: 1,
  },
  streakHint: {
    alignItems: "center",
    backgroundColor: "#E5F7F0",
    borderRadius: 14,
    flexDirection: "row",
    height: 49,
    marginTop: 18,
    paddingHorizontal: 17,
  },
  streakHintText: {
    color: "#116944",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 13,
  },
  periodToggle: {
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    height: 48,
    marginTop: 26,
    overflow: "hidden",
  },
  periodButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  periodButtonActive: {
    backgroundColor: "#198A5D",
    borderRadius: 24,
  },
  periodLabel: {
    color: "#526582",
    fontSize: 15,
    fontWeight: "700",
  },
  periodLabelActive: {
    color: "#FFFFFF",
  },
  habitsTitle: {
    color: "#0B1630",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 28,
  },
  habitsList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EFF3F7",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
    paddingHorizontal: 13,
  },
  habitSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 114,
  },
  habitSummaryDivider: {
    borderBottomColor: "#E5EDF4",
    borderBottomWidth: 1,
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 31,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  summaryCopy: {
    flex: 1,
    marginLeft: 15,
  },
  summaryName: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  summarySchedule: {
    color: "#425A82",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  progressLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  progressTrack: {
    backgroundColor: "#E4ECF3",
    borderRadius: 99,
    flex: 1,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 99,
    height: "100%",
  },
  completionText: {
    color: "#425A82",
    fontSize: 12,
    fontWeight: "500",
    width: 32,
  },
  detailContent: {
    paddingBottom: 142,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  detailHeader: {
    alignItems: "center",
    flexDirection: "row",
    height: 43,
    justifyContent: "center",
  },
  backButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    left: -6,
    position: "absolute",
    width: 38,
    zIndex: 1,
  },
  detailTitle: {
    color: "#101A2D",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.55,
  },
  detailIdentity: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 22,
  },
  detailIcon: {
    alignItems: "center",
    borderRadius: 42,
    height: 81,
    justifyContent: "center",
    width: 81,
  },
  detailName: {
    color: "#0C1730",
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginLeft: 19,
  },
  detailSchedule: {
    color: "#536682",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 19,
    marginTop: 7,
  },
  detailMetricsCard: {
    backgroundColor: "#F6F9FC",
    borderRadius: 15,
    flexDirection: "row",
    marginTop: 21,
    minHeight: 113,
    paddingHorizontal: 21,
    paddingVertical: 20,
  },
  metricBlock: {
    flex: 1,
  },
  detailMetricDivider: {
    backgroundColor: "#D6E0EA",
    marginVertical: 0,
    width: 1,
  },
  detailMetricLabel: {
    color: "#26344D",
    fontSize: 13,
    fontWeight: "500",
  },
  detailMetricValue: {
    color: "#0C1424",
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 10,
  },
  detailRatesCard: {
    backgroundColor: "#F6F9FC",
    borderRadius: 15,
    flexDirection: "row",
    marginTop: 15,
    minHeight: 144,
    paddingHorizontal: 21,
    paddingVertical: 20,
  },
  rateValue: {
    color: "#0C1424",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.1,
    marginTop: 12,
  },
  rateNote: {
    color: "#697A95",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 5,
  },
  heatmapTitle: {
    color: "#112143",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 27,
  },
  heatmapRows: {
    gap: 6,
    marginTop: 16,
  },
  heatmapRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  heatmapCells: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  heatCell: {
    aspectRatio: 1,
    borderRadius: 4,
    flex: 1,
  },
  heatDone: {
    backgroundColor: "#55B985",
  },
  heatMissed: {
    backgroundColor: "#F45B5A",
  },
  heatScheduled: {
    backgroundColor: "#E4EAF1",
  },
  heatToday: {
    backgroundColor: "#FFFFFF",
    borderColor: "#168B5B",
    borderWidth: 2,
  },
  weekdayLabel: {
    color: "#425776",
    fontSize: 12,
    fontWeight: "500",
    width: 28,
  },
  legend: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    marginTop: 21,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  legendMark: {
    borderRadius: 5,
    height: 20,
    width: 20,
  },
  legendLabel: {
    color: "#3E4F6C",
    fontSize: 12,
    fontWeight: "500",
  },
  scheduleRow: {
    alignItems: "center",
    borderTopColor: "#E0E7EF",
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 29,
    minHeight: 81,
    paddingHorizontal: 3,
  },
  scheduleCopy: {
    flex: 1,
    marginLeft: 18,
  },
  scheduleTitle: {
    color: "#17233D",
    fontSize: 15,
    fontWeight: "700",
  },
  scheduleValue: {
    color: "#536682",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
  },
  infoCard: {
    alignItems: "flex-start",
    backgroundColor: "#F1F7FB",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 7,
    minHeight: 93,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoText: {
    color: "#536682",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginLeft: 16,
  },
});

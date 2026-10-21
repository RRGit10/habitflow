import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#0E2A60";
const BODY = "#4F72A7";
const BORDER = "#C3E9ED";
const MINT = "#EDFCF9";
const GREEN = "#12A66A";

type SymbolName = SymbolViewProps["name"];

type PartnerHabit = {
  color: string;
  icon: SymbolName;
  iconBackground: string;
  id: string;
  name: string;
  time: string;
};

const partnerHabits: PartnerHabit[] = [
  { id: "workout", name: "Workout", time: "7:00 AM", icon: "dumbbell.fill", color: "#17A46C", iconBackground: "#D9F8EC" },
  { id: "read", name: "Read", time: "Not done", icon: "book.fill", color: "#3B8BF6", iconBackground: "#D7EAFE" },
  { id: "drink-water", name: "Drink water", time: "Not done", icon: "drop.fill", color: "#8749E5", iconBackground: "#EAD9FF" },
  { id: "eat-healthy", name: "Eat healthy", time: "Not done", icon: "fork.knife", color: "#F47D14", iconBackground: "#FFE5C5" },
];

export default function PartnerDashboardScreen({ embedded = false }: { embedded?: boolean }) {
  const [lastUpdated, setLastUpdated] = useState("Updated just now");

  return (
    <SafeAreaView edges={embedded ? ["top"] : ["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView bounces={false} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to home" accessibilityRole="button" hitSlop={10} onPress={() => router.replace("/home")} style={styles.headerIcon}>
            <SymbolView name="chevron.left" size={21} tintColor={NAVY} weight="semibold" />
          </Pressable>
          <Text style={styles.title}>Partner Dashboard</Text>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Partner options" accessibilityRole="button" hitSlop={10} onPress={() => undefined} style={styles.moreButton}>
              <SymbolView name="ellipsis" size={18} tintColor={NAVY} weight="bold" />
            </Pressable>
            <Pressable
              accessibilityLabel="Refresh partner progress"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setLastUpdated("Updated just now")}
              style={styles.headerIcon}
            >
              <SymbolView name="arrow.clockwise" size={21} tintColor={NAVY} weight="medium" />
            </Pressable>
          </View>
        </View>

        <View style={styles.partnerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.partnerCopy}>
            <Text style={styles.partnerName}>Jordan Davis</Text>
            <Text style={styles.partnerRole}>Your partner</Text>
            <View style={styles.timezoneLine}>
              <Text numberOfLines={1} style={styles.timezoneText}>Progress updates are in Jordan’s timezone</Text>
              <SymbolView name="info.circle" size={14} tintColor="#6180A9" weight="medium" />
            </View>
          </View>
        </View>

        <View style={styles.timezoneNotice}>
          <SymbolView name="clock" size={20} tintColor="#087662" weight="medium" />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Jordan is in a different timezone</Text>
            <Text numberOfLines={1} style={styles.noticeText}>They’re in Los Angeles (PDT). Today is their local day.</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.todayColumn}>
            <Text style={styles.todayTitle}>Today</Text>
            <Text style={styles.todaySubtitle}>(Jordan’s day)</Text>
            <Text style={styles.todayCount}>2 of 4</Text>
            <Text style={styles.todayBody}>done today</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.streakColumn}>
            <Text style={styles.streakLabel}>Overall streak</Text>
            <View style={styles.streakValueLine}>
              <Text style={styles.fire}>🔥</Text>
              <Text style={styles.streakValue}>6 days</Text>
            </View>
            <Text style={[styles.streakLabel, styles.longestLabel]}>Longest streak</Text>
            <View style={styles.streakValueLine}>
              <Text style={styles.fire}>🔥</Text>
              <Text style={styles.streakValue}>14 days</Text>
            </View>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.updateColumn}>
            <View style={styles.updatedRow}>
              <View style={styles.updateDot} />
              <Text numberOfLines={1} style={styles.updatedText}>{lastUpdated}</Text>
            </View>
            <View style={styles.horizontalDivider} />
            <View style={styles.privateProgress}>
              <SymbolView name="person" size={18} tintColor="#0B6571" weight="medium" />
              <Text style={styles.privateProgressText}>1 more habit{`\n`}(private)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sharedHeading}>
          <ShareMark />
          <Text style={styles.sharedHeadingText}>Jordan shares 3 habits with you.</Text>
        </View>

        <View style={styles.habitsCard}>
          {partnerHabits.map((habit, index) => (
            <PartnerHabitRow habit={habit} isFirst={index === 0} key={habit.id} />
          ))}
        </View>

        <View style={styles.privateCard}>
          <View style={styles.privateIconCircle}>
            <SymbolView name="person" size={23} tintColor="#087866" weight="medium" />
          </View>
          <View>
            <Text style={styles.privateTitle}>1 more habit (private)</Text>
            <Text style={styles.privateText}>This habit isn’t shared with you.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PartnerHabitRow({ habit, isFirst }: { habit: PartnerHabit; isFirst: boolean }) {
  return (
    <View style={[styles.habitRow, !isFirst && styles.habitRowBorder]}>
      <View style={[styles.habitIcon, { backgroundColor: habit.iconBackground }]}>
        <SymbolView name={habit.icon} size={22} tintColor={habit.color} weight="semibold" />
      </View>
      <View style={styles.habitCopy}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.habitTime}>{habit.time}</Text>
      </View>
      {isFirst ? (
        <View style={styles.doneStatus}>
          <SymbolView name="checkmark.circle.fill" size={21} tintColor={GREEN} weight="medium" />
          <Text style={styles.doneText}>Done today</Text>
        </View>
      ) : (
        <View style={styles.notDoneStatus}>
          <SymbolView name="circle" size={22} tintColor="#849AB9" weight="regular" />
          <Text style={styles.notDoneText}>Not done</Text>
        </View>
      )}
    </View>
  );
}

function ShareMark() {
  return (
    <View accessibilityElementsHidden style={styles.shareMark}>
      <View style={[styles.shareLine, styles.shareLineTop]} />
      <View style={[styles.shareLine, styles.shareLineBottom]} />
      <View style={[styles.shareDot, styles.shareDotLeft]} />
      <View style={[styles.shareDot, styles.shareDotTop]} />
      <View style={[styles.shareDot, styles.shareDotBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  content: {
    // The dashboard is also rendered inside NativeTabs, whose tab bar overlays
    // content on iOS. This keeps the private-habit card reachable there.
    paddingBottom: 142,
    paddingHorizontal: 12,
    paddingTop: 7,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 40,
    justifyContent: "space-between",
  },
  headerIcon: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 30,
    zIndex: 1,
  },
  title: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
    left: 0,
    letterSpacing: -0.4,
    position: "absolute",
    right: 0,
    textAlign: "center",
    zIndex: 0,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    zIndex: 1,
  },
  moreButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 18,
  },
  partnerCard: {
    alignItems: "center",
    backgroundColor: MINT,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    minHeight: 90,
    paddingHorizontal: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#BDF2E3",
    borderRadius: 30,
    height: 51,
    justifyContent: "center",
    width: 51,
  },
  avatarText: {
    color: "#076557",
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: -0.6,
  },
  partnerCopy: {
    flex: 1,
    marginLeft: 14,
  },
  partnerName: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  partnerRole: {
    color: "#0A776B",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  timezoneLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 9,
  },
  timezoneText: {
    color: BODY,
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: "500",
  },
  timezoneNotice: {
    alignItems: "center",
    backgroundColor: MINT,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 9,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  noticeCopy: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    color: NAVY,
    fontSize: 11.5,
    fontWeight: "700",
  },
  noticeText: {
    color: BODY,
    fontSize: 10.5,
    fontWeight: "500",
    lineHeight: 14,
    marginTop: 3,
  },
  progressCard: {
    alignItems: "stretch",
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 9,
    minHeight: 117,
    overflow: "hidden",
    paddingVertical: 13,
  },
  todayColumn: {
    flex: 1,
    paddingLeft: 13,
  },
  todayTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  todaySubtitle: {
    color: BODY,
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 4,
  },
  todayCount: {
    color: NAVY,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 13,
  },
  todayBody: {
    color: BODY,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  verticalDivider: {
    backgroundColor: "#BFDDED",
    marginVertical: 3,
    width: 1,
  },
  streakColumn: {
    flex: 1.08,
    paddingHorizontal: 12,
  },
  streakLabel: {
    color: BODY,
    fontSize: 12,
    fontWeight: "500",
  },
  streakValueLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },
  fire: {
    fontSize: 19,
    lineHeight: 23,
  },
  streakValue: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  longestLabel: {
    marginTop: 13,
  },
  updateColumn: {
    flex: 0.86,
    paddingHorizontal: 11,
  },
  updatedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  updateDot: {
    backgroundColor: GREEN,
    borderRadius: 6,
    height: 8,
    width: 8,
  },
  updatedText: {
    color: BODY,
    fontSize: 9,
    fontWeight: "500",
  },
  horizontalDivider: {
    backgroundColor: "#BFDDED",
    height: 1,
    marginTop: 27,
  },
  privateProgress: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
  },
  privateProgressText: {
    color: BODY,
    fontSize: 10.5,
    fontWeight: "500",
    lineHeight: 14,
  },
  sharedHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingLeft: 2,
  },
  sharedHeadingText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  shareMark: {
    height: 21,
    position: "relative",
    width: 23,
  },
  shareLine: {
    backgroundColor: "#07365F",
    height: 2.5,
    left: 6,
    position: "absolute",
    width: 12,
  },
  shareLineTop: {
    top: 7,
    transform: [{ rotate: "-31deg" }],
  },
  shareLineBottom: {
    top: 13,
    transform: [{ rotate: "31deg" }],
  },
  shareDot: {
    backgroundColor: "#07365F",
    borderRadius: 4,
    height: 8,
    position: "absolute",
    width: 8,
  },
  shareDotLeft: {
    left: 0,
    top: 7,
  },
  shareDotTop: {
    right: 0,
    top: 0,
  },
  shareDotBottom: {
    bottom: 0,
    right: 0,
  },
  habitsCard: {
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
    paddingHorizontal: 11,
  },
  habitRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 65,
  },
  habitRowBorder: {
    borderTopColor: "#C9E0EF",
    borderTopWidth: 1,
  },
  habitIcon: {
    alignItems: "center",
    borderRadius: 25,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  habitCopy: {
    flex: 1,
    marginLeft: 14,
  },
  habitName: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  habitTime: {
    color: BODY,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  doneStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  doneText: {
    color: "#07955F",
    fontSize: 11,
    fontWeight: "500",
  },
  notDoneStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  notDoneText: {
    color: BODY,
    fontSize: 11,
    fontWeight: "500",
  },
  privateCard: {
    alignItems: "center",
    backgroundColor: MINT,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    minHeight: 63,
    paddingHorizontal: 13,
  },
  privateIconCircle: {
    alignItems: "center",
    backgroundColor: "#CFF9E9",
    borderRadius: 24,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  privateTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 13,
  },
  privateText: {
    color: BODY,
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 13,
    marginTop: 4,
  },
});

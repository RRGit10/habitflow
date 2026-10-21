import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#102958";
const MUTED_BLUE = "#4F75AA";
const BORDER = "#D8E6F2";
const GREEN = "#159C66";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type RepeatOption = "daily" | "selected" | "interval";
type SymbolName = SymbolViewProps["name"];

export default function CreateHabitScreen() {
  const [habitName, setHabitName] = useState("");
  const [repeat, setRepeat] = useState<RepeatOption>("daily");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]),
  );
  const [shareWithPartner, setShareWithPartner] = useState(false);

  function toggleDay(day: string) {
    setSelectedDays((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function close() {
    router.back();
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={10} onPress={close} style={styles.backButton}>
            <SymbolView name="chevron.left" size={19} tintColor={NAVY} weight="semibold" />
          </Pressable>
          <Text style={styles.title}>Create Habit</Text>
        </View>

        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>Habit name</Text>
          <TextInput
            accessibilityLabel="Habit name"
            autoCapitalize="sentences"
            onChangeText={setHabitName}
            placeholder="e.g. Read, Workout, Drink water..."
            placeholderTextColor="#6683B0"
            returnKeyType="done"
            style={styles.nameInput}
            value={habitName}
          />
        </View>

        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.repeatOptions}>
          <RepeatButton active={repeat === "daily"} label="Daily" onPress={() => setRepeat("daily")} />
          <RepeatButton active={repeat === "selected"} label="Selected days" onPress={() => setRepeat("selected")} />
          <RepeatButton active={repeat === "interval"} label="Every N days" onPress={() => setRepeat("interval")} />
        </View>

        <DetailRow icon="calendar" label="Start date" value="Today, Oct 16, 2026" />
        <DetailRow icon="clock" label="Reminder time" value="9:00 AM" />
        <Text style={styles.reminderHint}>You’ll get a reminder at this time.</Text>

        <Text style={styles.daysTitle}>Selected days</Text>
        <View style={styles.dayButtons}>
          {WEEKDAYS.map((day) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedDays.has(day) }}
              key={day}
              onPress={() => toggleDay(day)}
              style={[styles.dayButton, selectedDays.has(day) && styles.dayButtonSelected]}
            >
              <Text style={[styles.dayText, selectedDays.has(day) && styles.dayTextSelected]}>{day}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.shareCard}>
          <View style={styles.shareTopRow}>
            <SymbolView name="person.2" size={19} tintColor={NAVY} weight="medium" />
            <View style={styles.shareHeading}>
              <Text style={styles.shareTitle}>Share with partner</Text>
              <Text style={styles.shareSubheading}>Connect a partner first.</Text>
            </View>
            <Switch
              accessibilityLabel="Share habit with partner"
              onValueChange={setShareWithPartner}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D6E4EF", true: GREEN }}
              value={shareWithPartner}
            />
          </View>
          <Text style={styles.shareHint}>Your partner will see this habit’s name and whether{`\n`}it’s done.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveText}>Save Habit</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RepeatButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} style={[styles.repeatButton, active && styles.repeatButtonActive]}>
      <Text numberOfLines={1} style={[styles.repeatText, active && styles.repeatTextActive]}>{label}</Text>
    </Pressable>
  );
}

function DetailRow({ icon, label, value }: { icon: SymbolName; label: string; value: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => undefined} style={styles.detailRow}>
      <SymbolView name={icon} size={18} tintColor={NAVY} weight="medium" />
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      <SymbolView name="chevron.right" size={13} tintColor={MUTED_BLUE} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  content: {
    paddingBottom: 26,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 30,
  },
  backButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    marginLeft: -6,
    width: 29,
  },
  title: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.25,
    marginLeft: 4,
  },
  nameField: {
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    height: 63,
    justifyContent: "center",
    marginTop: 17,
    paddingHorizontal: 10,
  },
  fieldLabel: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 13,
  },
  nameInput: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "500",
    height: 28,
    lineHeight: 18,
    marginTop: 1,
    padding: 0,
  },
  sectionTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 18,
  },
  repeatOptions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 7,
  },
  repeatButton: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  repeatButtonActive: {
    backgroundColor: "#E8FAF2",
    borderColor: "#19A46D",
  },
  repeatText: {
    color: MUTED_BLUE,
    fontSize: 11,
    fontWeight: "600",
  },
  repeatTextActive: {
    color: "#078B5C",
    fontWeight: "700",
  },
  detailRow: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 57,
    marginTop: 17,
    paddingHorizontal: 10,
  },
  detailCopy: {
    flex: 1,
    marginLeft: 11,
  },
  detailLabel: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 15,
  },
  detailValue: {
    color: MUTED_BLUE,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 15,
    marginTop: 1,
  },
  reminderHint: {
    color: "#6682AC",
    fontSize: 10,
    lineHeight: 12,
    marginLeft: 39,
    marginTop: 7,
  },
  daysTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
  },
  dayButtons: {
    flexDirection: "row",
    gap: 4,
    marginTop: 7,
  },
  dayButton: {
    alignItems: "center",
    backgroundColor: "#F7FAFD",
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 31,
    justifyContent: "center",
  },
  dayButtonSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  dayText: {
    color: MUTED_BLUE,
    fontSize: 10,
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  shareCard: {
    borderColor: BORDER,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 17,
    minHeight: 96,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  shareTopRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  shareHeading: {
    flex: 1,
    marginLeft: 11,
  },
  shareTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 15,
  },
  shareSubheading: {
    color: MUTED_BLUE,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    marginTop: 1,
  },
  shareHint: {
    color: MUTED_BLUE,
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 14,
    marginLeft: 30,
    marginTop: 8,
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 99,
    height: 44,
    justifyContent: "center",
    shadowColor: "#08734B",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#BFD7E9",
    borderRadius: 99,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
  },
  cancelText: {
    color: MUTED_BLUE,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});

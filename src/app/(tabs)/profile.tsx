import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#112B5B";
const MUTED_BLUE = "#5277AF";

type SymbolName = SymbolViewProps["name"];

type ProfileRowProps = {
  detail?: string;
  icon: SymbolName;
  label: string;
  tone?: "danger" | "default";
  trailing?: "chevron" | "switch";
  onToggleNotifications?: (value: boolean) => void;
  notificationsEnabled?: boolean;
};

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RR</Text>
          </View>
          <View>
            <Text style={styles.name}>Rabin Regmi</Text>
            <Text style={styles.email}>rabinregmi@example.com</Text>
          </View>
        </View>

        <View style={styles.streakCards}>
          <StreakCard
            icon="flame.fill"
            iconColor="#FFA71D"
            label="Overall streak"
            value="5 days"
          />
          <StreakCard
            icon="trophy.fill"
            iconColor="#FF9D18"
            label="Longest streak"
            value="12 days"
          />
        </View>

        <View style={styles.primaryList}>
          <ProfileRow detail="America/New_York" icon="globe" label="Timezone" />
          <ListDivider />
          <ProfileRow detail="Not connected" icon="person.2" label="Partner" />
          <ListDivider />
          <ProfileRow
            detail="Push notifications are on"
            icon="bell"
            label="Notifications"
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
            trailing="switch"
          />
          <ListDivider />
          <ProfileRow detail="feedback@habittracker.app" icon="envelope" label="Send feedback" />
          <ListDivider />
          <ProfileRow detail="How your data is used" icon="lock.shield" label="Privacy" />
        </View>

        <View style={styles.secondaryList}>
          <ProfileRow icon="questionmark.circle" label="Help & Support" />
          <ListDivider />
          <ProfileRow icon="rectangle.portrait.and.arrow.right" label="Sign out" />
        </View>

        <View style={styles.deleteList}>
          <ProfileRow
            detail="Confirm with email code"
            icon="trash"
            label="Delete account"
            tone="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StreakCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: SymbolName;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.streakCard}>
      <SymbolView name={icon} size={18} tintColor={iconColor} type="hierarchical" weight="semibold" />
      <View style={styles.streakCopy}>
        <Text style={styles.streakLabel}>{label}</Text>
        <Text style={styles.streakValue}>{value}</Text>
      </View>
    </View>
  );
}

function ProfileRow({
  detail,
  icon,
  label,
  notificationsEnabled,
  onToggleNotifications,
  tone = "default",
  trailing = "chevron",
}: ProfileRowProps) {
  const isDanger = tone === "danger";
  const iconColor = isDanger ? "#FF3D48" : NAVY;

  return (
    <Pressable
      accessibilityRole={trailing === "switch" ? "none" : "button"}
      onPress={trailing === "switch" ? undefined : () => undefined}
      style={styles.profileRow}
    >
      <SymbolView name={icon} size={19} tintColor={iconColor} weight="medium" />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, isDanger && styles.dangerLabel]}>{label}</Text>
        {detail ? <Text style={[styles.rowDetail, isDanger && styles.dangerDetail]}>{detail}</Text> : null}
      </View>
      {trailing === "switch" ? (
        <Switch
          accessibilityLabel="Push notifications"
          onValueChange={onToggleNotifications}
          thumbColor="#FFFFFF"
          trackColor={{ false: "#CED9E7", true: "#16A66D" }}
          value={notificationsEnabled}
        />
      ) : (
        <SymbolView name="chevron.right" size={14} tintColor={MUTED_BLUE} weight="semibold" />
      )}
    </Pressable>
  );
}

function ListDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  content: {
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  title: {
    color: NAVY,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 15,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#139A64",
    borderColor: "#E2F6EE",
    borderRadius: 32,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    shadowColor: "#106F4D",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 64,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  name: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.25,
    marginLeft: 15,
  },
  email: {
    color: MUTED_BLUE,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: -0.1,
    marginLeft: 15,
    marginTop: 3,
  },
  streakCards: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  streakCard: {
    alignItems: "center",
    backgroundColor: "#FCFEFF",
    borderColor: "#DCE8F4",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    height: 57,
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  streakCopy: {
    marginLeft: 9,
  },
  streakLabel: {
    color: "#456FA7",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },
  streakValue: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 1,
  },
  primaryList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8F4",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
  },
  secondaryList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8F4",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },
  deleteList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8F4",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 51,
    paddingHorizontal: 11,
  },
  rowCopy: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  rowDetail: {
    color: MUTED_BLUE,
    fontSize: 10.5,
    fontWeight: "500",
    lineHeight: 13,
    marginTop: 1,
  },
  dangerLabel: {
    color: "#F74751",
  },
  dangerDetail: {
    color: "#5277AF",
  },
  divider: {
    backgroundColor: "#E5EDF5",
    height: 1,
    marginLeft: 42,
  },
});

import { NativeTabs } from "expo-router/unstable-native-tabs";

import { colors } from "../../theme/tokens";

export default function AppTabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={{ default: colors.accentBlue, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.accentBlue, fontSize: 11, fontWeight: "600" },
        selected: { color: colors.primary, fontSize: 11, fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon
          md={{ default: "home", selected: "home_filled" }}
          sf={{ default: "house", selected: "house.fill" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Icon md="bar_chart" sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="partners">
        <NativeTabs.Trigger.Icon md="group" sf={{ default: "person.2", selected: "person.2.fill" }} />
        <NativeTabs.Trigger.Label>Partners</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon md="person" sf={{ default: "person", selected: "person.fill" }} />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

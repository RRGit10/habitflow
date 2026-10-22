import { useSignInWithApple } from "@clerk/expo/apple";
import { useSignInWithGoogle } from "@clerk/expo/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export type NativeSocialButtonsProps = {
  onComplete: () => void;
  onError: () => void;
};

type Provider = "apple" | "google" | null;

/**
 * This component is loaded only in a custom native build. Keeping the native
 * imports here prevents Expo Go from evaluating modules it does not contain.
 */
export function NativeSocialButtons({ onComplete, onError }: NativeSocialButtonsProps) {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const [activeProvider, setActiveProvider] = useState<Provider>(null);
  const [appleButtonIsAvailable, setAppleButtonIsAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    void AppleAuthentication.isAvailableAsync()
      .then(setAppleButtonIsAvailable)
      .catch(() => setAppleButtonIsAvailable(false));
  }, []);

  async function finishFlow(
    startFlow: () => Promise<{ createdSessionId: string | null; setActive?: (options: { session: string }) => Promise<void> }>,
    provider: Exclude<Provider, null>,
  ) {
    setActiveProvider(provider);

    try {
      const { createdSessionId, setActive } = await startFlow();

      // Clerk returns no session when the provider sheet is cancelled. It is not an error state.
      if (!createdSessionId || !setActive) {
        return;
      }

      await setActive({ session: createdSessionId });
      onComplete();
    } catch {
      // Restricted-mode, account-linking, and provider failures intentionally use one message.
      onError();
    } finally {
      setActiveProvider(null);
    }
  }

  const googleIsLoading = activeProvider === "google";
  const appleIsLoading = activeProvider === "apple";
  const isBusy = activeProvider !== null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        disabled={isBusy}
        onPress={() => void finishFlow(startGoogleAuthenticationFlow, "google")}
        style={({ pressed }) => [styles.googleButton, pressed && !isBusy && styles.pressed, isBusy && styles.dimmed]}
      >
        <Image accessibilityIgnoresInvertColors source={require("../../../assets/images/google-g.png")} style={styles.googleMark} />
        <Text style={styles.googleText}>{googleIsLoading ? "Opening Google…" : "Continue with Google"}</Text>
      </Pressable>

      {Platform.OS === "ios" && appleButtonIsAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          accessibilityLabel="Continue with Apple"
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          cornerRadius={34}
          onPress={() => void finishFlow(startAppleAuthenticationFlow, "apple")}
          style={[styles.appleNativeButton, isBusy && styles.dimmed]}
        />
      ) : (
        <Pressable
          accessibilityLabel="Continue with Apple"
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => void finishFlow(startAppleAuthenticationFlow, "apple")}
          style={({ pressed }) => [styles.appleFallbackButton, pressed && !isBusy && styles.pressed, isBusy && styles.dimmed]}
        >
          <Text style={styles.appleLogo}>{"\uF8FF"}</Text>
          <Text style={styles.appleText}>{appleIsLoading ? "Opening Apple…" : "Continue with Apple"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D2D5D9",
    borderRadius: 34,
    borderWidth: 1,
    flexDirection: "row",
    height: 68,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  googleMark: {
    height: 24,
    marginRight: 14,
    width: 24,
  },
  googleText: {
    color: "#151B27",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  appleNativeButton: {
    height: 68,
    width: "100%",
  },
  appleFallbackButton: {
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 34,
    flexDirection: "row",
    height: 68,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  appleLogo: {
    color: "#FFFFFF",
    fontFamily: "System",
    fontSize: 27,
    lineHeight: 30,
    marginRight: 12,
  },
  appleText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  dimmed: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.82,
  },
});

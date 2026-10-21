import { useAuth, useSignIn } from "@clerk/expo";
import Constants, { AppOwnership } from "expo-constants";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeSocialButtonsProps } from "../components/auth/NativeSocialButtons";

const RESEND_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_AUTH_ERROR = "We couldn’t sign you in. Check your access and try again.";
const IS_EXPO_GO = Constants.appOwnership === AppOwnership.Expo;
const CAN_LOAD_NATIVE_SOCIAL = Platform.OS !== "web" && !IS_EXPO_GO;
const NativeSocialButtons = lazy(async () => {
  const socialModule = await import("../components/auth/NativeSocialButtons");
  return { default: socialModule.NativeSocialButtons };
});

type AuthStep = "email" | "code";
type SocialProvider = "Apple" | "Google";

export default function Index() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { fetchStatus, signIn } = useSignIn();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = fetchStatus === "fetching" || isSubmitting;
  const emailIsValid = EMAIL_PATTERN.test(email.trim());
  const isEmailStep = step === "email";

  useEffect(() => {
    if (step !== "code" || resendSeconds === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds, step]);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace("/home");
    }
  }, [isAuthLoaded, isSignedIn]);

  async function sendCode() {
    const normalizedEmail = email.trim().toLowerCase();
    const isResend = step === "code";

    if (isSignedIn) {
      router.replace("/home");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // A retry from the email step needs a clean local SignIn attempt. When
      // resending from the code step, Clerk already has the email address, so
      // sending it a second time is invalid.
      if (!isResend) {
        await signIn.reset();
      }

      const { error: sendError } = await signIn.emailCode.sendCode(
        isResend ? undefined : { emailAddress: normalizedEmail },
      );

      if (sendError) {
        reportAuthFailure("send email code", sendError);
        setError(GENERIC_AUTH_ERROR);
        return;
      }

      setEmail(normalizedEmail);
      setCode("");
      setResendSeconds(RESEND_SECONDS);
      setStep("code");
    } catch (caughtError) {
      reportAuthFailure("send email code", caughtError);
      setError(GENERIC_AUTH_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: verificationError } = await signIn.emailCode.verifyCode({ code });

      if (verificationError) {
        reportAuthFailure("verify email code", verificationError);
        setCode("");
        setError(GENERIC_AUTH_ERROR);
        return;
      }

      const { error: finalizeError } = await signIn.finalize();

      if (finalizeError) {
        reportAuthFailure("finalize sign-in", finalizeError);
        setError(GENERIC_AUTH_ERROR);
        return;
      }

      router.replace("/home");
    } catch (caughtError) {
      reportAuthFailure("verify email code", caughtError);
      setCode("");
      setError(GENERIC_AUTH_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  function useDifferentEmail() {
    void signIn.reset();
    setCode("");
    setError(null);
    setResendSeconds(0);
    setStep("email");
  }

  function handleSocialSuccess() {
    router.replace("/home");
  }

  function showExpoGoMessage(provider: SocialProvider) {
    setError(provider + " sign-in is available in the full app build.");
  }

  const buttonLabel = isEmailStep
    ? isLoading
      ? "Sending…"
      : "Continue"
    : isLoading
      ? "Verifying…"
      : "Verify code";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardAvoider}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <Landscape />

            <View style={styles.brand}>
              <LeafMark />
              <Text style={styles.appName}>Habit Tracker</Text>
              <Text style={styles.tagline}>Better habits. A stronger you.</Text>
            </View>

            <View style={styles.form}>
              {isEmailStep ? (
                <>
                  <Text style={styles.heading}>Enter your email</Text>
                  <Text style={styles.description}>We’ll check if you have an invitation{"\n"}to access the app.</Text>

                  <View style={styles.inputContainer}>
                    <Text accessibilityElementsHidden style={styles.mailIcon}>
                      ✉
                    </Text>
                    <TextInput
                      accessibilityLabel="Email address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!isLoading}
                      keyboardType="email-address"
                      onChangeText={(value) => {
                        setEmail(value);
                        setError(null);
                      }}
                      onSubmitEditing={() => void sendCode()}
                      placeholder="you@example.com"
                      placeholderTextColor="#8D95A2"
                      returnKeyType="send"
                      selectionColor="#182230"
                      style={styles.input}
                      value={email}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.heading}>Check your email</Text>
                  <Text style={styles.description}>
                    We sent a 6-digit sign-in code to{"\n"}
                    <Text style={styles.emailAddress}>{email}</Text>
                  </Text>

                  <TextInput
                    accessibilityLabel="Six digit sign-in code"
                    autoComplete="one-time-code"
                    autoFocus
                    editable={!isLoading}
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={(value) => {
                      setCode(value.replace(/\D/g, ""));
                      setError(null);
                    }}
                    onSubmitEditing={() => void verifyCode()}
                    placeholder="••••••"
                    placeholderTextColor="#A1A8B2"
                    returnKeyType="done"
                    selectionColor="#182230"
                    style={styles.codeInput}
                    textContentType="oneTimeCode"
                    value={code}
                  />
                </>
              )}

              {error ? (
                <Text accessibilityLiveRegion="polite" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isLoading || (isEmailStep ? !emailIsValid : code.length !== 6)}
                onPress={() => void (isEmailStep ? sendCode() : verifyCode())}
                style={({ pressed }) => [
                  styles.continueButton,
                  (isLoading || (isEmailStep ? !emailIsValid : code.length !== 6)) && styles.disabledButton,
                  pressed && !isLoading && styles.pressed,
                ]}
              >
                <Text style={styles.continueText}>{buttonLabel}</Text>
              </Pressable>

              {isEmailStep ? (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  <SocialProviderButtons
                    onComplete={handleSocialSuccess}
                    onError={() => setError(GENERIC_AUTH_ERROR)}
                    onUnavailable={showExpoGoMessage}
                  />
                </>
              ) : (
                <View style={styles.codeActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isLoading || resendSeconds > 0}
                    onPress={() => void sendCode()}
                  >
                    <Text style={[styles.textButton, (isLoading || resendSeconds > 0) && styles.disabledText]}>
                      {resendSeconds > 0
                        ? "Resend code in 0:" + String(resendSeconds).padStart(2, "0")
                        : "Resend code"}
                    </Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" disabled={isLoading} onPress={useDifferentEmail}>
                    <Text style={[styles.textButton, isLoading && styles.disabledText]}>Use a different email</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function reportAuthFailure(action: string, failure: unknown) {
  if (!__DEV__) {
    return;
  }

  const clerkFailure = failure as { errors?: { code?: string }[] };
  const errorCodes = clerkFailure.errors?.map((error) => error.code).filter(Boolean);
  console.warn(`[auth] ${action} failed`, errorCodes?.length ? { codes: errorCodes } : failure);
}

function SocialProviderButtons({
  onComplete,
  onError,
  onUnavailable,
}: NativeSocialButtonsProps & { onUnavailable: (provider: SocialProvider) => void }) {
  if (!CAN_LOAD_NATIVE_SOCIAL) {
    return <ExpoGoSocialButtons onUnavailable={onUnavailable} />;
  }

  return (
    <Suspense fallback={<ExpoGoSocialButtons onUnavailable={onUnavailable} />}>
      <NativeSocialButtons onComplete={onComplete} onError={onError} />
    </Suspense>
  );
}

function ExpoGoSocialButtons({ onUnavailable }: { onUnavailable: (provider: SocialProvider) => void }) {
  return (
    <View style={styles.socialButtons}>
      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        onPress={() => onUnavailable("Google")}
        style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
      >
        <Image accessibilityIgnoresInvertColors source={require("../../assets/images/google-g.png")} style={styles.googleMark} />
        <Text style={styles.googleText}>Continue with Google</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Continue with Apple"
        accessibilityRole="button"
        onPress={() => onUnavailable("Apple")}
        style={({ pressed }) => [styles.appleFallbackButton, pressed && styles.pressed]}
      >
        <Text style={styles.appleLogo}>{"\uF8FF"}</Text>
        <Text style={styles.appleText}>Continue with Apple</Text>
      </Pressable>
    </View>
  );
}

function LeafMark() {
  return (
    <View accessibilityElementsHidden pointerEvents="none" style={styles.leafMark}>
      <View style={styles.leaf} />
      <View style={styles.leafStem} />
      <View style={styles.leafVein} />
    </View>
  );
}

function Landscape() {
  return (
    <View accessibilityElementsHidden pointerEvents="none" style={styles.landscape}>
      <View style={[styles.ridge, styles.ridgeBack]} />
      <View style={[styles.ridge, styles.ridgeMiddle]} />
      <View style={[styles.ridge, styles.ridgeFront]} />
      <View style={[styles.ridge, styles.ridgeNear]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
    minHeight: 900,
    overflow: "hidden",
    position: "relative",
  },
  brand: {
    alignItems: "center",
    marginTop: 52,
    zIndex: 1,
  },
  leafMark: {
    height: 61,
    position: "relative",
    width: 61,
  },
  leaf: {
    backgroundColor: "#3FA376",
    borderBottomLeftRadius: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 45,
    left: 13,
    position: "absolute",
    top: 1,
    transform: [{ rotate: "-6deg" }],
    width: 34,
  },
  leafStem: {
    backgroundColor: "#3FA376",
    borderRadius: 4,
    height: 29,
    left: 15,
    position: "absolute",
    top: 35,
    transform: [{ rotate: "43deg" }],
    width: 8,
  },
  leafVein: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    height: 24,
    left: 26,
    position: "absolute",
    top: 16,
    transform: [{ rotate: "43deg" }],
    width: 7,
  },
  appName: {
    color: "#151B27",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -1.05,
    lineHeight: 36,
    marginTop: 8,
  },
  tagline: {
    color: "#59616E",
    fontSize: 19,
    fontWeight: "400",
    letterSpacing: -0.45,
    lineHeight: 26,
    marginTop: 4,
  },
  form: {
    marginTop: 78,
    paddingBottom: 48,
    paddingHorizontal: 32,
    zIndex: 1,
  },
  heading: {
    color: "#151B27",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    lineHeight: 39,
  },
  description: {
    color: "#5A626F",
    fontSize: 19,
    fontWeight: "400",
    letterSpacing: -0.4,
    lineHeight: 28,
    marginTop: 19,
  },
  emailAddress: {
    color: "#303846",
    fontWeight: "600",
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D4D8",
    borderRadius: 99,
    borderWidth: 1.5,
    flexDirection: "row",
    height: 68,
    marginTop: 42,
    paddingHorizontal: 23,
  },
  mailIcon: {
    color: "#89919D",
    fontSize: 24,
    lineHeight: 30,
    marginRight: 14,
    marginTop: -2,
  },
  input: {
    color: "#222833",
    flex: 1,
    fontSize: 19,
    letterSpacing: -0.25,
    paddingVertical: 0,
  },
  codeInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D4D8",
    borderRadius: 99,
    borderWidth: 1.5,
    color: "#222833",
    fontSize: 25,
    fontWeight: "600",
    height: 68,
    letterSpacing: 10,
    marginTop: 42,
    paddingHorizontal: 28,
    textAlign: "center",
  },
  error: {
    color: "#A12B23",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 14,
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: "#182231",
    borderRadius: 99,
    height: 68,
    justifyContent: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.45,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    marginTop: 31,
  },
  dividerLine: {
    backgroundColor: "#CDD1D3",
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: "#5E6672",
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
  },
  socialButtons: {
    gap: 14,
    marginTop: 29,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D4D8",
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
  codeActions: {
    alignItems: "center",
    gap: 16,
    marginTop: 24,
  },
  textButton: {
    color: "#182231",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 21,
  },
  disabledText: {
    color: "#8A929F",
  },
  pressed: {
    opacity: 0.82,
  },
  landscape: {
    bottom: -10,
    height: 352,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
  },
  ridge: {
    borderRadius: 999,
    left: "-28%",
    position: "absolute",
    width: "164%",
  },
  ridgeBack: {
    backgroundColor: "#DCF3EC",
    height: 152,
    top: 39,
    transform: [{ rotate: "-12deg" }],
  },
  ridgeMiddle: {
    backgroundColor: "#BDE7DA",
    height: 168,
    top: 104,
    transform: [{ rotate: "9deg" }],
  },
  ridgeFront: {
    backgroundColor: "#91D1C0",
    height: 190,
    top: 161,
    transform: [{ rotate: "-10deg" }],
  },
  ridgeNear: {
    backgroundColor: "#63B6A1",
    height: 174,
    top: 225,
    transform: [{ rotate: "9deg" }],
  },
});

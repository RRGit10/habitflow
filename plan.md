# Habit Tracker v1 — Expo native implementation plan

## Product summary

Build a private iOS-first beta for 5–20 busy working professionals building 1–5 wellness habits. The core loop remains: create habit → set a reminder → receive a nudge → one-tap check-in → see progress.

The client is the existing Expo SDK 57 / React Native / Expo Router app. Clerk is the sole identity provider and Clerk `user.id` is the identity stored in app data. Supabase is the PostgreSQL and server-function backend.

### V1 scope

- Email code is the required first authentication method. After a preprovisioned user verifies that same email, Google and Apple can be linked as returning sign-in methods; no passwords, phone authentication, guest mode, or public sign-up UI.
- Preprovisioned, restricted beta users only; TestFlight email delivery is separate from app authentication.
- Up to seven active habits, warning at five; daily, selected-weekday, and every-N-day schedules; one required reminder per habit.
- Daily completion, undo-today, schedule-aware streaks, completion rates, and a per-habit heatmap.
- Offline cached app data and queued check-in/undo operations.
- One mutual accountability partner, aggregate sharing by default, optional per-habit sharing.
- Account deletion, a concise privacy note, error monitoring without PII, and feedback email.

Explicitly deferred: AI coaching, chat, groups, target-count behavior, multiple daily check-ins, habit notes, email reminders, partner notifications, real-time collaboration, Android/Desktop release, data export, and advanced analytics.

## Expo reconciliation

| Earlier PWA decision | Expo decision | Status |
| --- | --- | --- |
| Install guide: Safari Add to Home Screen | Expo Go for Phase 1; later install an EAS development build or TestFlight build. | Changed |
| Web Push / VAPID / service worker | Use `expo-notifications` with APNs via Expo Push Service. There is no service worker or VAPID in the native app. | Dropped/changed |
| IndexedDB and Cache Storage | Use `expo-sqlite` for a cached data store and persistent outbox. Key data by Clerk `user.id`; clear it on sign-out or deletion. | Changed |
| Browser-cookie session handoff | Clerk Expo with SecureStore token cache. | Changed |
| Clerk invitation / Universal Links | Dropped for v1. Distribute TestFlight access separately and preprovision approved users server-side. | Dropped |
| Static web hosting / Cloudflare Pages | No client-app hosting. Clerk, Supabase, and EAS remain managed services; an owned Clerk domain is still required for production. | Dropped/changed |
| Native apps out of scope | iOS is the v1 client. Android is deferred. | Changed |
| Reminder dispatch | Server computes due reminders; native client registers an Expo/APNs token and opens the appropriate Expo Router route from a notification. | Changed |
| Account deletion | Server deletes app data and the Clerk user; local SQLite/outbox is cleared on-device. | Changed |

The native tab layout in `src/app/(tabs)/_layout.tsx` remains the iOS tab implementation. There is no web target in v1, so the web-only tab fallback is removed. The remaining `app.json` web metadata is harmless but not a delivery target.

## Authentication and beta access

### Phase 1: sign-in experience

- Use Clerk `useSignIn()` with the email-code API. The app never exposes a public email sign-up flow.
- The screen is a safe-area-aware `KeyboardAvoidingView` plus a scrolling form, so the CTA remains reachable above the iPhone keyboard.
- Collect email, send a six-digit code, verify it, finalize the Clerk session, then route to Home.
- The resend countdown is 30 seconds. Wrong or expired codes clear the field and show a generic retry message.
- Rejection is generic: it never reveals whether an email is approved or has an account.
- The email screen includes Google and Apple controls to match the design. In Expo Go they deliberately say the provider is available in the full app build; the native modules are never loaded there.
- In a development or release build, Clerk native Google and Apple flows run. A user must first have completed email-code verification for their preprovisioned email. Restricted mode must reject every unapproved provider attempt with the same generic error. Apple Hide My Email is unsupported because its relay address cannot safely match an allowed email.
- App configuration contains only `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The Clerk secret key is server-only and must never appear in the app, EAS public environment, or source control.

### Phase 2: restricted mode and provisioning

Before implementation, manually validate that the Clerk Hobby instance supports Restricted access and this exact path:

1. In Clerk Dashboard, turn on Restricted access and ensure email-code sign-in is enabled.
2. Manually create an approved user with the email identification state **reserved** and unverified.
3. In the Expo app, verify that this email receives and completes email-code sign-in.
4. Try a different email in the app and verify it cannot create an account or complete sign-in; the app must show only its generic rejection copy.
5. After the approved email completes email-code verification, test Google and Apple with that exact provider email. Verify the same Clerk user is used.
6. Try an unapproved Google account, an unapproved Apple account, and Apple Hide My Email. None may create or finalize a session; each must show only the generic rejection copy.

If that test fails, stop Phase 2 and choose between a Clerk paid allowlist, TestFlight-only manual Clerk users, or a different server-side admission design.

The selected implementation is **Restricted + preprovisioned users**:

1. A server-only `provision-allowed-user` Supabase Edge Function normalizes and inserts the approved email into `allowed_emails`.
2. It requires a provisioning-admin secret held only by a trusted operator or CI; the Expo app never receives or invokes it. It validates the secret before accessing Supabase service-role credentials or Clerk's backend key.
3. It creates the Clerk user with a reserved email and private beta metadata. The email remains unverified until its first successful email-code sign-in.
4. `clerk-webhook` verifies every Svix webhook signature with `CLERK_WEBHOOK_SIGNING_SECRET`, rejects failed/replayed signatures, and performs only idempotent synchronization. A webhook is not the synchronous authorization gate.

## Data, offline, and privacy

- Supabase data uses Clerk text user IDs (`user_…`), never `auth.users` UUID references. RLS compares the Clerk JWT `sub` to owner IDs.
- SQLite holds cached Home, habit details, stats, partner snapshot, and an outbox for check-in/undo. Network is still required for sign-in, habit edits, reminder changes, partner changes, and deletion.
- Check-ins are optimistic, use a unique client mutation ID, and resolve conflicts by latest client timestamp with a server tie-breaker. A unique `(habit_id, scheduled_local_date)` prevents duplicate completions.
- Sign-out, a different authenticated Clerk user, and account deletion erase cached data and the outbox before another account can use the device.
- Account deletion requires typed `DELETE` plus fresh email-code re-verification. A server workflow blocks normal access, removes app data transactionally, calls Clerk's server-side user-deletion API, and uses verified `user.deleted` webhooks for idempotent cleanup.
- Do not log emails, habit names, raw partner data, Clerk IDs, session IDs, authorization headers, codes, URLs, or notification payloads. Error monitoring has PII and replay disabled.

## Feature decisions retained from the product specification

| Area | Decision | Expo status |
| --- | --- | --- |
| Habits | Name, archive/restore, future-ready `target_count`, schedule revisions, one reminder. | Unchanged |
| Schedules | Daily, weekdays, and every N days anchored to an editable start date; future changes do not rewrite history. | Unchanged |
| Check-ins | One completion per due day, undo only today, owner-timezone date plus UTC action timestamp. | Unchanged |
| Streaks/statistics | Schedule-aware individual/aggregate streaks and rolling rates; calculate from records rather than a stats table. | Unchanged |
| Heatmap | 30-day per-habit heatmap. | Unchanged; first scope cut if schedule slips |
| Partner | Exactly one partner, privacy-preserving aggregate projection, optional named-habit sharing, code-based invite, no realtime. | Unchanged; invite link becomes an in-app code only |
| Offline | Cached data, visible stale partner snapshot, persistent check-in/undo outbox. | Changed to SQLite |
| Reminders | One due-habit reminder at local time; group simultaneous reminders; never auto-complete. | Changed to Expo/APNs |
| Notification denial | Leave reminder configured, guide user to Settings, and retain in-app due banner. | Unchanged |
| Deletion | Self-service server-side app-data and Clerk-user deletion. | Changed implementation, unchanged intent |

## Testing matrix and build boundaries

| Capability | Expo Go on iPhone | EAS iOS development build | TestFlight |
| --- | --- | --- | --- |
| Sign-in UI, email code, safe area, keyboard scrolling, native tabs, Home UI | Yes | Yes | Yes |
| Google/Apple button layout and Expo Go availability message | Yes | Yes | Yes |
| Real Clerk Google sign-in/linking | No | Required | Yes |
| Real Clerk Apple sign-in/linking | No | Required | Yes |
| Clerk SecureStore sessions and routine API/RLS work | Yes | Yes | Yes |
| SQLite cache/outbox | Yes | Yes | Yes |
| Local notifications scheduled by the app | Yes | Yes | Yes |
| Remote push token, APNs delivery, background/notification-open routing | No | Required | Yes |
| Final entitlement/config-plugin behavior and native deep-link validation | Not a release-quality test | Required | Yes |
| External tester distribution | No | Ad hoc registered devices only | Yes |

Remote notifications are unavailable in Expo Go; local notifications remain testable there. Use Expo Go until a native capability or app-config change needs a development build. When that point arrives, create one EAS development build, test it thoroughly, then use JavaScript fast refresh and EAS Update where appropriate rather than rebuilding for ordinary TypeScript/style edits.

### Cloud-build workflow (no local Xcode)

- Local development needs Node.js **22.13+** for Expo SDK 57. The current local Node 20.19.1 is below the SDK 57 minimum and must be upgraded before relying on the toolchain.
- EAS CLI currently supports Node `^20.18.3 || >=22.0.0`; use `npx eas-cli@latest` with Node 22.13+ to satisfy both the CLI and Expo SDK.
- Expo/EAS does not specify a minimum macOS version for cloud-build use. Your computer only needs to run Node 22.13+ and a terminal/browser. EAS compiles iOS on Expo's cloud macOS workers, so no local Xcode, Simulator, CocoaPods, or USB installation workflow is required.
- The first cloud build requires an Expo account, `npx eas-cli@latest login`, EAS project configuration, a final unique iOS bundle identifier, and Apple Developer credentials. The iPhone is registered using the EAS device-registration link/QR code.
- A paid Apple Developer Program membership is required for EAS iPhone development builds because they use ad hoc signing. It is also required for TestFlight, but it is the same $99/year membership—not a second fee.
- Do not create a development build until the final iOS bundle identifier is approved. Changing it later creates a new Apple App ID, signing/APNs identity, and TestFlight app; existing installs cannot update seamlessly to it.

### EAS Free plan and timing

- Current Free plan: up to 15 iOS and 15 Android builds per month, low-priority queue, one macOS build concurrently, and a 45-minute build timeout.
- Expo says small builds often start within a few minutes, but Free has no queue-time guarantee. Plan 30–90 minutes for a normal first-build attempt and allow more during busy periods; do not schedule a same-hour test around it.
- New or renewed Apple memberships can take 24–72 hours before a newly registered ad hoc device becomes usable. This is an Apple processing delay, not a local-Xcode problem.

## Delivery phases and review gates

1. **Phase 1 — current:** email-code UI, safe-area/keyboard scrolling, generic error states, Google/Apple design controls with Expo Go safety guards, environment cleanup, native-only tab cleanup, Expo reconciliation plan, lint/typecheck, and Expo Go iPhone UI test. Stop for review.
2. **Phase 2:** perform the Restricted-mode manual validation above. Only if it passes, add server-only provisioning, verified Clerk webhooks, and Clerk/Supabase schema/RLS work. Stop for review.
3. **Phase 3:** add SQLite cache/outbox and `expo-notifications`. Before the first EAS iOS development build, confirm the final bundle identifier and Apple Developer membership. Build in EAS cloud and test remote push on the physical iPhone.
4. **Phase 4:** account deletion, privacy/security hardening, TestFlight configuration/submission, two-device manual test matrix, and beta release review.

## Timeline, cost, and assumptions

- Estimated delivery remains **about five weeks**. Replacing a local Xcode upgrade with EAS does not reduce the native testing work; it replaces it with cloud-build, Apple credential, device-registration, and queue time. The earlier 5–7 calendar-day build/TestFlight allowance remains reasonable once Apple membership is active. If enrollment or the first device registration starts from zero, reserve an additional 1–3 calendar days for Apple processing and build retries.
- Apple Developer Program: **$99/year**. It becomes necessary at the first EAS-signed physical-iPhone development build for remote push testing; TestFlight uses that same membership later.
- EAS: Free tier for the current beta, subject to the build limits above.
- Clerk Hobby: $0 while its limits and required authentication features remain sufficient.
- Supabase: Free for development/private testing, then **$25/month** for Pro when reliable daily service is required.
- Recurring operating cost once Supabase Pro is needed is about **$33.25/month** when the Apple fee is amortized, before a domain. This is about $3.25/month above the ~$30/month target.
- If the timeline slips, cut the **heatmap first**, then the **every-N-days schedule**. Do not cut authentication security, check-in correctness, offline safety, reminder privacy, partner privacy, or deletion.

Assumptions: adult US beta users; no medical claims; iOS first; network availability required for sensitive writes; owned domain configured for production Clerk; no public launch in v1; no native build is initiated without a confirmed bundle identifier.

## Sources to re-check before each native phase

- [Expo SDK 57 compatibility](https://docs.expo.dev/versions/v57.0.0/)
- [Development builds with EAS](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Expo push notification setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo pricing](https://expo.dev/pricing)
- [Clerk access restrictions](https://clerk.com/docs/guides/secure/restricting-access)
- [Clerk reserved email creation](https://clerk.com/docs/reference/backend/user/create-user)
- [Clerk webhook verification](https://clerk.com/docs/guides/development/webhooks/overview)

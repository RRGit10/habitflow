# Habit Tracker v1 — implementation plan

## Product decisions

Build a private, invite-only US beta PWA for 5–20 busy working professionals building 1–5 wellness habits.

The core loop is: create habit → set reminder → receive nudge → one-tap check-in → see streak/progress.

In v1:

- Email one-time-code accounts, with a manual beta email allowlist.
- Up to 7 active habits; warn at 5.
- Daily, selected-weekday, and every-N-days schedules.
- One required reminder time per habit.
- Daily completion, undo-today, schedule-aware streaks.
- Per-habit 30-day heatmap plus 7/30-day completion rates.
- Offline cached experience plus queued check-ins/undo.
- One mutual accountability partner, invite code/link, aggregate completion/streak sharing by default, optional per-habit sharing.
- Account deletion, basic privacy note, error monitoring, and feedback email link.

Explicitly deferred: AI coaching, chat, groups, target-count behavior, multiple daily check-ins, habit notes, email reminders, partner notifications, real-time collaboration, native apps, public launch, Android/Desktop support, data export, and advanced analytics.

## Platform and architecture

Use a static, web-first React PWA. Do not use the obsolete Expo/mobile instructions in the existing `AGENTS.md`.

- React 19.3.1, TypeScript strict, Vite 8.3.4, `vite-plugin-pwa` 2.0.0 with a custom `injectManifest` service worker.
- Node 22.12+ and npm.
- Supabase for Postgres, Auth, Row Level Security, REST data access, Edge Functions, and scheduled jobs.
- Cloudflare Pages for static hosting and Git-based deploy previews.
- Supabase email OTP with custom Resend SMTP; Supabase’s default mail sender is unsuitable for beta delivery. [Supabase SMTP docs](https://supabase.com/docs/guides/auth/auth-smtp), [Resend pricing](https://resend.com/pricing)
- `@supabase/supabase-js` 2.117.1 and `@supabase/ssr` 0.12.7. Use the browser cookie client so an authenticated Safari session can transfer when the user adds the site to the Home Screen.
- `@block65/webcrypto-web-push` 2.0.0 in Edge Functions for VAPID web-push delivery.
- `@sentry/react` 11.8.0 for scrubbed error reporting only; no analytics, session replay, or PII.

Use Supabase RLS for routine owner-scoped reads/writes. Use Edge Functions or SQL RPCs for sensitive workflows: invite acceptance, partner-status projections, deletion, notification subscription handling, and reminder delivery.

The iPhone target is iOS 17.2+ installed as a Home Screen web app. Safari browser tabs cannot receive web push; installed web apps can, after the user grants permission. [Apple web-push documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers?language=objc) The iOS 17.2 Home Screen flow transfers cookies but not local storage, so first launch after installation must re-fetch server data while retaining an authenticated cookie session. [WebKit Safari 17.2 notes](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)

## Core user experience

### Onboarding and authentication

1. User enters an allowlisted email address and receives a one-time code.
2. On first sign-in, collect required display name (2–30 characters) and auto-detected IANA timezone.
3. User creates a first habit, chooses schedule and reminder time, then saves.
4. Only after the first habit and reminder are confirmed, show Home Screen installation guidance and ask for notification permission.
5. Returning users land on Home with today’s due habits and streaks.

Do not expose whether an email is allowlisted. Enforce the allowlist in a Supabase Before User Created Auth Hook, not solely in the client. [Supabase hook documentation](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook?language=sql&queryGroups=language)

### Habit management

- Habit fields: name, active/archived state, default `target_count = 1`, schedule, reminder time, optional partner-share toggle.
- Supported schedules: daily; selected weekdays; every N days anchored to an editable start date.
- The suggested default reminder is 9:00 AM, but it must be explicitly confirmed.
- A second habit in the same creation session inherits the most recently selected reminder time if available.
- Editing schedule/reminder takes effect on the next local day; history is never recalculated.
- Archive immediately removes the habit from Home, reminders, and partner visibility while preserving private history and allowing restoration.

### Daily check-ins and stats

- Home is optimized for 1–5 habits: one tap marks a due habit complete, with an undo option only for today.
- A check-in records the user’s profile-timezone local scheduled date at tap time, plus a UTC action timestamp.
- A missed eligible day resets the individual habit streak. Non-scheduled days do not extend or break it.
- Overall shared streak advances only on eligible days where all active due habits are complete; no-due days are skipped.
- Per-habit stats: current streak, longest streak, 30-day heatmap, rolling 7-day and 30-day completion rate.
- Calculate stats from check-in records and historical schedule revisions; do not materialize a stats table in v1.

### Reminders and web push

- One reminder per incomplete, due habit at its configured local time.
- If several habits are due at the same time, send one combined notification.
- An individual notification opens a focused habit check-in route; a combined notification opens Home filtered to due habits.
- Notifications never auto-complete a habit.
- Notification permission denial/blocking leaves the reminder configured, shows Settings remediation, and falls back to the in-app due banner.
- Expired subscriptions are removed on permanent push failure; transient failures are logged once without retry loops.
- Scheduled reminder dispatch runs every minute through Supabase Cron and an Edge Function. [Supabase scheduled-function guidance](https://supabase.com/docs/guides/functions/schedule-functions)

### Accountability partner

- Each user may have exactly one active or pending 1:1 partnership.
- Invite via a random, one-time code/link, expiring after seven days and revocable by the inviter.
- Partner identity is display-name only; never reveal email.
- Default view: owner’s `completed / eligible today` and overall streak.
- Owner may opt individual active habits into named sharing; off by default.
- Never expose unshared habit names, notes, history, heatmaps, completion rates, or archived habits.
- Either partner can pause, resume, or disconnect. Pause/disconnect immediately hides both directions of sharing; paused periods are not revealed retroactively.
- Partner status refreshes on app open, foreground, and pull-to-refresh. No real-time subscriptions or partner push notifications in v1.
- Offline partner data is visibly labeled stale with its last refresh timestamp.
- “Today” is evaluated in the habit owner’s timezone.

### Offline behavior

Allow offline:

- Cached Home, habit details, stats, and last-known partner status.
- Check-in and undo-today operations.

Require network for:

- Sign-in.
- Habit creation/edit/archive.
- Reminder changes.
- Partner changes/invites/sharing.
- Account deletion.

Use IndexedDB for cached server data and a persistent outbox. Check-ins update optimistically, then sync with a unique client mutation ID. The database remains source of truth once sync succeeds.

Conflict rule: latest client action timestamp wins, with a server tie-breaker. A unique `(habit_id, scheduled_local_date)` record prevents duplicate completion records. If the habit was remotely archived/deleted before a queued sync, reject the mutation, purge the stale local item, and never recreate it.

## Data model and access rules

Version all database objects, functions, RLS policies, extensions, and seed data as Supabase migrations.

| Entity | Purpose |
| --- | --- |
| `profiles` | User ID, display name, IANA timezone, timestamps |
| `beta_allowlist` | Normalized approved email, active/revoked state, admin-managed |
| `habits` | Owner, name, active/archived state, future-ready `target_count` |
| `habit_schedule_revisions` | Historical schedule definitions with effective local date |
| `reminder_rules` | One effective local reminder time per habit in v1 |
| `checkins` | One mutable current record per habit and scheduled local date |
| `sync_receipts` | Idempotency receipt keyed by client mutation ID |
| `push_subscriptions` | Endpoint/keys, installation metadata, active/failure state |
| `reminder_deliveries` | De-duplicated sent/skipped/failed/dead delivery audit |
| `partnerships` | Canonically ordered user pair and lifecycle state |
| `partner_invites` | Salted invite-code digest, expiration, revoke/accept state |
| `habit_partner_shares` | Explicit habit-level sharing permissions |

RLS requirements:

- Users can read/write only their own profile, habits, schedules, reminders, and check-ins.
- Partners cannot query another user’s raw habits, schedules, or check-ins.
- Partner data is returned only through a restricted server-side aggregate/projection.
- Allowlist, delivery records, service secrets, and subscription key material are admin/service-only.
- Enforce the active-habit cap and one-partner constraint server-side, not only in the UI.

## Security, privacy, and deletion

Browser-safe configuration:

- Supabase URL and publishable key.
- VAPID public key.
- Sentry DSN.

Server-only secrets:

- Supabase service-role/secret key.
- VAPID private JWK and contact email.
- Resend credentials.
- Sentry source-map upload token.

Do not log habit names, emails, raw partner details, notification payloads, or check-in contents. Configure Sentry with replay disabled, PII disabled, request/breadcrumb redaction, and error-only reporting. Sentry events are dropped when its zero-cost quota is exhausted, so configure alerts separately. [Sentry usage documentation](https://docs.sentry.io/product/stats/)

Deletion must be self-service in Settings, with destructive confirmation. It must immediately:

1. Revoke sessions and remove the Auth user.
2. Delete profile, habits, schedule history, reminders, check-ins, outbox receipts, subscriptions, partnerships, invites, and shares.
3. Remove beta allowlist access.
4. Mark local offline state invalid so it cannot recreate data after deletion.
5. Make the former partner see only a neutral “Your partner has left” state.

The privacy note must accurately state that live data is removed immediately but provider backup retention may temporarily retain residual data. Do not promise a precise backup-erasure period until confirmed in the actual Supabase plan. [Supabase backups documentation](https://supabase.com/docs/guides/platform/backups)

## Delivery sequence

### Week 1 — foundation and highest-risk validation

1. Create the Vite/React PWA shell, routing, strict TypeScript, icons, manifest, custom service worker, and CI checks.
2. Configure Cloudflare Pages production and isolated preview builds; previews must never receive beta Supabase credentials.
3. Initialize local Supabase, migrations, RLS baseline, OTP auth, allowlist hook, Resend SMTP, and cookie-backed session flow.
4. Build profile onboarding, create/edit/archive habit flow, schedule revisions, and active-habit cap.
5. Test Safari sign-in → Home Screen installation → authenticated installed PWA on a real iPhone immediately.

### Week 2 — habit loop, offline, and reminders

1. Implement Home, one-tap check-ins, undo, streak calculations, and per-habit stats.
2. Add IndexedDB cache/outbox, optimistic sync, mutation receipts, conflict resolution, and stale-state UI.
3. Implement reminder rules, PWA push capability detection, subscription flow, cron/Edge reminder dispatch, grouping, and notification click routes.
4. Test background reminder delivery on a physical iPhone; do not treat simulator behavior as proof.

### Week 3 — partner safety and account controls

1. Implement partnership lifecycle, invite codes, partner projection endpoint, explicit habit sharing, pause/resume/disconnect, and cache refresh behavior.
2. Add archive-reminder suppression, account deletion, offline tombstone handling, privacy note, feedback `mailto:` link, and Sentry scrubbing.
3. Build internal SQL operational views for active users, completion health, reminder attempts, and notification-open-to-check-in conversion without third-party analytics.

### Week 4 — release hardening

1. Run RLS, auth-hook, sync, reminder, schedule/timezone, deletion, and partner-privacy integration tests against local Supabase.
2. Validate migration reset, backup export, and restore rehearsal before beta data exists.
3. Run the full two-iPhone manual test matrix.
4. Configure provider warning emails and spending limits.
5. Deploy beta only after all required checks pass.

## Acceptance tests

Automated tests must cover:

- Daily, weekday, every-N-day eligibility; schedule revisions; timezone and strict-midnight rules.
- Streaks, aggregate streaks, rates, and heatmap calculations.
- Idempotent offline check-ins, undo, retries, duplicate submissions, and cross-device latest-action-wins behavior.
- RLS isolation, allowlist rejection, habit cap, partner constraints, invite expiration/revocation, and sharing boundaries.
- Reminder suppression for completed/off-schedule habits, grouped notifications, expired subscriptions, and no duplicate delivery.
- Deletion cascade and prevention of stale offline re-creation.

Manual iPhone tests must cover:

- Safari authentication and Home Screen installation handoff.
- Permission timing, denied permission recovery, individual/combined push routes, and Focus-mode graceful fallback.
- Offline open/check-in/undo/reconnect behavior.
- Timezone travel and manual timezone update behavior.
- Partner invite, share/unshare, pause/resume, disconnect, account deletion, and stale-cache labeling.

Definition of done: lint, typecheck, unit and integration tests pass; migrations reset cleanly; two physical iPhones pass the manual flow; no PII reaches Sentry; reminder delivery works from an installed PWA; and beta deployment/backup/monitoring controls are configured.

## Cost and operational defaults

- Cloudflare Pages free tier for hosting. [Cloudflare Pages](https://www.cloudflare.com/developer-platform/products/pages/)
- Supabase Free for private development/beta only; it can pause after inactivity. Upgrade to Supabase Pro before testers depend on daily reminders or before public launch. [Supabase pricing](https://supabase.com/pricing)
- Resend Free within its monthly/day quota for beta OTP mail.
- Sentry error-only project with a zero-dollar cap.
- Target recurring cost: $0 during development/private trial where limits permit; approximately $25/month when Supabase Pro becomes necessary.

## Assumptions

- Beta users are adults in the United States and accept a lightweight wellness product without medical claims.
- The app will use a `pages.dev` hostname initially; a custom domain is optional but required for a polished verified email sender.
- No staging Supabase project is needed for the private beta; local Supabase plus production-like automated tests and isolated mock previews are sufficient.
- The daily dispatch job and actual iPhone push delivery will be tested in the first two weeks because they are the largest technical risk.
- Native iOS/Android apps remain out of scope for v1 and v2 unless PWA retention or push reliability proves inadequate.

## Open risks

- iOS Home Screen installation and notification permission are an onboarding funnel risk.
- Web push is best-effort: device settings, Focus, network conditions, and expired subscriptions can prevent visible delivery.
- Supabase’s before-user-created hook is beta functionality and requires real hosted OTP-flow validation.
- Custom SMTP requires verified domain/DNS setup before inviting real testers.
- The four-week scope is tight. If time slips, cut the heatmap before cutting check-ins, offline sync, reminders, or partner privacy.
- Exact provider backup and Sentry retention settings must be confirmed in the selected accounts before public privacy/legal commitments.

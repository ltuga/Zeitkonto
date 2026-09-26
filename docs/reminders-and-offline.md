# Turnos, notificações e registos sem internet

The app stores planned shifts and per-device Web Push subscriptions in the existing owner-scoped state. Each verified user can enable up to five push devices. Generic entry/exit messages avoid exposing sickness, company or account information on the lock screen. Endpoint destinations are restricted to known HTTPS push providers; redirects are rejected. Push keys are generated once and held in Sites runtime configuration.

## Runtime configuration

- VAPID_PUBLIC_KEY: browser subscription public key.
- VAPID_PRIVATE_KEY: secret, never bundle or commit.
- REMINDER_CRON_TOKEN: secret protecting POST /api/reminders.
- Existing Supabase auth variables remain unchanged.

Supabase project szidhxybypbueiewfidn has pg_cron and pg_net enabled. pg_net is installed in the extensions namespace; public, anon and authenticated roles cannot execute net functions. The dispatcher bearer is stored under zeitkonto_reminder_cron_token in Vault. Job zeitkonto-work-reminders invokes the Site dispatcher every minute using that secret, after deployment. The job can be disabled with cron.alter_job. No employee records or push subscription payloads are copied to Supabase.

The dispatcher checks current stored absences/completed records before sending, with a two-minute delivery window and a unique D1 claim per device/shift/event. A failed HTTP send releases the claim for the next minute. Expired endpoints are suppressed for seven days. Delivery is best-effort, not an exact alarm; internet, device permissions and OS battery policies affect it. An offline entry cannot suppress a reminder until it is synchronized. Notifications use the device language/time zone captured at activation; re-enable after changing them. Calendar ICS exports are independent copies, not subscriptions.

## Offline work

Explicit per-device opt-in caches a public lightweight entry screen and stores only the last active shift, date occupancy, pause policy and an owner-scoped unsent work outbox in this browser. No authenticated HTML or API responses are cached. The offline screen is accessible to anyone using this opted-in device, which is explained before activation. It cannot show balances or book absences. Opening the app online requires normal verified authentication, then merges only this owner's unsent work with version-based concurrency. Existing records are never overwritten by a conflicting outbox. Lost upload acknowledgements are safe to retry. Web Locks serialize tabs. Conflicts preserve the outbox, offer JSON backup and an explicit discard action; sign-out cannot silently discard pending work.

## Verification

Run node --test tests/time-improvements.test.mjs and pnpm exec tsc --noEmit, then the Sites build. Tests cover week/year rotation, overnight reminders, absence suppression, calendar escaping, offline split pauses, retry idempotency, cross-account/conflicting data, and encrypted push payload construction.

Real push receipt requires the user's browser subscription. Enable notifications in Turnos e lembretes, send a test, then create an entry a few minutes ahead and close the app. No actual employee shifts are created by automated tests.

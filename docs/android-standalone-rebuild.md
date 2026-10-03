# Zeitkonto — Android standalone rebuild

Branch: `rebuild/android-standalone`

## Target architecture

`Android app -> Supabase Auth + Data API/RPC`

The production Android client must not depend on Cloudflare, chatgpt.site, or a remotely hosted UI to start. GitHub stores source; Supabase provides authentication/data/sync; Google Play distributes the signed AAB.

## Data safety

- Keep the existing Supabase project `szidhxybypbueiewfidn` and existing user data.
- Existing RLS remains the authorization boundary.
- Use only a Supabase publishable client key in Android. Never embed `service_role`, secret keys, database passwords, signing passwords, or maintenance secrets.
- Keep `main` unchanged until the standalone client passes validation.
- Do not uninstall the existing test app while local unsynchronised data may exist.

## Migration plan

1. Native/local Android shell starts without any hosted website.
2. Supabase email/password authentication and secure local session storage.
3. Direct authenticated call to `public.zeitkonto_sync` for initial state and mutations.
4. Native work-entry, break, vacation, sickness, rest and balance screens.
5. Native calendar and PT/DE/EN/TR resources.
6. Reuse the existing Android geofence/location engine, widget and biometric lock where safe.
7. Offline local queue and deterministic reconciliation through `zeitkonto_sync`.
8. Account recovery/deletion flows and privacy/Data Safety review.
9. API 36 build, lint/tests and physical-device test APK.
10. Production signing/Play App Signing and AAB preparation only after test approval.

## Compatibility

The current database already exposes `public.zeitkonto_sync` to authenticated users. Its private implementation derives the owner from `auth.uid()`, validates mutations, refreshes balances and returns the account snapshot. This is the primary sync boundary for the standalone client.

The legacy Cloudflare/D1 import path and reminder mirror are not part of the standalone runtime. They must not be removed until migration and reminder behavior have been verified.

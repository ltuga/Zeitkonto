# Zeitkonto authentication

Supabase project: szidhxybypbueiewfidn (Zeitkonto, Frankfurt).
App: https://meu-tempo-luis.ltugamatos.chatgpt.site

Implemented: email/password registration and login, email confirmation requirement,
password recovery and change, local-device logout, Portuguese/German/English/Turkish.
Server requests validate access tokens using Supabase /auth/v1/user. Account data
stays in D1 under supabase:<verified user UUID>. No service-role key is used.
The private Sites access gate is still in place. Removing that gate requires an
explicit decision to make the login page publicly accessible.

## Required dashboard setup before email flows can be used

Open https://supabase.com/dashboard/project/szidhxybypbueiewfidn/auth/url-configuration
Set Site URL to https://meu-tempo-luis.ltugamatos.chatgpt.site
Allow redirect URLs:
- https://meu-tempo-luis.ltugamatos.chatgpt.site/
- https://meu-tempo-luis.ltugamatos.chatgpt.site/?auth=recovery

Keep email confirmations enabled. For registration beyond organization member
addresses, configure an authenticated custom SMTP sender in Authentication settings.
The Supabase connector does not expose these Auth configuration mutations; they
have not been performed automatically. Default mail delivery has restrictions.

## Existing entries

After login, the app copies existing D1 entries only when the Sites platform's
trusted identity email matches the verified Supabase email. Original rows stay
intact. Existing Supabase account data is never overwritten by the import.
A different email begins with a separate account. Complete this first login while
the owner-private Sites session remains available.

## Verification

Run node --test tests/auth.test.mjs and TypeScript checking. Tests cover missing,
malformed, invalid, unconfirmed, anonymous credentials, trusted owner derivation,
and provider outage. Build must pass before publication. Signup, confirmation,
recovery, successful real-user login and migration must be verified after dashboard
configuration with the owner's account; no real email was sent during testing.

SDK: @supabase/supabase-js 2.114.0, pinned to an available mature release.
Runtime configuration is managed by Sites: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isPublicSupabaseKey } from '../lib/public-auth-config.ts';

const root = new URL('../', import.meta.url);
const settingsPath = new URL('.cloudflare.settings.json', root);
let settings;
try {
  settings = JSON.parse(await readFile(settingsPath, 'utf8'));
} catch {
  throw Error('Copy .cloudflare.example.json to .cloudflare.settings.json and configure the existing backend. See docs/cloudflare-host.md.');
}
const allowed = new Set(['workerName', 'accountId', 'databaseName', 'databaseId', 'supabaseUrl', 'supabasePublishableKey', 'vapidPublicKey', 'dataMigrationVerified']);
if (Object.keys(settings).some(key => !allowed.has(key))) {
  throw Error('Unexpected setting. Private keys and tokens belong in Cloudflare secrets.');
}
if (!/^[a-z][a-z0-9-]{0,62}$/.test(settings.workerName ?? '') ||
    !/^[a-f0-9]{32}$/.test(settings.accountId ?? '') ||
    !/^[a-zA-Z0-9_-]+$/.test(settings.databaseName ?? '') ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(settings.databaseId ?? '') ||
    settings.databaseId === '00000000-0000-4000-8000-000000000000') {
  throw Error('A real Cloudflare account and existing or migrated D1 database are required.');
}
if (settings.supabaseUrl !== 'https://szidhxybypbueiewfidn.supabase.co' ||
    !isPublicSupabaseKey(settings.supabasePublishableKey ?? '')) {
  throw Error('Use the existing Zeitkonto Supabase project and only its publishable/anon key.');
}
if (!/^[A-Za-z0-9_-]{87}$/.test(settings.vapidPublicKey ?? '')) {
  throw Error('Preserve the existing VAPID public key and its matching private secret.');
}
if (settings.dataMigrationVerified !== true) {
  throw Error('Verify preservation of time_accounts and push_deliveries before preparing production deployment.');
}
const build = JSON.parse(await readFile(new URL('dist/server/wrangler.json', root), 'utf8'));
// Keep the build-generated module rules and compatibility settings. Replace
// the Sites placeholder with a real binding; do not provision an empty database.
const config = {
  name: settings.workerName,
  account_id: settings.accountId,
  main: '../dist/server/index.js',
  compatibility_date: build.compatibility_date,
  compatibility_flags: build.compatibility_flags,
  no_bundle: true,
  rules: build.rules,
  workers_dev: true,
  assets: { directory: '../dist/client' },
  d1_databases: [{ binding: 'DB', database_name: settings.databaseName, database_id: settings.databaseId }],
  vars: {
    SUPABASE_URL: settings.supabaseUrl,
    SUPABASE_PUBLISHABLE_KEY: settings.supabasePublishableKey,
    VAPID_PUBLIC_KEY: settings.vapidPublicKey,
  },
  secrets: { required: ['VAPID_PRIVATE_KEY', 'REMINDER_CRON_TOKEN'] },
  observability: { enabled: true },
};
await mkdir(new URL('.cloudflare/', root), { recursive: true });
const output = new URL('.cloudflare/wrangler.json', root);
await writeFile(output, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
console.log('Prepared ' + fileURLToPath(output) + '. No private secrets were written.');

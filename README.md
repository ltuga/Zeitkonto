# Zeitkonto — estado atual

Segurança/dependências da 0.2.1: [revisão, correções e pendências](docs/security-0.2.1.md), [inventário de todos os avisos](docs/security-0.2.1-dependencies.md). Auditoria: 61 → 4 avisos, zero críticos; não equivale a aprovação para publicação.

Código da aplicação pessoal existente: entrada, saída, pausas, férias, doença, banco de horas, lembretes e localização. A interface principal usa resumos semanais. A noite de domingo pertence à semana seguinte, preservando a data original do registo.

A versão de código atual é **0.2.1**, com o novo ícone e a correção final de foco/scroll do calendário. O Android usa compileSdk/targetSdk 36, AGP 8.10.1, Gradle 8.11.1 e Java 17. A consolidação, os ficheiros recuperados e as verificações estão em [preparação 0.2.1](docs/release-0.2.1.md).

O APK de teste 0.2.1 anteriormente entregue usa targetSdk 35; esta preparação do código não atualiza esse APK instalado. A localização foi confirmada pelo utilizador na versão anterior; a API 36 ainda precisa de testes num dispositivo real. Os lembretes por horário via navegador ainda não estão integrados na versão Android. Não foi criado AAB nem publicada uma versão Google Play.

## Credenciais e ficheiros locais

Copiar `.env.example` para `.env` e preencher os valores no ambiente de execução. O exemplo contém apenas campos vazios. Nunca publicar `.env`, tokens, chaves privadas ou ficheiros de assinatura. A chave pública/publishable do Supabase identifica o projeto e não substitui autenticação nem RLS. As instruções específicas de Android, backend e testes estão em `android/` e `docs/`.

Os ficheiros de compilação, APKs, dependências instaladas e chaves de assinatura não fazem parte do código-fonte. Alguns documentos abaixo descrevem etapas históricas; este resumo indica o estado atual.

---

> Turnos de domingo para segunda contam integralmente para a nova semana de 40h. A data de entrada no calendário é preservada.

> Regra atual: 40 horas semanais, segunda a domingo; só o excedente gera horas extra. Férias/doença justificam tempo sem debitar o banco. Ver `docs/semana-40-horas.md`.

> Interface integral atualizada em 19/09/2026: ecrãs, menu, formulários, login e página offline seguem a referência visual. Alterações locais, sem publicação. Ver `docs/interface-integral.md`.

# Zeitkonto

Aplicação existente de registo de trabalho, pausas, férias e banco de horas, em React/TypeScript, Vinext/Vite, Supabase Auth/Postgres e Cloudflare Workers/D1.

A revisão visual e as regras de 40 horas semanais, incluindo o turno noturno de domingo, foram publicadas. O cliente Android existente está em `android/`. Consultar [backend](docs/supabase-backend.md), [navegação Android](docs/navegacao-android.md) e o [estado atual da 0.2.1](docs/release-0.2.1.md). As referências a versões 0.1.x nos guias antigos são históricas.

Verificações: `pnpm exec tsc --noEmit`, `node --test tests/*.test.mjs`, `pnpm build` e `pnpm lint`. O lint global tem pendências anteriores descritas no relatório. Estas alterações não exigem novas chaves nem novas migrations.

O guia original do projeto segue abaixo para preservar as instruções de infraestrutura. Não fazer push/deploy sem autorização do proprietário.

---

# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Whenever reopening or moving a checkout, run `node <plugin-root>/scripts/configure-execution-profile.mjs` before project commands. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

On managed Linux, use `sites-preview start` only for requested browser QA. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

### Folha de horas — interface semanal

A área Registos abre agora uma folha semanal inspirada nas referências fornecidas: resumo de horas e ausências, objetivo de 40h, navegação de semanas, faixa de segunda a domingo e detalhe diário em diálogo. Criar, editar e eliminar reutilizam os fluxos existentes. A vista mensal permanece numa secção expansível. PT/DE/EN/TR e temas são preservados.

O domingo noturno anterior é identificado separadamente quando pertence à semana contabilística apresentada. Os horários originais não são deslocados no calendário. As pausas apresentam duração total e parte incluída: o modelo atual não conserva os intervalos individuais. Não foi implementado envio de folhas à empresa. Validação: TypeScript, lint dos novos componentes, compilação web e 18 testes existentes de navegação e regras semanais aprovados. A validação visual num telemóvel permanece por fazer.


## Entrada e saída por localização — Android 0.2.0

Implementação opcional Desativado/Semiautomático/Automático, sem turnos obrigatórios. Zona cifrada no Android; eventos importados no sistema existente ao reabrir e sincronizar. Sem novas tabelas Supabase.

Java Android, build web e testes passaram. O APK está preparado sem assinatura; aguarda autorização para reutilizar a chave de testes anterior e ainda exige testes num telefone real. Atualizar o website não instala geofencing nem o widget.

[Documentação, permissões, ficheiros e testes](docs/entrada-saida-automatica.md).

## Segurança e publicação 0.2.1

Consultar [auditoria](docs/security-0.2.1.md), [conta e logout](docs/release-completion-0.2.1.md) e [rascunho de privacidade](docs/privacy-release-draft.md). `/delete-account` usa o Supabase público e D1 `DB` já configurados e as migrations de eliminação existentes. Nunca colocar service_role no cliente.

Logout preserva alterações pendentes, ocultando-as até novo login da mesma conta. Eliminar a conta apaga os seus dados após confirmação e reautenticação. Novas operações nativas exigem APK atualizado e assinado com a chave de testes original; build sem assinatura não é instalável.

## Contacto público

Desenvolvedor: **Ltuga**. Suporte e privacidade: **Ltugamatos@gmail.com**. Página pública `/support`; eliminação em `/delete-account`. Estes dados foram confirmados pelo responsável. A página de apoio não substitui a política de privacidade final, cujas pendências estão no rascunho técnico.

## Privacidade e preparação Google Play (28/09/2026)

Política acessível em `/privacy`, contacto em `/support` e eliminação em `/delete-account`.
As estatísticas são opcionais e verificadas no servidor; as novas alterações a registos de doença pedem consentimento explícito.

- [Ficha Data Safety e confirmações pendentes](docs/google-play-data-safety.md)
- [Roteiro de testes reais Android](docs/android-real-device-tests.md)
- [Relatório da fase](docs/privacy-security-release.md)

Migrations aplicadas: `20260928025114_privacy_reconciliation_consent.sql` e `20260928025253_privacy_rpc_hardening.sql`. A manutenção usa o segredo de cron existente, exclusivamente no servidor; não adicionar service_role ao cliente. O rollback conjunto está em `supabase/rollback/privacy_reconciliation_consent.sql` e requer rollback coordenado da app.

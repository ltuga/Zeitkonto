# Preparação Zeitkonto 0.2.1 — 27/09/2026

## Âmbito e proveniência

Consolidação do projeto existente, sem redesenho, remoção de funcionalidades, deploy web, alterações no Supabase remoto, AAB ou publicação Google Play.

- GitHub main antes da consolidação: `56abddea40898d675bc1572348f9a91ad12af69c`.
- Essa árvore corresponde exatamente aos 271 ficheiros da base local `b93b1ad52694db8776d406ab23b4621a9d9430fb`.
- Última versão local recuperada: `f183437c55c39ff31390ce06757e3f3355a160cd`, incluindo a correção final do calendário.
- APK anteriormente entregue: 0.2.1-test, versionCode 5, pacote `com.ltuga.zeitkonto.test`, targetSdk 35. SHA-256: `e27461c9399780f343d248c359065d3f267404fb7279f4cf06435370a1cbc817`.
- O ícone do código tem os mesmos píxeis do recurso incorporado nesse APK.
- O Android existente é Java/WebView: carrega o website configurado. Um APK não contém todo o código-fonte web; o código Git e o APK foram comparados quanto à versão e recursos verificáveis, sem presumir que o APK substitui o repositório.
- O foco do calendário preserva o nó DOM entre atualizações do relógio e usa `preventScroll`, mantendo navegação por teclado.

## Os 17 ficheiros originalmente diferentes

Esta lista é a diferença entre a main anterior e a versão local 0.2.1, **antes** das alterações de API 36, migrations e documentação desta fase.

1. `android/README.md`
2. `android/app/build.gradle`
3. `android/app/src/main/java/com/ltuga/zeitkonto/MainActivity.java`
4. `android/app/src/main/res/drawable-nodpi/zeitkonto_icon.png`
5. `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
6. `android/app/src/main/res/mipmap-anydpi/ic_launcher.xml`
7. `app/layout.tsx`
8. `app/time-app.tsx`
9. `components/ui/calendar.tsx`
10. `components/zeitkonto/app-navigation.tsx`
11. `components/zeitkonto/leave-calendar.tsx`
12. `public/icons/apple-touch-icon.png`
13. `public/icons/icon-192.png`
14. `public/icons/icon-512.png`
15. `public/icons/icon-maskable.png`
16. `public/manifest.webmanifest`
17. `tests/calendar-focus.dom.mjs`

## Migrations recuperadas

As dez migrations locais foram comparadas com `supabase_migrations.schema_migrations` do projeto existente. O conteúdo SQL corresponde ao histórico aplicado, desconsiderando apenas espaços no início/fim do ficheiro. As seis já presentes foram preservadas; estas quatro estavam ausentes:

- `20260912162930_enable_zeitkonto_reminder_scheduler.sql`
- `20260912181936_isolate_zeitkonto_scheduler_network_extension.sql`
- `20260914010522_self_service_account_deletion.sql`
- `20260914010710_account_deletion_hardening.sql`

**Recuperação de histórico, não novas alterações no servidor.** Não executar novamente estas migrations no projeto existente. A migration histórica de isolamento recria uma extensão; foi preservada tal como aplicada, não executada nesta fase.

A eliminação usa `auth.uid()`, implementação privilegiada no schema privado e wrapper público SECURITY INVOKER. Recuperar estas funções para Git não conclui a interface de eliminação, limpeza de dados do espelho D1 ou página pública exigida para publicação. Validar essas partes na fase de privacidade.

## Ferramentas e reprodução

- Node >=22.13.0; pnpm 11.19.0; dependências web fixadas no `pnpm-lock.yaml`.
- JDK 17; Android SDK Platform 36 (r2 usado na validação), Build Tools 35.0.0.
- AGP 8.10.1 (compatível com API 36) e Gradle 8.11.1; wrapper com checksum.
- `compileSdk 36`, `targetSdk 36`, `minSdk 30`.
- Nenhuma dependência JavaScript de produção foi adicionada; pacote passa a versão 0.2.1.
- Consultar a [compatibilidade oficial do AGP](https://developer.android.com/build/releases/agp-8-10-0-release-notes).

Configurar o ambiente conforme README e `scripts/sites-env.mjs`. `.env.example` só tem campos vazios: Supabase URL/publishable key e campos de notificações. Chaves privadas VAPID e token do scheduler pertencem apenas ao ambiente do servidor. Não usar service_role no cliente. O build requer a configuração existente do serviço Cloudflare; um clone não inclui recursos, dados ou credenciais remotos.

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node --test --test-reporter=tap tests/*.test.mjs
pnpm build
pnpm lint

cd android
./gradlew --no-daemon assembleDebug lintDebug
```

Definir JAVA_HOME e ANDROID_HOME para instalações locais válidas. Instalar SDK e aceitar as licenças pelos meios oficiais. O build debug sem variáveis de assinatura produz um artefacto de validação não assinado para atualização; não é o APK assinado já entregue. A chave original de testes deve ser obtida fora do Git para uma futura atualização instalável. A assinatura de produção permanece fora desta fase.

Teste de regressão DOM (ferramenta temporária, não dependência da aplicação):

```sh
npm install --prefix /tmp/zeitkonto-dom --ignore-scripts --no-audit --no-fund happy-dom@20.8.8
ZEITKONTO_TEST_DOM_MODULE=/tmp/zeitkonto-dom/node_modules/happy-dom/lib/index.js node tests/calendar-focus.dom.mjs
```

Testes Java independentes de emulador, a partir da raiz:

```sh
mkdir -p /tmp/zeitkonto-java-tests
javac -d /tmp/zeitkonto-java-tests \
  android/app/src/main/java/com/ltuga/zeitkonto/{NavigationPolicy,BackPressPolicy,WidgetDestination,GeoEngine}.java \
  android/tests/*.java
for test in NavigationPolicyTest BackPressPolicyTest WidgetDestinationTest GeoEngineTest; do
  java -cp /tmp/zeitkonto-java-tests com.ltuga.zeitkonto.$test
done
```

## Verificações

- Build web: PASS. Aviso de chunk grande permanece.
- TypeScript `--noEmit`: PASS.
- Node: 75/75 testes, zero falhas, zero ignorados.
- Calendário DOM: PASS; cinco atualizações mantêm nó/foco e navegação por teclado sem scroll.
- Android: `assembleDebug lintDebug` PASS, 50 tarefas executadas com AGP 8.10.1/API 36. Artefacto de validação, não AAB.
- Android lint: 0 erros, 6 avisos — quatro atributos XML usados apenas em APIs acima do minSdk, o recurso antigo `ic_clock` não utilizado e o texto `Zeitkonto` fixo no widget. Recursos existentes preservados.
- Ambiente de build: foi usado o aapt2 local dos Build Tools 35.0.0 através de `-Pandroid.aapt2FromMavenOverride`, que gera aviso experimental; a ausência de platform-tools/licença neste ambiente gerou avisos sem impedir o build. Compilador assinalou utilização de APIs deprecated. Não são testes de instalação.
- Java: 52 asserções passaram (17 navegação, 10 Voltar, 9 widget, 16 geofence).
- ESLint: 23 erros e 34 avisos no código; não está aprovado. A pasta ignorada de previews gerados `outputs/` foi excluída do lint, sem suprimir regras do código.
- Pesquisa de padrões de secrets nos ficheiros versionados: nenhum valor de chave privada, JWT ou token privado encontrado. Apenas `.env.example` vazio é versionado; certificados, credenciais e artefactos ficam fora do Git. Esta pesquisa não substitui a auditoria de segurança seguinte.

## Próximas fases e limites

A consolidação de código não significa aprovação para publicação. Continuam pendentes:

1. Segurança e dependências: resolver lint, rever vulnerabilidades conhecidas e compatibilidade das atualizações, sessões/armazenamento, RLS e proteção de passwords.
2. Privacidade e conta: concluir/verificar eliminação ponta a ponta, incluindo D1, página pública, política de privacidade e Data Safety.
3. Testes físicos API 36: edge-to-edge/insets, calendário/teclado, biometria, permissões, notificações, localização em background e reinício. Os testes Java simulados não comprovam funcionamento físico.
4. Preparação AAB: versionCode de distribuição, assinatura guardada fora do Git, configuração Play e testes internos. Nenhum AAB criado nesta fase.

Os ficheiros de ambiente, chaves de assinatura, caches, dependências, logs e builds permanecem locais por desenho; não são código-fonte em falta. Não houve publicação do website nesta consolidação.

## Lint restante por ficheiro

| Ficheiro | Erros | Avisos | Regras |
|---|---:|---:|---|
| `app/auth-shell.tsx` | 3 | 2 | @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect |
| `app/layout.tsx` | 1 | 0 | @next/next/no-sync-scripts |
| `app/time-app.tsx` | 3 | 21 | @next/next/no-img-element, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/purity, react-hooks/set-state-in-effect |
| `components/zeitkonto/app-navigation.tsx` | 0 | 1 | @next/next/no-img-element |
| `components/zeitkonto/duration-input.tsx` | 0 | 1 | jsx-a11y/role-supports-aria-props |
| `components/zeitkonto/geo-map.tsx` | 0 | 1 | @next/next/no-img-element |
| `components/zeitkonto/install-app.tsx` | 3 | 0 | @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect |
| `components/zeitkonto/leave-calendar.tsx` | 0 | 2 | @typescript-eslint/no-unused-vars |
| `components/zeitkonto/shift-planner.tsx` | 2 | 2 | @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/purity, react-hooks/set-state-in-effect |
| `components/zeitkonto/vacation-allowance.tsx` | 1 | 1 | @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect |
| `lib/holiday-label.ts` | 0 | 1 | @typescript-eslint/no-unused-vars |
| `lib/i18n.ts` | 1 | 0 | prefer-const |
| `lib/local-sync.ts` | 1 | 0 | @typescript-eslint/no-explicit-any |
| `lib/offline-work.ts` | 1 | 0 | @typescript-eslint/ban-ts-comment |
| `lib/supabase-state-server.ts` | 1 | 1 | @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars |
| `lib/sync-model.ts` | 4 | 0 | @typescript-eslint/no-explicit-any |
| `lib/time.ts` | 2 | 0 | prefer-const |
| `lib/use-holidays.ts` | 0 | 1 | react-hooks/exhaustive-deps |

# Zeitkonto 0.2.1 — segurança e dependências

Revisão de 27/09/2026. Base confirmada na main: `780a4f2684a8817c8c54017c195fa4a18542eb7e`. Trabalho sobre essa árvore, sem redesenho nem remoção de funcionalidades. Não houve deploy web, AAB, publicação Google Play, mudança de configuração Auth ou migration aplicada.

## Resultado e correções

| Auditoria pnpm | Antes | Depois |
|---|---:|---:|
| Críticas | 2 | 0 |
| Elevadas | 36 | 2 |
| Moderadas | 19 | 1 |
| Baixas | 4 | 1 |
| Total de avisos | 61 | 4 |

Contagens de avisos da auditoria, não de explorações comprovadas. O [inventário](security-0.2.1-dependencies.md) identifica cada aviso, versão, caminho de introdução, uso, aplicabilidade e correção.

- Next 16.2.6 → 16.3.3; eslint-config-next acompanha 16.3.3.
- React, React DOM e React Server DOM Webpack 19.2.6 → 19.2.8, em conjunto para respeitar peers.
- Vite 8.0.13 → 8.0.16.
- Overrides limitados às linhas compatíveis de Babel, baseline-browser-mapping, brace-expansion, browserslist, fast-uri, fflate, image-size, js-yaml, nanoid, postcss, undici, ws e esbuild 0.28.x. Lockfile regenerado; regra existente de idade mínima de pacotes preservada. Não foi usado audit fix nem --force.
- Configuração pública do Supabase rejeita chaves secret/service_role antes de renderizar o cliente. Aceita publishable ou chave legacy anon; não confundir esta validação de configuração com validação de JWT de sessão.
- Logout elimina também a identidade offline. SIGNED_OUT é tratado mesmo sem Internet. Recuperação offline exige que a conta em cache corresponda à sessão retida, em vez de confiar apenas no perfil em cache.
- Respostas assíncronas de localização deixam de ser enviadas à WebView depois de bloqueio, encerramento ou navegação para origem não autorizada.
- Logging do fornecedor de feriados usa mensagem fixa, sem serializar exceções externas.

## Next.js e arquitetura real

A app usa React/Vinext/Vite e o fetch-handler de Vinext em Cloudflare Workers. Não usa next start, Turbopack, servidor Windows, rewrites personalizados, middleware de autorização Next ou Server Actions declaradas pela app. Os imports next/headers e next/navigation são tratados por Vinext.

- [RCE Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36): pressuposto de filesystem Windows ausente no servidor atual. Não foi identificado caminho explorável nesse deployment.
- [RCE AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4): pressupõe o otimizador Next com sharp/libheif. O handler instalado de Vinext usa binding Cloudflare Images ou passthrough, não o otimizador Next. Não há imports next/image na app. Não foi identificado esse caminho explorável em produção.
- Os restantes avisos Next pressupõem handlers de Server Actions, cache, rewrites, middleware ou otimização Next. Esses handlers não são o servidor desta app. Ainda assim, atualizou-se Next para eliminar as versões conhecidamente afetadas do grafo.
- React Server Components participa efetivamente no servidor Vinext, apesar de react-server-dom-webpack constar em devDependencies. O seu aviso de DoS não foi descartado como simples ferramenta de build: foi corrigido.

Estas conclusões são análise de alcance no código/artefacto, não execução de exploits contra produção, e deixam de valer se a arquitetura mudar.

## Avisos que permanecem

| Pacote | Introdução | Motivo / tratamento |
|---|---|---|
| sharp 0.34.5, dois elevados | Miniflare através de Wrangler / Cloudflare Vite plugin | Emulação local de imagens; não incorporado no Worker nem no APK. Correção ≥0.35.4 fica fora do intervalo ^0.34.5 do consumidor. Não forçada sem validar a atualização conjunta do toolchain. Não processar imagens não fiáveis no emulador. |
| esbuild 0.18.20, moderado | drizzle-kit → esm-loader → core-utils | Servidor de desenvolvimento esbuild; esta app usa drizzle-kit para gerar schema, não expõe esse servidor. Correção ≥0.25.0 atravessa várias linhas 0.x. Atualizar o consumidor num passo separado. |
| esbuild 0.27.3, baixo | Wrangler | Servidor dev em Windows; build desta revisão executado em Linux. Correção ≥0.28.1 fora da versão fixada pelo consumidor. Não expor servidores locais à Internet. |

Risco residual limitado a tooling sob estas condições; não são quatro vulnerabilidades remotas comprovadas da app publicada. DevDependencies podem conter código de runtime, pelo que a classificação acima foi feita por caminho de execução, não só pela secção do package.json.

## Secrets e exposição ao cliente

Pesquisa de padrões nos 294 blobs históricos alcançáveis da main inicial: zero correspondências de chaves privadas, JWTs literais, tokens GitHub, Supabase secret ou AWS. Pesquisa no bundle cliente: zero correspondências. Não foram encontrados ficheiros de credenciais versionados; .env.example contém campos vazios. Certificados e builds permanecem ignorados.

SUPABASE_URL, publishable/anon e VAPID_PUBLIC_KEY são públicos por desenho. VAPID_PRIVATE_KEY, REMINDER_CRON_TOKEN e credenciais da infraestrutura são referências server-side, não valores serializados. O guard novo impede uma troca acidental por service_role. A pesquisa não garante ausência de todo o formato possível de secret nem revoga credenciais antigas: não foi encontrada evidência que justifique rotação nesta revisão.

## Supabase, RLS e autenticação

- Nove tabelas public com RLS e FK para auth.users, ON DELETE CASCADE. Duas tabelas privadas também com RLS.
- Work entries, vacations, settings e devices: SELECT/INSERT/UPDATE/DELETE restringidos a auth.uid(); UPDATE inclui WITH CHECK. Deletes diretos criam tombstones para sincronização.
- Profiles: leitura própria e UPDATE apenas de display_name. plan e premium_until não podem ser alterados pelo cliente.
- Subscriptions e saldos: sem escrita direta pelo cliente. Premium deriva de subscrições verificadas; metadata editável pelo utilizador não concede permissões.
- Funções públicas de API são SECURITY INVOKER; implementações privilegiadas no schema privado, search_path vazio, nomes qualificados e verificação de auth.uid(). Admin stats exige presença na tabela privada admins e devolve agregados. Funções de trigger não têm EXECUTE concedido a utilizadores.
- As APIs validam o bearer com /auth/v1/user; rejeitam utilizador anónimo/não confirmado. Não usam um owner enviado pelo cliente como autoridade.
- RPC de eliminação só elimina auth.uid(); cascatas verificadas. Interface, espelho D1, revogação/sessões e página de eliminação continuam para a fase própria. Eliminar a conta não invalida magicamente todos os JWTs já emitidos.
- Security Advisor: permanece apenas Leaked Password Protection Disabled. [Remediação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). A UI exige 12 caracteres, mas não confirma a configuração efetiva de força de password no serviço Auth. Não houve alteração automática de plano/configuração.
- PostgreSQL observado: 17.6. O [changelog Supabase](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) anuncia atualização de segurança 17.11. Confirmar atualização gerida e compatibilidade das extensões; não executar upgrade de base de dados nesta correção de código.

## Testes de isolamento

Executado `supabase/tests/security-isolation.sql` no projeto existente, numa transação com ROLLBACK, com dois UUIDs aleatórios e emails example.invalid criados apenas dentro da transação. Sem envio de email, sem consultar payloads reais, sem alterações persistentes a contas reais.

42 verificações agrupadas passaram: SELECT próprio nas nove tabelas, CRUD próprio e tombstones, bloqueio de INSERT/UPDATE/DELETE cruzados e reatribuição de owner nas quatro tabelas editáveis, bloqueio de Premium/subscription/admin/statistics, eliminação da própria conta com cascatas e preservação da outra conta, bloqueio de eliminação por anon.

São testes do PostgreSQL com SET LOCAL ROLE e claims sintéticas, não logins reais via GoTrue/PostgREST. Não substituem teste ponta a ponta em dois dispositivos. Nenhuma migration nova foi necessária.

## Android API 36

- HTTPS obrigatório, cleartext e mixed content bloqueados, SSL inválido cancelado, trust anchors do sistema.
- WebView debugging desativado, file/content access desativados, cookies de terceiros bloqueados, permissões web genéricas recusadas.
- Navegação limitada ao host exato da app, sem userinfo/portas arbitrárias. Links externos HTTPS com gesto abrem no navegador. Intents/widget usam destinos limitados.
- Apenas launcher Activity exported; receivers de localização, ações e widget não exportados. PendingIntent explícitos e imutáveis, exceto geofence que necessita mutabilidade para o serviço Google.
- Bridge WebMessageListener limitada à origem exata, main frame e estado desbloqueado, com limites/allowlists de mensagens. Corrigida a verificação tardia da resposta de localização. Não usa addJavascriptInterface genérico.
- Backups e transferência de dados excluídos. FLAG_SECURE impede capturas/recents. Biometria forte ou credencial do dispositivo; bloqueio ao sair e regressar.
- GeoStore usa AES-GCM e Android Keystore; sem histórico contínuo de percursos. Notificações privadas e ações com IDs. Permissões de localização/background/notificações/reinício justificadas pela função opcional.
- Não foram encontrados logs nativos de tokens, coordenadas ou payloads. Logs web próprios usam mensagens fixas; não foram inspecionados logs pessoais de produção.
- Consulta OSV das duas dependências Maven diretas (play-services-location 21.3.0, webkit 1.12.1): sem advisories devolvidos. Não é uma certificação de todas as dependências Maven transitivas nem do Android System WebView instalado no telefone.
- Lint sinaliza play-services-location 21.4.0 disponível; não atualizado sem necessidade de segurança demonstrada/teste de geofencing físico.

## WebView, sessão e armazenamento: decisão de risco

| Tema | Estado / decisão |
|---|---|
| Tokens em localStorage da WebView | Persistentes e acessíveis ao JavaScript da mesma origem. Sandbox Android, HTTPS, backups bloqueados e origem restrita mitigam; XSS/origem comprometida continua a conseguir lê-los. Keystore para tokens exigiria um adaptador assíncrono e migração testada: não aplicado automaticamente. Risco residual condicionado a dispositivo íntegro e origem segura. |
| IndexedDB | Dados separados por owner, sem passwords/service_role, mas sem cifra adicional da app. Inclui registos de doença. Biometria não cifra IndexedDB. Recomendado adaptar armazenamento nativo cifrado, com migração/recuperação para não perder pendentes. |
| Continuidade offline | Corrigida associação cache/sessão. Validação local não prova validade atual no servidor; revogação remota só é conhecida quando regressa a ligação. Isto é uma limitação explícita do modo offline. |
| Logout | Limpa credenciais e identidade local mesmo com falha de rede no caminho sem pendentes. Revogação remota best-effort; access token pode durar até expiração. Pendentes locais/geofence continuam a impedir logout para evitar perda: deve existir futuramente uma opção segura de bloquear/sair preservando pendentes isolados, sem os apagar silenciosamente. |
| Biometria | Bloqueio visual/local opcional, não MFA Supabase nem chave de cifra ligada à autenticação. Serviço de localização funciona em background por desenho. Ações das notificações merecem teste em lockscreen; não assumir que o gate visual cobre todo o receiver. |
| Recuperação | Mantido implicit flow compatível com links atuais. Migrar para PKCE/armazenamento nativo requer teste de abertura de email noutro browser/dispositivo e migração; não forçado nesta fase. |
| XSS/CSP | Não encontrados sinks innerHTML/eval na app própria. Não há CSP estrita com nonce verificada. Endurecer CSP exige validar hidratação, mapas, SW e impressão para não remover funcionalidades. |

Não se considera aceitável afirmar que todos os dados estão cifrados pela biometria. Estes limites têm de constar da análise de privacidade seguinte; não foi escrita a política nem Data Safety nesta fase.

## Validação

- Instalação limpa: node_modules anterior retirado do projeto; pnpm install --frozen-lockfile passou, com scripts autorizados pela política existente. Dois avisos de subdependências deprecated esbuild-kit.
- Auditoria antes/depois: 61 → 4, tabelas e caminhos no inventário.
- TypeScript: PASS. Build web Vinext/Vite: PASS, aviso de chunk grande permanece.
- Node: 78 testes passaram (75 existentes + três de segurança). Calendário DOM: PASS após atualização React.
- Java: 52 asserções passaram, testes simulados sem emulador.
- ESLint: 22 erros, 34 warnings; não aprovado. Não se desativaram regras para ocultar erros.
- Android compileSdk/targetSdk 36, AGP 8.10.1: assembleDebug/lintDebug PASS. 0 erros, 7 warnings: quatro UnusedAttribute, um recurso antigo não utilizado, um texto fixo no widget, uma atualização disponível de Play Services Location. Build local usou aapt2 do SDK via override experimental; aviso de platform-tools ausente não impediu build. Sem teste físico de instalação nesta fase.

## Decisão antes da publicação

### BLOQUEIA PUBLICAÇÃO

- Concluir eliminação ponta a ponta (incluindo D1), política de privacidade e Data Safety na fase seguinte.
- Corrigir/verificar disclosure de localização antes da primeira permissão e concluir testes físicos API 36 de login/logout offline, recuperação, biometria, background/reinício e notificações.
- Aplicar e verificar estas correções no ambiente publicado, numa fase de deploy explicitamente autorizada. Alterar Git não atualiza o website nem o APK instalado.

### DEVE SER CORRIGIDO

- Pendências ESLint; proteção de passwords comprometidas e confirmação das políticas Auth; atualização gerida PostgreSQL.
- Resolver os quatro avisos de tooling por atualização compatível dos consumidores; até lá, não expor emuladores nem processar entradas não fiáveis.
- Saída/bloqueio seguro com pendentes e comportamento de ações na lockscreen. A infraestrutura Premium não é autorização de funcionalidades Pro ponta a ponta; confirmar gates antes de vender Pro.

### RECOMENDADO

- Armazenamento de tokens/estado Android com Keystore, teste de migração e perda de chave; CSP/PKCE com validação completa; limites de payload/rate limiting também na API/RPC para reduzir abuso de recursos pela própria conta.
- Pipeline CI com auditoria, testes, lint, verificação de secrets e revisão recorrente de dependências nativas/transitivas.

### OK

- Críticos eliminados do grafo; correções compatíveis testadas; sem secrets encontrados; RLS/grants e isolamento verificados; privilégio Premium/admin não autoatribuível; HTTPS/SSL/bridge/backups nativos protegidos; build web/Android e testes passaram.

## Reproduzir

`pnpm install --frozen-lockfile`, `pnpm audit --json`, `pnpm exec tsc --noEmit`, `pnpm build`, `node --test tests/*.test.mjs`, `pnpm lint`; Android: `cd android && ./gradlew assembleDebug lintDebug`. Requer Node >=22.13, pnpm 11.19.0, JDK17 e SDK36. Teste DOM e Java: comandos em release-0.2.1.md. Executar SQL de isolamento apenas como teste transacional, sem remover o ROLLBACK.

## Lint restante por ficheiro

| Ficheiro | Erros | Avisos | Regras |
|---|---:|---:|---|
| `app/auth-shell.tsx` | 2 | 1 | @next/next/no-html-link-for-pages, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect |
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
| `public/offline-page.js` | 0 | 1 | @next/next/no-location-assign-relative-destination |

## Ficheiros alterados nesta fase

- `README.md`
- `android/app/src/main/java/com/ltuga/zeitkonto/GeoBridge.java`
- `app/api/holidays/route.ts`
- `app/auth-shell.tsx`
- `docs/security-0.2.1-dependencies.md`
- `docs/security-0.2.1.md`
- `lib/auth-server.ts`
- `lib/logout.ts`
- `lib/offline-identity.ts`
- `lib/public-auth-config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `supabase/tests/security-isolation.sql`
- `tests/security-session.test.mjs`

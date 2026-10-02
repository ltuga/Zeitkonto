# Zeitkonto: alojamento HTTPS independente

Branch: `prepare/android-api36-stable-host`. Não publicar na Google Play nem alterar `main`.

Esta aplicação tem servidor Cloudflare Workers, assets e D1. Não publicar apenas `dist/client` no Pages: isso perderia as APIs. O projeto Supabase existente é `szidhxybypbueiewfidn`; preservar contas, tabelas, políticas e migrations.

## Dados e segredos necessários

A base D1 original do Site tem `time_accounts` e `push_deliveries`. Preservar ambas, incluindo os marcadores de contas eliminadas. Há contas antigas que podem ainda ter dados apenas em D1; a sincronização e os lembretes continuam a depender desta base. A base pertence ao alojamento original, não à conta pessoal Cloudflare. Não usar a UUID fictícia gerada pelo build nem substituir a base por uma vazia.

Exportar a base original através do seu administrador e importar a cópia num D1 da conta de destino, ou reutilizar a base existente se a conta tiver acesso. Conferir os totais e conteúdos sem os publicar. Coordenar a passagem para evitar gravações concorrentes na origem e no destino. Guardar exportações fora do git; os payloads contêm dados pessoais. A interface Sites desta sessão permite leitura das tabelas, mas não disponibiliza um export SQL integral.

Preservar o par VAPID existente e `REMINDER_CRON_TOKEN`. Os valores secretos no Sites são ocultados; não podem ser recuperados através da leitura de variáveis. É necessária a cópia original desses segredos ou uma transferência feita pelo administrador. Não trocar o par VAPID silenciosamente: as subscrições existentes dependem dele. Não colocar `service_role`, senhas ou tokens no cliente, no git ou nas configurações públicas.

## Preparar e publicar

1. Autenticar a conta Cloudflare com `pnpm exec wrangler login` num computador com acesso à rede e ao navegador. Não enviar passwords ou tokens no chat.
2. Instalar as dependências com o lockfile: `pnpm install --frozen-lockfile`.
3. Copiar `.cloudflare.example.json` para `.cloudflare.settings.json` (ignorado pelo git). Preencher a conta, o D1 real, o URL e a chave pública do Supabase existente, e a chave pública VAPID existente. Assinalar `dataMigrationVerified` apenas depois de verificar a preservação de dados.
4. Executar `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build` e `pnpm cloudflare:prepare`. A preparação recusa a UUID fictícia, outro projeto Supabase, chaves privilegiadas e campos inesperados.
5. Configurar no Worker os segredos privados através de `pnpm exec wrangler secret put VAPID_PRIVATE_KEY --config .cloudflare/wrangler.json` e `pnpm exec wrangler secret put REMINDER_CRON_TOKEN --config .cloudflare/wrangler.json`. Introduzir os valores no prompt privado. O deploy exige ambos os segredos.
6. Executar `pnpm cloudflare:deploy`. Usa o Worker e assets gerados, um D1 real e as variáveis públicas corretas. Copiar o URL HTTPS efetivamente devolvido pelo Cloudflare; não inventar o subdomínio `workers.dev`.

Para testar a importação num D1 de destino, usar os comandos oficiais `wrangler d1 execute <base> --remote --file <export.sql>`; não executar migrations Supabase nem importar sobre a base original. Verificar `--help` na versão instalada antes de executar.

## Validar antes de alterar o Android

No endereço publicado, verificar `/`, `/privacy`, `/support`, `/delete-account` e assets. As APIs privadas sem autenticação devem devolver 401. Entrar com a conta existente e conferir registos, férias, saldos e configurações; criar uma alteração de teste identificável e confirmar sincronização entre web e telefone. Conferir entrada/saída, turnos noturnos, localização, offline e idiomas.

Adicionar o domínio efetivamente publicado e o URL `/?auth=recovery` aos redirects permitidos no Supabase Auth. Não remover o domínio anterior nesta fase. O IndexedDB, as sessões e subscrições push são por origem: dados locais ainda não sincronizados não passam automaticamente para outro domínio.

Preservar o agendador Supabase existente e atualizar a sua chamada para o novo `/api/reminders`, mantendo o token apenas no servidor. Não criar um segundo agendador ativo. Rever o contacto VAPID em `lib/push-server.ts` após confirmar o novo endereço.

Só depois de validar o endereço e os dados alterar `NavigationPolicy.HOME`, o host exato autorizado e os testes Java correspondentes. Não usar wildcards. Manter `compileSdk 36`, `targetSdk 36`, `versionCode 6`. Executar `./gradlew assembleDebug lintDebug` com JDK 17 e Android SDK 36.

Não desinstalar nem substituir a aplicação existente antes dessa confirmação. Para atualizar depois, usar a mesma assinatura do APK instalado; não contornar uma assinatura diferente desinstalando a aplicação.

## Estado da sessão de 03/10/2026

- Branch remota recuperada no commit `13285aa`; configuração Android 36/36/6 confirmada.
- Supabase existente confirmado `ACTIVE_HEALTHY`; nenhum dado ou migration alterado.
- O domínio original estava ativo, mas `/` e `/delete-account` respondiam HTTP 500. A causa era `lib/account-i18n.ts`: escrevia em `messages.de/en/tr`, embora as traduções sejam indexadas primeiro pela frase. Corrigido para `messages[key] = {de,en,tr}` e protegido por um teste de regressão.
- TypeScript aprovado; 88 testes aprovados; lint sem erros, com 34 avisos preexistentes; build web aprovado. No Worker compilado local, `/`, `/privacy`, `/support` e `/delete-account` devolvem 200; APIs privadas e POST de lembretes sem autenticação devolvem 401.
- Android: `assembleDebug lintDebug` bloqueado no download do Gradle 8.11.1 (`Network is unreachable`). O ambiente tem apenas JRE 17, sem `javac` nem SDK Android detetado; não foi gerado APK nem executado lint Android.
- Correção publicada no Site existente, versão 41, commit de alojamento `1d76f1be866cde335b7396c56372ec589f806f03`, com estado `succeeded`. Mantidos os dados D1 e segredos existentes e o mesmo URL `https://meu-tempo-luis.ltugamatos.chatgpt.site`. Esta recuperação não é a migração para alojamento independente.
- Cloudflare CLI sem autenticação; painel bloqueado por verificação de segurança neste navegador. Não existe novo URL independente publicado ou validado. Login real, sincronização autenticada e testes no telefone continuam por validar pelo utilizador; não foi usada a sua palavra-passe.
- Configuração independente e comandos de publicação preparados. O Android mantém o domínio anterior até validar o destino.

Referências: [Configuração Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/), [segredos](https://developers.cloudflare.com/workers/configuration/secrets/) e [D1](https://developers.cloudflare.com/workers/wrangler/commands/d1/).

# Preparação 0.2.1 — conta, logout e permissões

Base GitHub main: `480389c61fb61ef146629c639bfd9553b879f571`. A fase anterior de segurança está nessa main. A limpeza automática do ambiente removeu a primeira cópia não sincronizada desta fase; alterações reconstruídas sobre a mesma main e novamente verificadas.

## Alterações

- Página pública e link nas definições para eliminação, com confirmação DELETE e nova autenticação. Não aceita user_id/email como autorização no corpo do endpoint.
- Limpeza atómica do mirror D1 e marca pseudónima; pedidos atrasados não recriam dados. Reutiliza RPC/migrations Supabase existentes; não há nova migration nem alteração a dados reais.
- Logout preserva dados pendentes, mas oculta-os até autenticação da mesma conta. O fallback offline verifica sessão/owner antes de ler qualquer outbox.
- Ações nativas suspensas no logout; novo comando de limpeza da própria conta após eliminação confirmada.
- Explicação PT/DE/EN/TR de localização precisa e background antes do pedido de permissão Android.
- Rascunho de inventário de privacidade e Data Safety, sem inventar dados legais do responsável.

## Validação da cópia recuperada

Instalação frozen concluída; TypeScript sem erros; 82 testes Node passaram; build web passou. ESLint mantém 22 erros e 34 warnings anteriores, sem novos erros nos ficheiros adicionados. Android/API36 assembleDebug e lintDebug passaram (0 erros, 6 warnings: quatro atributos não usados, um recurso não usado e um texto fixo). As 52 asserções Java também passaram; não são testes de instrumentação Android. Nenhum AAB ou certificado de produção criado.

## Pendências antes de publicar na loja

- Política de privacidade final, contacto e retenção; Data Safety e declaração de localização.
- Teste ponta a ponta com conta descartável da eliminação Auth/Supabase/D1 e limpeza nativa, incluindo falhas de rede. Os testes automáticos usam SQLite e isolamento SQL transacional; não demonstram o fluxo completo num dispositivo real.
- Reconciliação D1 para eliminações realizadas diretamente pela RPC/admin, fora do novo endpoint (ver rascunho de privacidade).
- Confirmar/ativar leaked-password protection e atualização PostgreSQL no painel Supabase; não existe operação disponível nesta ligação para as alterar.
- Testes físicos API36: permissões recusadas, background/reinício, biometria, logout offline, recuperação e troca de conta.
- Resolver lint antigo e rever riscos residuais WebView/IndexedDB e quatro advisories de tooling descritos na auditoria anterior.
- Reutilizar a chave de testes original para APK instalável; preparar assinatura de produção de forma segura posteriormente. Atualizar o site não atualiza o código nativo instalado.

As novas rotas só ficam disponíveis online após deploy confirmado. Nenhuma publicação na Google Play foi efetuada.

## Ficheiros alterados

- `README.md`
- `android/app/src/main/java/com/ltuga/zeitkonto/GeoBridge.java`
- `app/api/account/delete/route.ts`
- `app/api/reminders/route.ts`
- `app/auth-shell.tsx`
- `app/delete-account/page.tsx`
- `app/delete-account/portal.tsx`
- `app/time-app.tsx`
- `docs/privacy-release-draft.md`
- `docs/release-completion-0.2.1.md`
- `lib/account-deletion.ts`
- `lib/account-i18n.ts`
- `lib/auth-server.ts`
- `lib/supabase-state-server.ts`
- `public/offline-core.js`
- `public/offline-page.js`
- `public/sw.js`
- `tests/account-deletion.test.mjs`

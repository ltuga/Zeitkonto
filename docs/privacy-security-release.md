# Privacidade e segurança — 28/09/2026

Base GitHub main: `b2a49f56594e0f3224a9edcb607945ef190758e3`. Árvore inicial do Site idêntica, commit `22b02dede2e397b529b94abf24f52ce5f0421cb7`.

## Implementado

- Página pública `/privacy`, ligações no contacto partilhado, suporte/login/definições.
- Ficha Data Safety baseada nos fluxos reais, sem submissão à Google Play.
- Analytics desligado por defeito, consentimento versionado sincronizado e verificado no servidor; apagar estatísticas apenas da própria conta, preservando subscrições push.
- Consentimento explícito antes de criar/alterar registos de doença. Dados antigos não são retroativamente declarados consentidos.
- Histórico de alterações deixa de conservar o conteúdo dos registos apagados no fluxo da app.
- Reconciliação paginada das cópias D1 com contas Auth eliminadas, inclusive por RPC/admin; segredo existente do cron, restrito ao servidor, sem service_role.
- Marcas pseudonimizadas de eliminação expiram em 30 dias. Marcas antigas sem timestamp recebem janela inicial de 30 dias.
- Funções sensíveis SECURITY DEFINER em schema privado, wrappers públicos SECURITY INVOKER, grants mínimos e search_path fixo. Manutenção anónima exige segredo de capacidade; não revela existência de contas sem ele.
- Correções de tipagem, efeitos React e script de tema; sem redesenho da interface.

Migrations já aplicadas: `20260928025114_privacy_reconciliation_consent.sql`, `20260928025253_privacy_rpc_hardening.sql`. Rollback conjunto incluído, não executado. Nenhum utilizador real eliminado nos testes.

## Validação executada

| Verificação | Resultado |
|---|---|
| TypeScript | Passou |
| Build web Vinext/Vite | Passou |
| Testes Node | 87 passaram, zero falhas |
| Lógica Java Android | 52 verificações passaram; não instrumentação |
| Isolamento Supabase | 42 verificações passaram em transação com rollback |
| Privacidade Supabase | Cinco verificações passaram; segredo, consentimento e isolamento da limpeza |
| Lint | Zero erros, 34 avisos (antes: 22 erros, 34 avisos) |
| Auditoria dependências | Quatro avisos: zero críticos, dois elevados, um moderado, um baixo; ferramentas de build já documentadas em security-0.2.1-dependencies.md |
| Android real | Não executado: ADB sem dispositivos |
| Build Android API36 desta fase | Não reexecutado; código nativo não alterado, sem SDK completo disponível |
| Instalação/assinatura APK | Não realizadas nesta fase |

Avisos do build: proxy do ambiente e classificação estática incompleta de rotas no Vinext. Não significam falha de compilação. Sem novas dependências de aplicação. Lint restante inclui unused-vars, dependências de hooks e avisos de imagens/navegação; não escondido por desativação global.

## BLOQUEIA PUBLICAÇÃO nesta preparação

- Executar o roteiro físico Android, incluindo atualização, permissões, localização, notificações, biometria, logout offline, sincronização e eliminação. O acesso ADB está vazio.
- Confirmar identificação jurídica além da marca Ltuga, contratos/transferências dos fornecedores e retenção efetiva de backups/logs para finalizar revisão da política e respostas de partilha do Data Safety.
- Ativar proteção contra passwords comprometidas no Supabase: advisor continua a indicar desativada. A ferramenta ligada não expõe a alteração desta opção Auth.
- Rever atualização gerida PostgreSQL: projeto reporta 17.6.1.166; atualização de segurança para 17.11 anunciada pelo fornecedor não aplicada nesta fase.
- Validar integração completa Cloudflare cron → RPC Supabase após publicação com conta de teste; SQL e lógica SQLite foram testados separadamente. Falha no serviço de reconciliação interrompe o envio nessa execução para não enviar lembretes de contas eliminadas.

## DEVE SER CORRIGIDO / VALIDADO

- Rever base legal dos registos de doença legados e concluir tradução da política para idiomas de distribuição.
- WebView/IndexedDB: sessão/cache não cifrados por cofre próprio da app; biometria não cifra todo o armazenamento. Proteção do sistema, sandbox e HTTPS não eliminam risco de dispositivo comprometido. Fazer avaliação de risco antes de tratar como risco residual aceite.
- Validar divulgação destacada de localização em background e declaração Health apps na Play Console.
- Riscos de build sharp/esbuild: ver relatório de dependências; não executar fix --force nem substituir ferramentas principais sem ensaio.

## RECOMENDADO

Resolver os 34 avisos de lint; ensaiar restauração de backups; documentar prazos/contratos de cada fornecedor e monitorizar erros de manutenção sem payloads pessoais.

## OK no âmbito verificado

RLS/isolamento e bloqueio de autoatribuição Premium; testes sem alteração permanente de dados reais; secrets de manutenção só no servidor; política acessível por rota sem login; ausência de SDK publicitário/pagamento real; consentimento e limpeza de analytics testados. Nenhum AAB criado, nenhuma publicação na Google Play.

# Zeitkonto — backend e sincronização

Implementação de 13-09-2026. Supabase é a fonte principal dos dados; Auth existente foi preservado. O código da app continua alojado em Sites. O cliente usa apenas a publishable key e o JWT do utilizador. Nenhuma service_role key faz parte do cliente, PWA ou pacote Android.

## Tabelas públicas

Todas possuem RLS e referência a auth.users; índices começam por user_id (profiles usa id).

| Tabela | Campos principais |
|---|---|
| profiles | id, display_name opcional, created_at, updated_at, last_seen_at, app_version, plan, premium_until |
| work_entries | user_id, id, payload, work_date, clock_in, clock_out, pause_minutes, worked_minutes, credited_minutes, overtime_minutes, target_minutes, created_at, updated_at, deleted_at, mutation_id |
| vacations | user_id, id, payload, vacation_date, kind, duration_mode, duration_minutes, created_at, updated_at, deleted_at, mutation_id |
| time_balance | user_id, initial_minutes, worked_overtime_minutes, used_minutes, reserved_minutes, current_minutes, available_minutes, as_of_date, timestamps |
| vacation_balance | user_id, year, entitlement_days, used_days, reserved_days, available_days, as_of_date, timestamps |
| settings | user_id, id (chave), payload, timestamps, deleted_at, mutation_id; inclui turnos planeados, configurações, saldo inicial, direitos anuais e turno ativo |
| app_devices | user_id, id, payload de push privado ou dispositivo, platform, app_version, last_seen_at, timestamps, tombstone |
| subscriptions | id, user_id, plan, billing_period (monthly/annual/lifetime), status, provider, product_id, expires_at, verified_at, timestamps |
| app_events | id, user_id, event_name enumerado, device_id aleatório, plataforma geral, app_version, event_day, timestamps |

`vacations` mantém também descansos compensatórios e doenças, distinguidos por `kind`, preservando o modelo anterior. O payload preserva todos os campos anteriores, incluindo notas privadas, pausa incluída, férias por horas e meio dia oferecido pela empresa. `worked_minutes` exclui pausas; `credited_minutes` inclui a pausa remunerada. Os saldos são derivados, não servem como prova de remuneração.

## RLS e permissões

- Público/anon: sem acesso às tabelas ou funções da app.
- Dados pessoais editáveis: SELECT/INSERT/UPDATE/DELETE apenas quando auth.uid() = user_id. UPDATE usa USING e WITH CHECK. Eliminação gera tombstone para impedir ressuscitação por cópias offline.
- profiles: SELECT do próprio perfil e UPDATE apenas da coluna display_name. A criação é automática via trigger; last_seen_at e Premium são escritos pelo servidor.
- subscriptions, time_balance, vacation_balance e app_events: leitura própria, escrita apenas pelos mecanismos do servidor. Isto evita compra fictícia, autoatribuição de Premium e adulteração dos campos derivados/telemetria. As operações pessoais da app continuam disponíveis pelos RPCs autenticados.
- zeitkonto_private.admins: lista de administradores, sem acesso de clientes.
- zeitkonto_private.purchase_receipts: token de compra e hash único ligados ao utilizador/subscrição, sem leitura ou escrita no cliente.
- Funções públicas são SECURITY INVOKER. As funções privadas elevadas verificam auth.uid(), usam search_path vazio e filtros explícitos de utilizador. A função de estatísticas exige a lista privada de administradores.

## Sincronização e migração

GET/POST /api/sync encaminham JWT verificado para o RPC zeitkonto_sync. Na primeira abertura online de cada conta, a cópia D1 anterior é importada uma vez com identificadores preservados e marca migration_complete. Um relógio inicial antigo impede que essa importação substitua alterações novas. A cópia anterior não é apagada; D1 continua como cópia de compatibilidade para o serviço de notificações, atualizado após sincronização. Utilizadores que ainda não reabriram a app podem ter registos apenas nessa cópia anterior.

No dispositivo, IndexedDB guarda estado por conta e fila persistente de operações. Guardar é local primeiro. A fila envia apenas entidades alteradas; IDs estáveis tornam as repetições idempotentes. Alterações ao mesmo ID usam updated_at e desempate por mutation_id. O servidor serializa operações por conta; rejeita relógios muito no futuro. A app calcula desvio do relógio a partir do tempo do servidor. Alterações em registos distintos são preservadas. Uma alteração perdedora sobre o mesmo registo é substituída pela mais recente; isto não é uma fusão de campos dentro do mesmo registo.

A app sincroniza na abertura, ao regressar ao primeiro plano, no evento de recuperação de rede, a cada 30 segundos enquanto aberta/visível e pelo botão Sincronizar. Não se promete execução com a PWA terminada. A primeira entrada requer rede. A shell pública e os ficheiros de código são guardados pelo service worker; respostas da API e páginas contendo dados pessoais não entram na cache. Dados pessoais ficam no IndexedDB local. Sair remove a cópia da conta e exige primeiro sincronizar alterações pendentes.

A fila de trabalho offline anterior é importada antes de ser descartada. Os feriados consultados anteriormente têm cache local; para um país/ano nunca consultado, é necessário voltar a ter rede ou desmarcar a exclusão automática de feriados.

## Analytics e administração

RPC zeitkonto_heartbeat atualiza last_seen_at com hora do servidor, com intervalo mínimo de 5 minutos. Não aceita um user_id externo nem metadados arbitrários. Eventos permitem somente app_open, work_entry, vacation, settings, calendar, shifts, export, sync. Uma ocorrência por tipo/dispositivo/dia evita duplicações; números de funcionalidades representam dias de utilização, não contagem exata de cliques. Eventos expiram após 90 dias.

GET /api/admin/stats e RPC zeitkonto_admin_stats devolvem apenas totais de contas, novas contas 7/30 dias, atividade 7/30 dias, Basic/Premium, plataformas, versões e utilização agregada das funcionalidades. Não devolvem lista de horários, férias individuais, notas, e-mails ou tokens. A conta proprietária foi adicionada à lista privada. Não foi construído um painel visual de administração nesta fase.

## Basic/Premium e Android

Estrutura preparada para mensal, anual e vitalício, expiração, estado, provider e produto. Só uma subscrição verificada pelo servidor pode refletir Premium no perfil. Há atualização de expirações. Nenhuma compra foi simulada nem nenhum utilizador recebeu Premium.

Ainda falta integrar Play Billing no cliente Android, configurar package name/produtos/conta Google Play e credenciais de servidor, implementar o endpoint que consulta a Google Play Developer API para validar tokens, acknowledgment/restauração, RTDN, reembolsos e revogações. A tabela privada de receipts é apenas a estrutura; não há validador Google Play ativo. Não enviar tokens para analytics nem ativar Premium com base no cliente.

O produto atual é PWA. Um APK/AAB nativo, WorkManager para sincronização em segundo plano, armazenamento protegido pelo Android Keystore, autenticação biométrica e testes em dispositivos reais ainda não foram implementados.

## Verificação

- SQL supabase/tests/rls_sync.sql: duas identidades sintéticas dentro de transação com rollback; own CRUD, negação de leitura/escrita cruzada, negação de auto-Premium, acesso anónimo bloqueado, analytics admin bloqueado a utilizador comum, sincronização repetida, apagamentos e meio dia de férias.
- 21 testes de lógica JS/TS, incluindo operações offline e arredondamento temporal, passaram.
- TypeScript e build da app verificados.
- Todas as nove tabelas públicas confirmadas com RLS ativo. Contas Auth existentes não foram alteradas nem apagadas.
- Security Advisors: sem avisos nas tabelas/funções criadas. Mantém-se o aviso preexistente de proteção contra palavras-passe comprometidas desativada. A sessão não disponibiliza operação para alterar essa configuração; ver https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
- Testes de receção real de push, compras Google Play e funcionamento offline em telemóvel físico não foram executados nesta sessão.

## GitHub

O repositório ltuga/Zeitkonto foi confirmado como acessível e vazio. A tentativa de criar README foi recusada pelo GitHub: HTTP 403, Resource not accessible by integration. O código e as migrations estão completos no repositório que publica o Site, mas não foram enviados ao GitHub. É necessário conceder à integração acesso de escrita ao conteúdo desse repositório. Não há sincronização automática GitHub/Sites configurada.

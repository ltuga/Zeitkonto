> SUBSTITUÍDO pela regra de 40 horas semanais: ver semana-40-horas.md. Este documento descreve a versão anterior.

# Semana de quaisquer cinco dias

- Semana civil de segunda a domingo, determinada pela data de entrada.
- Primeiras cinco datas distintas com trabalho: saldo diário normal, conservando horas previstas e regime de pausas de cada registo.
- Sexta e sétima datas com trabalho: todas as horas contabilizadas são horas extra, incluindo a pausa remunerada quando configurada.
- Férias, meio dia, doença e descanso não incrementam a contagem.
- Contagem cronológica, independente da ordem de inserção/sincronização. Correções, exclusões e reposições recalculam o resultado a partir dos registos presentes.
- As semanas não reiniciam na mudança de mês/ano; os resumos mensais classificam os dias usando a semana completa.
- Registos futuros só entram nos saldos a partir da sua data.
- Nenhum registo histórico é reescrito. `payload.delta`/`overtime_minutes` continuam a representar o saldo diário base; o saldo efetivo soma a meta diária no 6.º/7.º dia. `credited_minutes` e `worked_minutes` mantêm a semântica original.
- A função privada Supabase de atualização do banco de horas aplica a mesma regra a cada sincronização, evitando gravar bónus duplicados.
- A página principal, histórico, estatísticas, saldos e relatório anual apresentam o saldo efetivo.
- Planeamento por datas/rotações e edição/cópia de turnos retirados da interface. Lembretes já planeados preservados; esta versão não cria novos horários de lembrete.
- Calendário mensal e impressão mensal/anual já usam segunda a domingo.

## Verificação

44 testes passaram, incluindo 4 testes específicos da semana. TypeScript e compilação web passaram. SQL com dados sintéticos confirmou o mesmo cálculo na passagem do ano. A função privada continua sem permissão EXECUTE para authenticated; não houve mudanças de RLS nem autenticação.

Security Advisors: apenas o aviso anterior de proteção contra palavras-passe comprometidas desativada, sem avisos novos. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Migração aplicada: `20260919134400_five_work_days.sql`. Reversão: `supabase/rollback/five_work_days.sql`, a acompanhar da reversão da regra no cliente. Não executar automaticamente. O CLI não estava disponível neste ambiente; a migração foi aplicada pelo conector e o ficheiro local usa a versão retornada pelo histórico remoto.

Sem teste físico no telemóvel nesta etapa. Os antigos erros globais de lint permanecem fora desta alteração.

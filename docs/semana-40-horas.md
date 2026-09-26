# Regra de 40 horas semanais

Substitui o critério anterior do sexto/sétimo dia. Semana de segunda a domingo, sem reiniciar no mês/ano. Exceção: trabalho que entra no domingo e termina na segunda é atribuído integralmente à semana seguinte. A data original permanece no calendário e histórico.

Horas extra = máximo(0, trabalho contabilizado + tempo justificado − 40h).

- Trabalho contabilizado respeita a pausa remunerada ou descontada de cada registo. Conserva os valores originais; meta diária + delta diário base recupera o tempo contabilizado.
- Férias e doença com/sem atestado: 8h por dia completo. Meio dia de férias: 4h. Férias por horas: duração indicada (máximo 8h). Meio dia de férias mais meio dia oferecido pela empresa: 8h justificadas, 0,5 dia descontado do saldo de férias.
- Tempo justificado limitado a 40h por semana: ausências por si só não geram horas extra.
- Semana incompleta não debita o banco automaticamente. A app acumula apenas excedentes, conforme pedido. Não cria débitos para semanas vazias.
- Descanso compensatório mantém o desconto explícito já registado no banco e justifica o respetivo tempo, até 8h/dia, evitando uma segunda penalização.
- Só as datas já atingidas entram no saldo. Férias planeadas não antecipam o crédito de horas extra.
- As horas extra são atribuídas cronologicamente aos registos de trabalho que ultrapassam o limiar semanal, descontado o tempo justificado da semana já ocorrido. Um crédito justificado posterior pode recalcular a atribuição aos registos anteriores da mesma semana.
- Correções, cancelamentos e sincronização recalculam o resultado. Nenhum bónus é gravado em cima do delta diário original.
- Ecrã principal mostra trabalho, tempo justificado, progresso para 40h e horas extra semanais. Calendário/relatórios e saldo usam o mesmo cálculo.

## Verificações

48 testes passaram. Incluem 4×10h, 4×11h, 6×6h, 6×7h, férias, doença, meios dias, férias por horas, ausências futuras, alterações retroativas, fim de mês/ano, turno noturno, pausa paga e não paga, descanso compensatório. Testes anteriores de delta diário permanecem; expectativas do banco foram atualizadas para o limiar semanal.

TypeScript, compilação web e lint dos componentes/modelos selecionados passaram. Sem teste físico nesta etapa. Erros antigos de lint global continuam fora desta correção.

Supabase: migração 20260919135551_forty_hour_week.sql aplicada. Query SQL sintética confirmou os exemplos. Função privada continua inacessível diretamente a authenticated. Advisors mantêm apenas o aviso já existente de proteção contra palavras-passe comprometidas desativada: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Não houve alterações em autenticação ou RLS, nem reescrita dos registos de trabalho/férias. Os saldos derivados do servidor são atualizados na sincronização. Reversão técnica em supabase/rollback/forty_hour_week.sql, apenas com a correspondente reversão do cliente; não executar automaticamente. CLI indisponível; versão do ficheiro recuperada do histórico remoto depois da migração pelo conector.


## Correção de domingo à noite

`workWeek` e a função privada do servidor atribuem trabalho com entrada no domingo e saída com hora inferior à entrada à segunda-feira seguinte. Domingo diurno mantém-se na semana anterior. Não se divide um turno entre duas semanas. Ausências mantêm a data marcada.

No cronómetro em curso, a semana é antecipada com base na hora de entrada, duração diária e pausa prevista. Ao terminar ou corrigir o registo, a classificação definitiva usa a entrada/saída efetivas. O resumo identifica a segunda-feira correspondente. Créditos de trabalho não são somados definitivamente antes de guardar a saída.

51 testes passaram: acrescentados domingo noturno vs diurno, cronómetro sem aproveitar excedentes da semana anterior, passagem de ano sem mudar datas do calendário. TypeScript, lint selecionado e compilação web passaram. Consulta SQL sintética confirmou a mesma classificação; função continua protegida. Sem alterações de RLS ou autenticação. Sem testes físicos no Android nesta etapa.

Migração: `20260919140656_sunday_night_week.sql`. Reversão técnica: `supabase/rollback/sunday_night_week.sql`, juntamente com a correspondente reversão do cliente. CLI indisponível, versão obtida do histórico remoto. Advisors: apenas o aviso preexistente de proteção contra palavras-passe comprometidas (link acima).

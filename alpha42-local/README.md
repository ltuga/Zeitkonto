# Zeitkonto Alpha 42 — módulo Android local (em desenvolvimento)

A branch principal deste repositório contém uma aplicação web histórica com Supabase. **Não é a base de publicação da Alpha 41 instalada na Google Play.**

Este diretório guarda um protótipo isolado das regras de saldo semanal para a aplicação Android local. Não está integrado no Android/SQLite e não constitui um APK/AAB. Não importar dependências de Supabase, autenticação ou Cloudflare.

Regras preliminares: classificação NORMAL/EXTRA; extra explícita sem dupla contagem; férias/doença justificadas; descanso sem desconto; dias pendentes sem débito; ausência confirmada debitada segundo horas devidas. Configuração de início semanal, incluindo domingo 22h.

Para executar o teste deste módulo com Java 17 ou superior:

```sh
mkdir -p /tmp/zeitkonto-alpha42-tests
javac -d /tmp/zeitkonto-alpha42-tests app/src/main/java/com/ltuga/zeitkonto/WeeklyShiftBalance.java tests/WeeklyShiftBalanceTest.java
java -cp /tmp/zeitkonto-alpha42-tests WeeklyShiftBalanceTest
```

**Pendências antes de publicar:** incorporar código-fonte integral da Alpha 41 de modo auditável; integrar módulo no SQLite e interface; garantir migração e preservação dos registos; corrigir e testar casos limite; validar backup/restauro; compilar APK e AAB assinados; testes reais Android. Não atualizar Google Play com este diretório.

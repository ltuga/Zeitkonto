# Navegação e saída — 19-09-2026

## Comportamento

- Voltar fecha primeiro o menu, seletor ou diálogo aberto; nunca confirma uma eliminação. Diálogos ocupados continuam a impedir o fecho.
- Sem janelas abertas, regressa pelo histórico dos separadores visitados. Tocar outra vez no mesmo separador não duplica o histórico.
- Selecionar Hoje/Home regressa à raiz da navegação.
- Na raiz, dois toques em Voltar com intervalo máximo de 2 segundos pedem a saída. Um toque mostra uma mensagem em PT/DE/EN/TR.
- Na app Android 0.1.1, a Activity termina, mantendo sessão e dados. No navegador, regressa ao histórico anterior; uma página não pode garantir o encerramento do Chrome ou de uma PWA.
- O histórico contém apenas separador, índice e um identificador aleatório da sessão de navegação. Não contém utilizadores, registos nem tokens. O logout remove o callback e uma sessão nova não restaura a navegação anterior.
- Android 13+ usa o callback de sistema; Android 11–12 usa o mecanismo anterior. Não foram alteradas permissões nem regras de acesso a dados.

## Validação executada

- 61 testes Node aprovados, incluindo histórico de separadores, Home, duplicação, prioridade de janelas, confirmação de saída, expiração, segundo plano e ligação direta ao calendário.
- TypeScript sem erros; ESLint sem erros nos ficheiros novos de navegação e respetivos testes.
- Java: 10 casos da confirmação de saída e 17 casos da política de origens HTTPS aprovados. Compilados pelo módulo `jdk.compiler` do Java 17; execução real das duas classes de teste.
- A compilação Android completa foi tentada com `./gradlew assembleDebug lintDebug`; falhou ao descarregar Gradle 8.11.1 por indisponibilidade de rede. Não existe um novo APK validado.

## Testes que ainda exigem o APK num dispositivo

Teclado aberto; gesto Voltar e navegação com três botões; menu lateral; seletor sobre diálogo; gravação em curso; login/logout; primeiro e segundo Voltar na raiz; mais de dois segundos entre toques; biometria e regresso do segundo plano; atualização sobre a 0.1.0 sem desinstalar; Android 11–12 e 13+.

Compilar com SDK 35 e a assinatura de testes original conforme `android/README.md`. Não usar uma assinatura de produção nesta fase. A atualização web não substitui a instalação de um APK novo para ativar o callback nativo e o encerramento da Activity.

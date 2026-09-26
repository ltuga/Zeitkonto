# Zeitkonto — estado em 19-09-2026

## Resultado desta revisão

A interface principal foi adaptada à imagem fornecida: azul, cartão do turno, indicador circular do saldo diário, quatro atalhos, três cartões de saldos, próximo turno e navegação inferior. Os números são calculados dos registos da conta. Não foi copiada a fotografia da pessoa da imagem, nem inseridos saldos fictícios na aplicação.

O ecrã preserva o cronómetro e as ações de entrada, pausa, retoma, saída e correção manual. O menu lateral continua disponível com férias, descanso compensatório, doença com/sem atestado, calendário, turnos/lembretes, histórico, temas, idiomas, conta e definições. O idioma pode ser alterado em Perfil/Definições também no telemóvel. O cartão de férias abre diretamente o calendário, sem recarregar a sessão.

O botão Estatísticas abre o resumo mensal e os registos existentes. Não significa que estatísticas noturnas ou suplementos estejam implementados. O sino abre os lembretes existentes; não simula notificações não lidas. O círculo compara o tempo creditado com o objetivo e o saldo durante um turno é identificado como provisório.

## Estado confirmado

- A publicação atual consultada é a versão web 19.
- A cópia local de partida está no commit 93a2e72; não contém a pasta Android nem o commit 272ef61 do APK criado na sessão anterior.
- O trabalho anterior produziu e entregou um APK de teste 0.1.0. Nesta revisão não foi gerado nem instalado outro APK.
- As migrations e os testes RLS existentes estão no repositório. A validação do Supabase em produção não foi repetida nesta revisão de interface.
- Nenhum push, deploy, publicação, alteração de dados ou uso de chave privada de assinatura foi feito nesta revisão.

## O processo completo ainda não terminou

1. Recuperar a revisão Android já existente, com autorização para obter/utilizar as credenciais necessárias. Não reconstruir uma app nova por cima desta cópia antiga.
2. Integrar as alterações locais com a revisão mais recente antes de qualquer push, para preservar o histórico Android.
3. Rever segurança de sessão/armazenamento offline e implementar encriptação adicional nativa, se escolhida a arquitetura que a suporta. O IndexedDB web atual não equivale a um cofre Android Keystore.
4. Implementar eliminação segura da própria conta, com confirmação e reautenticação; o reset de registos atual não elimina a conta.
5. Completar pausas automáticas, regras de descanso, limites, prevenção de sobreposição entre dias, arredondamento configurável e suplementos.
6. Completar os relatórios mensais PDF e a partilha nativa Android; a impressão atual do calendário não cobre todos os requisitos do relatório solicitado.
7. Implementar e testar a restrição Free/Pro das funcionalidades no backend. Existe estrutura subscriptions protegida, mas não existe uma separação completa das funcionalidades já aplicada.
8. Integrar os lembretes nativos Android em segundo plano, sem depender de Web Push numa WebView.
9. Corrigir o lint preexistente, repetir testes de isolamento RLS e testar login/recuperação/logout, troca de conta, modo avião, reabertura offline, PDF e atualização do APK num dispositivo real.
10. Preparar assinatura de produção e requisitos da Play Store numa fase posterior, com autorização. Nenhuma publicação na loja foi feita.

A regra de pausa remunerada existente foi mantida: o tempo efetivamente trabalhado exclui pausas, enquanto o saldo pode incluir até 30 minutos pagos conforme a opção do utilizador. Esta alteração visual não muda contratos/regras de cálculo já guardados.

## Verificação

- TypeScript: passou.
- Build web: passou; aviso de tamanho de alguns bundles, sem erro de compilação.
- Testes automatizados: 40 passaram, zero falhas (autenticação simulada, cálculos, férias, passagem de ano, sincronização e novo resumo inicial).
- Dois testes antigos foram ajustados para carregar TypeScript com esbuild, como os restantes testes, em vez de importação direta incompatível com o Node atual. As asserções antigas foram preservadas.
- Lint dos novos componentes/modelo/traduções: passou.
- Lint global: não passou. A execução encontrou 25 erros em código anterior e avisos; a comparação com o ficheiro de partida confirmou que os erros do ecrã principal já existiam antes. Os avisos de imports que a substituição visual tornou desnecessários foram removidos.
- Nenhum teste de dispositivo físico ou novo teste de banco em produção foi executado.

## Ficheiros desta revisão

- app/time-app.tsx
- app/layout.tsx
- app/dashboard.css
- components/zeitkonto/home-dashboard.tsx
- lib/dashboard.ts
- lib/dashboard-i18n.ts
- tests/dashboard.test.mjs
- tests/load-ts.mjs
- tests/dated-balances.test.mjs
- tests/shifts.test.mjs
- README.md
- docs/estado-interface-2026-09-19.md

Sem novas migrations ou alterações em variáveis de ambiente. O ficheiro HTML entregue é uma pré-visualização estática do componente implementado, com dados de demonstração explicitamente identificados; não é a aplicação publicada.

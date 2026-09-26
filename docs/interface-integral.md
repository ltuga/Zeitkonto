# Interface integral Zeitkonto — 19/09/2026

A referência visual foi estendida a toda a interface existente, sem substituir dados, autenticação, sincronização ou cálculos.

## Alterações

- Página principal existente no novo estilo, cabeçalho azul e navegação inferior.
- Menu branco, recolhido inicialmente no desktop e acessível pelo botão de menu.
- Marca do cabeçalho regressa à página principal sem recarregar a sessão.
- Calendário, detalhes do dia e exportação com novos cartões e cores coerentes para cada ausência.
- Banco de horas e férias com cartões de saldo em tons azul e verde.
- Estatísticas mensais, histórico e turnos com cartões e controlos maiores.
- Definições separadas em cartões de conta, idioma, aparência, regras de tempo, férias, instalação, offline e reposição.
- Formulários e janelas de confirmação com apresentação comum, preservando os controlos existentes.
- Login, criação de conta e recuperação com a mesma identidade visual, sem alteração dos fluxos de autenticação.
- Página de registo offline com a mesma marca e cores.
- Tema claro/escuro, quatro idiomas, ecrãs pequenos e foco de teclado preservados.

## Verificação

- TypeScript sem erros.
- 40 testes automáticos existentes passaram.
- Compilação web passou. Avisos de tamanho de bundles permanecem.
- O navegador de pré-visualização não carregou o endereço interno, mesmo após uma repetição. Não foi possível validar visualmente as páginas autenticadas, nem testar esta alteração num telemóvel.
- O lint global já tinha erros documentados no relatório anterior; não foram corrigidos nem ocultados nesta alteração visual.
- Sem nova auditoria Supabase, migrações, alterações de conta ou geração de APK nesta etapa.

## Ficheiros desta etapa

- app/interface.css (novo tema partilhado)
- app/layout.tsx
- app/time-app.tsx
- app/auth-shell.tsx
- components/zeitkonto/app-navigation.tsx
- public/theme.css
- public/offline.html
- README.md
- docs/interface-integral.md

Alterações apenas locais. Nenhum push ou deploy efetuado. A aplicação publicada ainda não contém esta interface. A preparação completa para Android e as pendências de segurança/Pro continuam descritas no relatório anterior.

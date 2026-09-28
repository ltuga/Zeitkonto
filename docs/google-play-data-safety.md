# Google Play Data Safety — Zeitkonto 0.2.1

Preparado em 28/09/2026 a partir do código. Não submetido à Play Console. Política pública implementada em `/privacy`; eliminação em `/delete-account`.

## Respostas e evidências

A app recolhe/transmite dados: **sim**. Usa HTTPS: **sim**. Permite solicitar eliminação da conta: **sim**, página pública e app, com autenticação e reautenticação. Não marcar auditoria independente ou certificação: não realizadas. Não há publicidade nem pagamentos reais nesta versão.

| Categoria Play | Dados | Obrigatório/opcional | Finalidade |
|---|---|---|---|
| Informações pessoais: email, ID de utilizador | Supabase Auth e identificação das linhas | Necessário à conta | Gestão de conta, funcionalidades, segurança |
| Informações pessoais: nome e outras informações | Nome e empresa introduzidos | Opcional | Personalização dos registos/relatórios |
| Saúde e fitness: informações de saúde | Ausência por doença, datas, com/sem atestado | Opcional, consentimento explícito para criação/alteração | Funcionalidade de registo de ausências |
| Atividade da app: outro conteúdo gerado pelo utilizador | Trabalho, pausas, férias, notas e configurações | Conforme as funcionalidades utilizadas | Registo, cálculo, sincronização e lembretes |
| Atividade da app: interações | Eventos limitados das funcionalidades | Opcional, desativado por defeito | Analytics próprio |
| Dispositivo ou outros IDs | Dispositivo lógico e identificador/endpoint push | Opcional conforme analytics/notificações | Analytics ou entrega de lembretes |
| Informações da app/desempenho: outros dados de desempenho, se aplicável à taxonomia atual | Versão, plataforma, último acesso; não enviar diagnósticos/conteúdo | Opcional no analytics | Compatibilidade e estatísticas |
| Localização aproximada/precisa | Área do mapa e consulta de morada transmitidas aos serviços de mapa | Opcional | Selecionar local de trabalho |

A localização utilizada exclusivamente no dispositivo para geofence não constitui, por si só, recolha para a declaração; os pedidos de mapa/morada saem do dispositivo e não devem ser omitidos. Confirmar a granularidade exata transmitida em teste de rede num Android real antes de selecionar as categorias finais. IPs recebidos por infraestrutura também podem permitir localização aproximada. Não declarar processamento efémero para dados que são persistidos no Supabase/D1.

## Partilha: validação contratual obrigatória

Supabase e Cloudflare prestam infraestrutura; a exceção de prestador de serviço do formulário só se aplica quando os contratos e instruções de tratamento a suportarem. OpenStreetMap/Photon/Komoot e fornecedores push recebem pedidos/IPs: verificar termos e finalidade independente antes de marcar “não partilhados”. O repositório não comprova estes contratos. Não selecionar automaticamente “nenhuma partilha”. Exportações deliberadamente partilhadas pelo utilizador devem ser avaliadas segundo a exceção de ação iniciada pelo utilizador.

## Retenção e controlos implementados

- Eventos: 90 dias via tarefa de manutenção; opção de apagar estatísticas da própria conta.
- Recusa por defeito; heartbeat no servidor verifica o consentimento versionado em settings.
- Push: hashes de deduplicação sete dias. Marca técnica de conta eliminada: 30 dias.
- Histórico: 300 entradas; conteúdo dos registos eliminados retirado no fluxo da app.
- Conta: cascatas Supabase; D1 apagado pelo fluxo e reconciliado para eliminações externas. Dispositivos offline exigem sincronização/limpeza local.
- Sem diagnóstico nem upload de certificado médico solicitado. Registos anteriores à versão de consentimento não possuem consentimento retroativo comprovado.

## Antes de submeter

1. Confirmar identificação jurídica do responsável além da marca **Ltuga**, transferências/contratos e prazos reais dos backups/logs. Não inventar prazos ou garantias contratuais.
2. Rever registos de doença anteriores ao consentimento; definir tratamento legítimo, não presumir autorização retroativa.
3. Validar fluxo instalado no Android, incluindo divulgação destacada antes da permissão de localização em segundo plano e possibilidade de recusa.
4. Preencher declaração Health apps (mesmo sendo app de uso pessoal não médico), acessos à localização em background e Data Safety consistentes com esta matriz.
5. Confirmar URL pública da política acessível sem login, legível e não PDF; traduzir para os idiomas da distribuição. A página atual está em português.
6. Verificar se o armazenamento offline/biometria satisfaz a avaliação de risco relativa a dados de saúde. Não afirmar cifragem integral da WebView/IndexedDB.

Fontes oficiais consultadas:
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/16679511

# Privacidade e Data Safety — rascunho técnico 0.2.1

Não publicar como política final. Falta o nome público do responsável e email público de suporte/privacidade, além dos prazos reais de retenção e contratos/regiões dos fornecedores.

| Dados | Finalidade e armazenamento |
|---|---|
| Email, ID, autenticação | Supabase Auth. A reautenticação para eliminar passa por HTTPS no servidor; não há logging da password. |
| Trabalho, pausas, férias, doença, saldos, empresa, configurações | Supabase, cache local e cópia Cloudflare D1 usada pelos lembretes. Doença é informação sensível mesmo sem diagnóstico. |
| Local de trabalho | Deteção opcional Android, envelope local cifrado com Keystore. Sem histórico contínuo de percursos; eventos transformados em registos sincronizados. |
| Morada/mapa | Consultas OpenStreetMap/Nominatim podem transmitir IP, morada/coordenadas. Não declarar que toda a localização permanece no telefone. |
| Versão, dispositivo lógico, último acesso, uso de funcionalidades | Analytics próprio Supabase; confirmar opção de consentimento e base legal. Não identificado SDK de publicidade. |
| Subscrição push e idioma/fuso | Lembretes Supabase/D1/provedor push. Hashes de entregas expiram pelo scheduler após sete dias. |
| Marca de eliminação | Hash SHA-256 do owner, payload vazio em D1. Pseudonimizado, não anonimizado. Impede que pedidos antigos recriem dados; definir retenção operacional. |
| Logs/backups | Confirmar prazos efetivos Supabase/Cloudflare. Eliminar dados ativos não significa remoção imediata dos backups. |

## Eliminação

`/delete-account` é acessível sem uma sessão prévia e também nas definições. Exige login, confirmação DELETE e reautenticação. O owner é derivado da identidade validada. D1 elimina a cópia e cria marca numa transação, depois o servidor chama a RPC de eliminação da própria conta. Não usa service_role. Uma falha na segunda operação requer repetir pela página pública; APIs normais bloqueiam a conta marcada. Nenhuma conta real foi eliminada durante desenvolvimento.

Após sucesso, tenta limpar apenas IndexedDB/outbox/sessão da conta eliminada e o envelope nativo. Falhas de limpeza são mostradas. Dispositivos offline não podem ser apagados remotamente: instruir a terminar sessão e limpar dados locais. O APK antigo não suporta a nova operação nativa de limpeza.

A RPC Supabase já existente continua disponível ao utilizador autenticado. Uma chamada direta fora deste novo fluxo pode contornar a limpeza auxiliar D1; antes da publicação, validar uma estratégia de reconciliação de contas removidas por RPC/admin. Não afirmar cobertura de todos os canais de eliminação.

## Data Safety — classificação a confirmar

Informação pessoal (email/ID e nome se preenchido), saúde (doença), atividade da app, identificadores de instalação/push, localização opcional e consultas a mapas. HTTPS em trânsito. Não declarar cifra própria de todo o IndexedDB/WebView. Classificar fornecedores e partilha segundo contratos; não marcar automaticamente “nenhuma partilha”.

Fontes oficiais: https://support.google.com/googleplay/android-developer/answer/10144311 e https://support.google.com/googleplay/android-developer/answer/13327111.

## Confirmações do responsável

- Nome público e email público de suporte/privacidade.
- Regiões, contratos, prazos de backups/logs e marca técnica.
- Consentimento/opt-out de analytics e base legal dos dados de doença.
- Identidade/conta Play Console e requisitos de testes dessa conta.

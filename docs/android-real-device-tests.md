# Testes num Android real — 0.2.1

Estado em 28/09/2026: **NÃO EXECUTADOS**. `adb devices -l` não lista dispositivos. Os testes Java são simulações de lógica, não instrumentação Android. Não foi instalado um novo APK nesta fase.

## Preparação

Usar um telefone de teste com Android suportado, idealmente API 36, e duas contas fictícias. Registar modelo, Android/build, APK SHA-256, versão/commit, resultado e evidências sem dados pessoais. Instalar APK assinado com a mesma chave da versão anterior para testar atualização sem perda; se a chave não estiver disponível, não desinstalar a app real nem gerar uma chave substituta presumindo compatibilidade. Fazer exportação dos dados antes de qualquer teste destrutivo.

Ligar depuração USB e aceitar a autorização no telefone. `adb devices -l` deve mostrar `device`. Instalar com `adb install -r /caminho/zeitkonto-test.apk`. Não usar contas reais em testes de eliminação.

| Teste | Procedimento e resultado esperado | Resultado físico |
|---|---|---|
| Atualização | Atualizar APK anterior; manter conta e dados; novo código visível | Pendente |
| Login/recuperação | Credenciais inválidas não expõem detalhes; recuperação por email abre origem correta | Pendente |
| Logout offline | Ativar modo avião, sair, voltar; dados da conta anterior invisíveis | Pendente |
| Duas contas | A cria registos, sai; B entra online/offline; nunca vê A | Pendente |
| Sincronização | Criar/editar offline, reconectar e repetir; um registo sem duplicados | Pendente |
| Calendário | Selecionar dia, deslocar página nos dois sentidos; sem salto repetido ao calendário | Pendente |
| Turno noturno | Domingo 22:00–segunda 06:00; aplicar pausa e regra semanal existente | Pendente |
| Sem turno planeado | Configurar zona sem horário; chegada cria/confirma entrada após permanência | Pendente |
| Pausa curta | Sair menos que o limiar e regressar; não criar saída | Pendente |
| GPS impreciso | Precisão insuficiente/fronteira; não criar registo falso | Pendente |
| Segundo plano | Ecrã bloqueado e app em background; medir chegada/saída e atrasos | Pendente |
| Processo/reinício | Remover da lista recente e reiniciar; confirmar recuperação segundo limites Android. Force-stop pode bloquear eventos até reabrir | Pendente |
| Permissões | Recusar localização/notificações; manual continua; estado e instruções claros | Pendente |
| Notificações | Confirmar/ignorar semiautomático; entrega não duplica registos | Pendente |
| Biometria | Sucesso, cancelamento, bloqueio, sem biometria e troca de conta; sem contorno | Pendente |
| Saúde/analytics | Cancelar consentimento impede novo registo; analytics desligado não envia; apagar estatísticas apenas da conta | Pendente |
| Eliminação | Conta fictícia, reautenticação; limpar Supabase/D1/local; validar também RPC direta e ciclo do scheduler | Pendente |
| PDFs | Criar, abrir, guardar e partilhar; nenhum ficheiro de outra conta acessível | Pendente |
| Segurança de rede | Proxy de teste controlado: HTTPS, sem tokens em URLs/logs; mapa revela apenas pedidos esperados | Pendente |

A aprovação destes testes exige resultados observados num aparelho. Passar testes unitários ou compilar não substitui esta validação.

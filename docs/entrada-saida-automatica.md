# Entrada e saída por localização — Zeitkonto 0.2.0

## Estado

Implementado no projeto existente. Build web, Java Android e lint passam. O pacote Android é gerado **sem assinatura** por predefinição. Ainda não é instalável: reutilizar a assinatura de testes anterior aguarda autorização, conforme a instrução do utilizador sobre uso de credenciais.

Não foram executados testes em telefone físico ou emulador. Segundo plano, processo terminado, Doze e reinício ainda exigem validação real. Esta versão não deve ser considerada validada para produção.

## Utilização

Em Definições → Entrada e saída automáticas:

- Desativado: remove o geofence e o alarme de confirmação.
- Semiautomático: notifica a primeira deteção fiável, com ações Confirmar/Ignorar.
- Automático: confirma a permanência, guarda a entrada/saída cifrada no Android e notifica.
- Localização atual pontual, coordenadas ou mapa OpenStreetMap com seleção por toque, zoom e botão de centrar.
- Raios de 100, 150, 200, 300 e 500 metros.
- Dias habituais e horário habitual opcionais. Nunca exige turnos planeados.
- Chegada após 2–30 minutos; saída após 10/15/20/30 minutos fora da zona.
- Fora dos hábitos, confirmação pode exigir mais 2 minutos. Um turno planeado próximo melhora a confiança da chegada.
- O estado na página Hoje depende do registo do geofence e das permissões.
- Textos principais e notificações em português, alemão, inglês e turco.

A hora registada é a primeira amostra fiável da sequência confirmada, não uma garantia da hora exata em que se atravessou a fronteira. Android pode atrasar geofences e alarmes.

Continuar a usar Pausa/Retomar para descontar pausas. Uma saída breve não termina o turno nem inventa uma pausa. Preserva o regime de pausas incluídas/à parte e a meta diária existentes.

## Lógica e proteção

GeoEngine exige duas amostras coerentes separadas pela permanência. Incerteza GPS máxima: mínimo entre 75 m e metade do raio. Chegada exige distância + incerteza dentro do raio; saída exige distância − incerteza além do raio + 25 m. Leituras imprecisas, antigas ou simuladas não criam registos. Até três tentativas pontuais após falha; não há GPS contínuo.

Entrada aberta impede outra entrada; sem entrada aberta não há saída. Cooldown de 2 minutos. Eventos repetidos do mesmo lado não reiniciam permanência. Reinício descarta permanência não confirmada e volta a registar o geofence, preservando entrada/eventos cifrados.

Notificações privadas; propostas expiram após duas horas e são canceladas por mudança de zona/configuração/entrada. Ações passam pelo receiver interno com ID pendente correspondente.

Domingo 22:00 → segunda 06:00 mantém a data de domingo e usa a lógica semanal existente, que o atribui à semana seguinte. Duração calculada por timestamps absolutos. Turnos ≥24 h, sobreposição de data e alterações concorrentes ficam para revisão, sem substituir registos.

## Dados, sincronização e segurança

A configuração é específica deste Android, cifrada AES-GCM com Android Keystore. Não é enviada ao Supabase. Não são guardados percursos. Ao abrir o mapa, o fornecedor OpenStreetMap recebe os pedidos de imagens da zona visível.

Entrada em curso e eventos persistem cifrados mesmo sem Internet/WebView aberto. **A sincronização com Supabase acontece ao abrir a aplicação**, usando o login e a fila local existentes. Receivers não recebem tokens Supabase.

Eventos usam o mesmo State.active e os mesmos registos normais. A fila nativa só é confirmada depois da gravação local. IDs estáveis permitem repetir a importação sem duplicação. Conflitos ficam nas Definições para revisão explícita. Edição/apagamento continuam disponíveis.

Campos opcionais: origin, geoId e, no registo completo, startedAt/endedAt. Origens: manual, geofence_semiautomatico, geofence_automatico. Origem ausente significa manual. Correções manuais eliminam timestamps absolutos desatualizados.

**Sem migrations de produção:** work_entries.payload e settings.payload já são JSONB. Turno em curso continua em settings/active e finalizado em work_entries, com as RLS existentes. O teste SQL transacional desta entrega verificou origem, repetição e isolamento entre duas identidades sintéticas, seguido de rollback.

Ponte AndroidX WebMessageListener: origem HTTPS exata, frame principal e Activity desbloqueada; sem addJavascriptInterface, tokens ou chaves. Logout desativa/limpa após resolver eventos pendentes; sessão revogada detetada pela web suspende a deteção. Outra conta nunca recebe eventos da anterior. Usar num só telemóvel por conta até validar concorrência entre vários dispositivos.

## Android e dependências

Java/WebView mantido; minSdk 30, target/compileSdk 35. Pacote de teste com.ltuga.zeitkonto.test; versão 0.2.0-test; versionCode 4.

Dependências novas, fixas:

- com.google.android.gms:play-services-location:21.3.0
- androidx.webkit:webkit:1.12.1

Permissões novas: ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION, ACCESS_BACKGROUND_LOCATION, POST_NOTIFICATIONS e RECEIVE_BOOT_COMPLETED. INTERNET e USE_BIOMETRIC já existiam.

No Android 11+, conceder localização precisa e depois “Permitir sempre” nas definições do sistema; notificações no Android 13+. Sem serviço GPS permanente, alarmes exatos ou armazenamento público.

Boot/atualização registam novamente o geofence após desbloqueio. Requer Google Play services, localização e permissões. Forçar paragem suspende deteção até reabrir. Bateria/fabricante podem atrasar ou impedir eventos.

## Compilar, assinar e instalar

JDK 17 completo, SDK Android 35, Build Tools 35.0.0 e acesso Google/Maven/Gradle. Na pasta android:

~~~sh
./gradlew assembleDebug lintDebug
~~~

Sem assinatura configurada resulta em app/build/outputs/apk/debug/app-debug-unsigned.apk, **não instalável**. Para atualizar a instalação anterior é obrigatório reutilizar a mesma chave. Não gerar outra nem desinstalar para contornar incompatibilidade.

Depois de autorizada a reutilização, fornecer apenas no ambiente seguro:

- ZEITKONTO_TEST_KEYSTORE — caminho absoluto da chave original
- ZEITKONTO_TEST_STORE_PASSWORD
- ZEITKONTO_TEST_KEY_ALIAS
- ZEITKONTO_TEST_KEY_PASSWORD

Recompilar. Não guardar valores no Git ou frontend. Instalar o APK assinado pelo gestor de ficheiros ou adb install -r. Preservar pacote/assinatura e aumentar versionCode nas atualizações. Produção continua sem assinatura configurada.

## Testes reais pendentes

1. Instalar atualização assinada, abrir com Internet e confirmar dados antigos.
2. Escolher Semiautomático, local correto, raio 200 m, chegada 5 min, saída 15 min; conceder permissões e verificar estado ativo.
3. Sem turno planeado, chegar e permanecer; confirmar e depois repetir ignorando. Passagem rápida não deve criar entrada.
4. Sair menos de 15 min e regressar: turno continua; sair mais de 15 min: confirmar saída.
5. Repetir em Automático sem abrir entre chegada/saída; abrir depois e verificar sincronização única na web.
6. Testar domingo à noite, fim do mês/ano e trabalho fora dos hábitos.
7. Repetir em background, retirada dos recentes, ecrã bloqueado, poupança de bateria e reinício/desbloqueio. Medir atrasos.
8. Recusar/revogar permissões, desligar localização, GPS fraco: não inventar registos nem indicar deteção ativa.
9. Entrada manual aberta, alteração/cancelamento concorrente e repetição: rever conflitos sem sobrescrever histórico.
10. Sem Internet e recuperação da ligação; logout e outra conta; Confirmar/Ignorar com app bloqueada; mapa e textos PT/DE/EN/TR.

## Verificação executada

- TypeScript e build web aprovados; aviso existente de tamanho de chunks.
- 73 testes Node aprovados, incluindo seis novos casos de eventos.
- GeoEngine: 16 asserções Java aprovadas; ciclo de vida apenas simulado.
- Java Android, recursos, DEX, assembleDebug e lintDebug aprovados; APK sem assinatura.
- ESLint dos novos ficheiros: zero erros; aviso de img para tiles do mapa.
- Supabase: RLS ativas em work_entries/settings; teste transacional aprovado.
- Security Advisors: aviso pré-existente de proteção contra palavras-passe comprometidas desativada. Não foram alteradas configurações de autenticação.
- Não executados: instalação assinada, GPS/notificações reais e encerramento/Doze/boot em dispositivo.

## Ficheiros alterados/criados

- lib/time.ts, lib/geofence.ts, lib/geofence-client.ts
- app/time-app.tsx, app/auth-shell.tsx
- components/zeitkonto/automatic-attendance.tsx, components/zeitkonto/geo-map.tsx
- android/app/build.gradle, android/app/src/main/AndroidManifest.xml
- android/app/src/main/java/com/ltuga/zeitkonto/: MainActivity.java, GeoEngine.java, GeoStore.java, GeoRuntime.java, GeoReceiver.java, GeoActionReceiver.java, GeoBridge.java
- android/app/src/main/res/drawable/ic_geo_notification.xml
- tests/geofence.test.mjs, android/tests/GeoEngineTest.java, supabase/tests/geofence_sync.sql
- README.md, android/README.md, este documento

## Referências

- https://developer.android.com/develop/sensors-and-location/location/geofencing
- https://developer.android.com/develop/sensors-and-location/location/permissions
- https://developer.android.com/develop/sensors-and-location/location/background
- https://developer.android.com/reference/androidx/webkit/WebViewCompat
- https://www.openstreetmap.org/copyright
- Aviso Auth existente: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

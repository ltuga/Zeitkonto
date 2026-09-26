# Zeitkonto Android — 0.2.0 (assinatura de testes pendente)

Estado atual: [localização, compilação e testes da versão 0.2.0](../docs/entrada-saida-automatica.md). As secções 0.1.x abaixo preservam o histórico das versões anteriores.

Primeiro cliente Android (Java, WebView do sistema) para a Zeitkonto existente.
Não é uma publicação Google Play nem uma reimplementação nativa de todas as funcionalidades.
A navegação web foi integrada com o botão Voltar. O backend não foi alterado nesta atualização.

A versão 0.1.0 é o APK anterior. O código 0.1.1 usa versionCode 2; a compilação deste ambiente está bloqueada no download do Gradle. Não existe ainda um APK 0.1.1 entregue.

## Instalar e usar

1. Instalar `Zeitkonto-0.1.0-teste.apk` num dispositivo Android 11 ou superior.
2. Autorizar a instalação desta origem quando o Android pedir. Manter o Play Protect ativo.
3. Abrir **Zeitkonto Teste**, com Internet, e iniciar sessão com o email já usado na versão web.
4. Em **Opções → Impressão digital / bloqueio**, ativar e confirmar com o Android.
5. Abrir o calendário e escolher mês/ano. Usar a impressão da página ou **Opções → Imprimir / guardar PDF**.

O idioma nativo segue o telefone (PT/DE/EN/TR). A preferência de idioma da parte web continua a ser controlada pela Zeitkonto.
O bloqueio usa biometria forte ou o PIN/padrão/palavra-passe do dispositivo. Nunca recebe a impressão digital nem substitui o login Supabase.
Se não houver bloqueio de ecrã configurado, o Android pede que o configures antes de ativar a opção.
Se removeres o bloqueio do telefone depois de ativar a opção, volta a configurar um bloqueio seguro para recuperar o acesso local.

## Atualizações e dados

- O cliente abre somente `https://meu-tempo-luis.ltugamatos.chatgpt.site/` dentro da WebView. Alterações publicadas no website continuam disponíveis na app, sujeitas à cache existente.
- Alterações Java/Android exigem outro APK com o mesmo identificador, a mesma assinatura e um versionCode superior.
- Este APK usa `com.ltuga.zeitkonto.test`, separado do futuro `com.ltuga.zeitkonto` de produção.
- O armazenamento da WebView é separado do Chrome. Os dados sincronizados chegam pela mesma conta Supabase; alterações guardadas apenas no Chrome precisam primeiro de ser sincronizadas lá.
- Não desinstalar para atualizar. A desinstalação ou limpeza de dados apaga alterações locais ainda não sincronizadas.
- As confirmações e recuperações por email continuam a abrir no navegador; depois volta à app para iniciar sessão.

## Segurança incluída

- HTTPS obrigatório, certificados do sistema, sem aceitar erros SSL, sem conteúdo misto.
- Navegação interna limitada ao hostname exato, sem credenciais na URL e sem portas alternativas. Links HTTPS externos só abrem no navegador por ação do utilizador.
- Sem `addJavascriptInterface`; sem acesso WebView a ficheiros/content providers; permissões web negadas; cookies de terceiros desativados.
- Depuração WebView e `debuggable` desativados até no APK de teste.
- `FLAG_SECURE` evita capturas e miniaturas com dados. Exportação em PDF exige confirmação explícita.
- Backup e transferência de dados Android desativados. Dados e sessão ficam no armazenamento privado da app, sujeito às proteções/encriptação do Android.
- Bloqueio opcional ao sair/regressar; a WebView não é criada no arranque bloqueado até autenticação bem-sucedida.
- Sem service_role, segredos de servidor, leitura biométrica, publicidade ou SDK de analytics adicional.

Não há ainda encriptação adicional via Keystore do IndexedDB/cookies do WebView, nem sessão Supabase movida para um cofre nativo. O bloqueio biométrico controla o acesso à interface. Não deve ser apresentado como encriptação criptográfica individual dos registos.

## Limitações desta versão

- Não inclui lembretes Android nativos em segundo plano. Web Push não é uma alternativa fiável dentro da WebView; usar a versão web instalada para os lembretes já existentes até integrar notificações Android.
- O offline depende da cache/service worker e IndexedDB da app web. A primeira abertura requer Internet; reabrir depois de terminar o processo, perda de rede durante gravação e reconciliação precisam de teste no dispositivo. Não foi incluído um pacote local completo da interface.
- Não inclui Play Billing, validação de compras, App Links verificados ou publicação na loja.
- Ainda não foram executados testes em telefone físico ou emulador. O APK é para validação inicial.

## Compilar

Requisitos: JDK 17, SDK Android 35 e Build Tools 35.0.0.
Abrir esta pasta no Android Studio ou definir `ANDROID_HOME` e executar:

```sh
./gradlew assembleDebug lintDebug
```

O Gradle Wrapper fixa Gradle 8.11.1, e o plugin Android fixa 8.9.2. O APK fica em `app/build/outputs/apk/debug/`.
`bundleRelease` prepara um AAB não assinado; configurar uma chave de produção privada e rever o target SDK exigido pela loja antes de publicar. Nunca usar a chave de teste para produção.
Guardar a chave de teste utilizada nesta compilação para poder atualizar os primeiros APKs sem desinstalar. Ela não é incluída no git.

## Verificação

O teste `tests/NavigationPolicyTest.java` verifica URLs normais e tentativas de desvio para outros hosts, portas, credenciais e esquemas.

```sh
mkdir -p /tmp/zeitkonto-tests
javac -d /tmp/zeitkonto-tests app/src/main/java/com/ltuga/zeitkonto/NavigationPolicy.java tests/NavigationPolicyTest.java
java -cp /tmp/zeitkonto-tests com.ltuga.zeitkonto.NavigationPolicyTest
```

No telemóvel: login existente; ativar/cancelar/falhar biometria; mudar de app e bloquear ecrã; orientação; entrada/saída; meio dia e férias por horas; editar offline e voltar à rede; abrir os mesmos dados na web; imprimir ano completo; instalar a próxima atualização sem desinstalar.

Referências oficiais: https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt ; https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges ; https://developer.android.com/build/releases/agp-8-9-0-release-notes .

## Botão Voltar — 0.1.1

Fecha primeiro o diálogo/menu superior, respeitando bloqueios de gravação. Depois regressa ao separador anterior. O botão Home regressa à raiz. Na raiz, mostra um aviso; um segundo Voltar dentro de 2 segundos termina a Activity sem apagar a sessão ou os dados. A confirmação expira e é cancelada ao colocar a aplicação em segundo plano. O teclado e as janelas nativas continuam a usar o comportamento do Android.

Usa OnBackInvokedCallback no Android 13+ e onBackPressed no Android 11–12. O retorno da página é consultado apenas na origem HTTPS autorizada; não existe uma interface JavaScript com acesso a métodos Java.

Para instalar a atualização sobre a 0.1.0, recuperar a **mesma chave de assinatura de testes** anteriormente guardada e configurar a assinatura debug no ambiente de compilação; não aceitar uma nova chave debug gerada automaticamente. Não desinstalar a aplicação para contornar assinaturas diferentes. Nenhuma chave foi adicionada ao repositório.

Verificação automatizada adicional: `tests/BackPressPolicyTest.java`, compilado juntamente com `BackPressPolicy.java`, testa o intervalo de dois segundos, expiração e reinicialização da confirmação. Consultar `../docs/navegacao-android.md` para resultados e testes manuais pendentes.

## Widget Android — 0.1.2

Widget nativo de atalhos para o ecrã inicial, aproximadamente 4 × 3 células, redimensionável. Abre Hoje (registar horas), Calendário ou Saldo. Não inicia/termina turnos sem confirmação, não mostra um saldo em tempo real, não guarda tokens e não consulta o backend no launcher. Os atalhos reutilizam a Activity existente e aguardam o desbloqueio biométrico/PIN quando ativado. O login web continua obrigatório. Idiomas: PT, DE, EN e TR, conforme o telefone.

Após gerar e instalar o APK 0.1.2 com a assinatura de testes original: manter premido um espaço vazio no ecrã inicial → Widgets → Zeitkonto → adicionar. O widget pertence ao APK; atualizar apenas o website não o instala.

Ficheiros: `ZeitkontoWidget.java`, `WidgetDestination.java`, `res/layout/zeitkonto_widget.xml`, `res/xml/zeitkonto_widget_info.xml`, fundos em `res/drawable/` e textos nas quatro pastas `res/values*`. Manifest e MainActivity integram o widget sem novas permissões. Versão 0.1.2, versionCode 3.

Validação: 9 testes Java dos destinos aprovados; os 15 XML Android foram analisados sem erros. `./gradlew assembleDebug lintDebug` voltou a falhar no download do Gradle por indisponibilidade de rede; não foi produzido APK. Testes em dispositivo ainda pendentes: adicionar/remover/redimensionar, cada atalho com app fechada/aberta/bloqueada, autenticação cancelada, conta sem sessão e idiomas/fontes grandes.

Referência: https://developer.android.com/develop/ui/views/appwidgets


## Entrada e saída por localização — Android 0.2.0

Implementação opcional Desativado/Semiautomático/Automático, sem turnos obrigatórios. Zona cifrada no Android; eventos importados no sistema existente ao reabrir e sincronizar. Sem novas tabelas Supabase.

Java Android, build web e testes passaram. O APK está preparado sem assinatura; aguarda autorização para reutilizar a chave de testes anterior e ainda exige testes num telefone real. Atualizar o website não instala geofencing nem o widget.

[Documentação, permissões, ficheiros e testes](../docs/entrada-saida-automatica.md).

# Zeitkonto — preparação Google Play e APK de testes

Preparado em 03/10/2026 na branch `prepare/android-api36-stable-host`. Sem publicação na Google Play e sem alterações na `main`.

## Pacotes e assinatura

| Destino | Pacote | Formato | Assinatura |
|---|---|---|---|
| Atualização de teste | `com.ltuga.zeitkonto.test` | APK, versionCode 6 | Exige a mesma chave do APK instalado |
| Google Play | `com.ltuga.zeitkonto` | AAB, versionCode 6 | Exige chave de upload e configuração Play App Signing |

Android 11 ou superior; compileSdk/targetSdk 36. A chave de testes original não foi encontrada. O certificado público de um APK não permite recuperar a chave privada. Um APK não assinado não pode ser instalado; um AAB não assinado não está pronto para submissão.

As variáveis de assinatura estão documentadas em `android/README.md`. Não colocar chaves ou palavras-passe no Git, em mensagens, ficheiros públicos ou nos próprios artefactos. Não instalar por cima do APK existente até comparar os certificados.

## Texto proposto para a ficha da loja

Nome: **Zeitkonto**

Descrição curta: **Regista trabalho, pausas, férias e saldo de horas num só lugar.**

Descrição completa:

> Organiza os teus registos de trabalho com a Zeitkonto. Regista entradas, saídas e pausas, acompanha férias e ausências e consulta o saldo de horas.
>
> Edita registos, consulta o calendário e sincroniza os dados da tua conta entre a app e a versão web. A app suporta português, alemão, inglês e turco.
>
> Opcionalmente, configura o local de trabalho para sugerir ou registar entradas e saídas por localização. Esta função pode usar localização precisa em segundo plano e pode ser desativada. O funcionamento depende das permissões e das condições do dispositivo.
>
> Inclui bloqueio por biometria ou código do dispositivo e um widget com atalhos. O primeiro acesso e a sincronização precisam de Internet.
>
> A Zeitkonto é uma ferramenta de registo pessoal. Os valores devem ser conferidos com os registos oficiais do empregador.

Categoria proposta: Produtividade. Contacto: `Ltugamatos@gmail.com`.

## Endereços atuais

- App: https://meu-tempo-luis.ltugamatos.chatgpt.site/
- Privacidade: https://meu-tempo-luis.ltugamatos.chatgpt.site/privacy
- Suporte: https://meu-tempo-luis.ltugamatos.chatgpt.site/support
- Eliminação: https://meu-tempo-luis.ltugamatos.chatgpt.site/delete-account

O endereço atual foi recuperado. A migração para alojamento independente continua pendente; só substituir os endereços depois de validar o destino e a preservação dos dados.

## Pendências de submissão

- Recuperar a chave de testes original para entregar uma atualização instalável.
- Configurar a chave de upload de produção com guarda e cópia de segurança privadas.
- Executar os testes físicos de `android-real-device-tests.md`; login, sincronização, offline, biometria, localização e atualização ainda precisam de observação num telefone.
- Rever Data Safety segundo `google-play-data-safety.md`, incluindo pedidos de mapas, dados de doença, analytics e retenção real.
- Confirmar a identificação jurídica do responsável, contratos de tratamento e traduções da política conforme os idiomas de distribuição.
- Preparar a declaração de localização em segundo plano e o vídeo de demonstração da funcionalidade e divulgação antes das permissões.
- Fornecer ao revisor uma conta fictícia de acesso em canal privado da Play Console. Não colocar credenciais neste documento.
- Preparar capturas reais da aplicação, ícone da loja e imagem de destaque; não apresentar mockups como capturas reais.
- Confirmar a classificação etária, declaração de anúncios (não há publicidade no código atual) e declaração de aplicações de saúde aplicável aos registos de doença.
- Verificar os requisitos de teste fechado da conta Play Console. Contas pessoais abrangidas podem precisar de 12 testers por 14 dias antes de pedir acesso à produção.

Fontes oficiais:

- https://developer.android.com/google/play/requirements/target-sdk
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/9799150
- https://support.google.com/googleplay/android-developer/answer/13327111

## Estado de validação

52 asserções Java passaram nesta sessão. São testes de lógica, não instrumentação Android.
TypeScript, 88 testes web, lint sem erros (34 avisos) e build web passaram na mesma revisão de código antes das alterações exclusivamente Android/documentação.
Os resultados do build Android e os hashes dos artefactos ficam registados no relatório de entrega quando a compilação terminar.

## Compilação concluída nesta sessão

`assembleDebug lintDebug bundleRelease lintRelease`: **BUILD SUCCESSFUL** com JDK 17.0.20.1, Gradle 8.11.1, AGP 8.10.1, SDK/Build Tools 36.0.0. Cada variante tem 0 erros e 6 avisos de lint (compatibilidade de atributos, um recurso não usado e um texto fixo). Avisos de APIs deprecated e de versão XML do SDK não impediram o build.

APK verificado: pacote `com.ltuga.zeitkonto.test`, compileSdk/targetSdk 36, minSdk 30 e versionCode 6. Alinhamento ZIP aprovado. `apksigner verify` confirma ausência de assinatura; não distribuir como atualização instalável. AAB sem assinatura de upload. Ambos os arquivos passaram a verificação de integridade ZIP. Nenhum teste físico foi executado.

| Artefacto | SHA-256 |
|---|---|
| app-debug-unsigned.apk | `67bd579a4bb60220309d8cf1692ddc664b57be365d832f4119e7e2b38038e023` |
| app-release.aab | `737668b78851100b6fe5a242a3b3fda6c0c879552e3299125d94e757bb4b43f1` |

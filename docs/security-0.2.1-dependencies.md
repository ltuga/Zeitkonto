# Inventário de vulnerabilidades — Zeitkonto 0.2.1

Auditoria pnpm de 27/09/2026. Base `780a4f2`. Uma secção por advisory; as contagens incluem múltiplos avisos do mesmo pacote. Aplicabilidade inferida a partir do código e handlers instalados; não foram executados exploits em produção.

| Gravidade | Antes | Depois |
|---|---:|---:|
| critical | 2 | 0 |
| high | 36 | 2 |
| moderate | 19 | 1 |
| low | 4 | 1 |

## CRITICAL — next — Next.js: Unauthenticated Remote Code Execution on windows-hosted servers

- Advisory: https://github.com/advisories/GHSA-p293-qw3h-jr36
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.3.3`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.3.3`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## CRITICAL — next — Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used

- Advisory: https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.3.3`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.3.3`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups

- Advisory: https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
- Versões afetadas instaladas antes: 1.1.14. Intervalo vulnerável: `<1.1.16`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/config-array>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=1.1.16`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups

- Advisory: https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
- Versões afetadas instaladas antes: 5.0.6. Intervalo vulnerável: `>=3.0.0 <5.0.7`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>@typescript-eslint/typescript-estree>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=5.0.7`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash

- Advisory: https://github.com/advisories/GHSA-mh99-v99m-4gvg
- Versões afetadas instaladas antes: 1.1.14. Intervalo vulnerável: `<1.1.17`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/config-array>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=1.1.17`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash

- Advisory: https://github.com/advisories/GHSA-mh99-v99m-4gvg
- Versões afetadas instaladas antes: 5.0.6. Intervalo vulnerável: `>=4.0.0 <5.0.8`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>@typescript-eslint/typescript-estree>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=5.0.8`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation

- Advisory: https://github.com/advisories/GHSA-rgw5-rvv9-x895
- Versões afetadas instaladas antes: 5.0.6. Intervalo vulnerável: `>=4.0.0 <5.0.9`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>@typescript-eslint/typescript-estree>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=5.0.9`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — brace-expansion — brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation

- Advisory: https://github.com/advisories/GHSA-rgw5-rvv9-x895
- Versões afetadas instaladas antes: 1.1.14. Intervalo vulnerável: `<1.1.18`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/config-array>minimatch>brace-expansion`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Padrões glob não fiáveis podem causar DoS; não há endpoint de expansão. Atualizado nas mesmas linhas.
- Versão/intervalo corrigido publicado: `>=1.1.18`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 1.1.18, 5.0.9.
- Resultado: eliminado da auditoria após atualização.

## HIGH — browserslist — Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM

- Advisory: https://github.com/advisories/GHSA-c83g-rgw3-j3cx
- Versões afetadas instaladas antes: 4.28.2. Intervalo vulnerável: `<=4.28.6`.
- Relação: transitiva. Dependências raiz que a introduzem: `@vitejs/plugin-rsc`, `eslint-config-next`, `next`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@vitejs/plugin-rsc>react-server-dom-webpack>webpack>browserslist`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Queries/stats não fiáveis afetam build, não endpoint de utilizador. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.28.7`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.28.7.
- Resultado: eliminado da auditoria após atualização.

## HIGH — browserslist — Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)

- Advisory: https://github.com/advisories/GHSA-73wf-gq98-2v4g
- Versões afetadas instaladas antes: 4.28.2. Intervalo vulnerável: `<=4.28.6`.
- Relação: transitiva. Dependências raiz que a introduzem: `@vitejs/plugin-rsc`, `eslint-config-next`, `next`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@vitejs/plugin-rsc>react-server-dom-webpack>webpack>browserslist`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Queries/stats não fiáveis afetam build, não endpoint de utilizador. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.28.7`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.28.7.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to host confusion via literal backslash authority delimiter

- Advisory: https://github.com/advisories/GHSA-v2hh-gcrm-f6hx
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.0.0 <=3.1.3`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.4`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to host confusion via backslash authority introducer

- Advisory: https://github.com/advisories/GHSA-7p8r-x3mc-p8w7
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.0.0 <3.1.5`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.5`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization

- Advisory: https://github.com/advisories/GHSA-f65p-4m7j-42xc
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.0.0 <3.1.6`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.6`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to server-side request forgery via repeated hostname percent-decoding

- Advisory: https://github.com/advisories/GHSA-fph4-wmhf-6fwf
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.1.2 <3.1.6`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.6`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to host confusion via percent-encoded scheme normalization

- Advisory: https://github.com/advisories/GHSA-jqff-g426-hqxp
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.0.0 <3.1.6`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.6`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — fast-uri — fast-uri vulnerable to host confusion via failed IDN canonicalization

- Advisory: https://github.com/advisories/GHSA-4c8g-83qw-93j6
- Versões afetadas instaladas antes: 3.1.2. Intervalo vulnerável: `>=3.0.0 <3.1.3`.
- Relação: transitiva. Dependências raiz que a introduzem: `@hookform/resolvers`, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@hookform/resolvers>ajv-formats>ajv>fast-uri`.
- Uso real: Transitiva validação/build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Introduzido por AJV e tooling; app usa Zod, não usa fast-uri para decidir destinos de fetch. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.1.3`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.1.6.
- Resultado: eliminado da auditoria após atualização.

## HIGH — image-size — image-size: JXL and HEIF parsers allow denial of service through infinite loops

- Advisory: https://github.com/advisories/GHSA-5p2g-fcmc-qvqq
- Versões afetadas instaladas antes: 2.0.2. Intervalo vulnerável: `>=1.2.0 <=2.0.2`.
- Relação: transitiva. Dependências raiz que a introduzem: `vinext`.
- Caminho representativo: `.>vinext>image-size`.
- Uso real: Transitiva Vinext metadata/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Parsers JXL/HEIF/ICNS com entradas malformadas; imagens locais controladas, sem upload. Atualizado.
- Versão/intervalo corrigido publicado: `>=2.0.3`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 2.0.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — image-size — image-size: ICNS parser allows denial of service through an infinite loop

- Advisory: https://github.com/advisories/GHSA-w3rx-r6r6-pgpr
- Versões afetadas instaladas antes: 2.0.2. Intervalo vulnerável: `>=0.6.3 <=2.0.2`.
- Relação: transitiva. Dependências raiz que a introduzem: `vinext`.
- Caminho representativo: `.>vinext>image-size`.
- Uso real: Transitiva Vinext metadata/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Parsers JXL/HEIF/ICNS com entradas malformadas; imagens locais controladas, sem upload. Atualizado.
- Versão/intervalo corrigido publicado: `>=2.0.3`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 2.0.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — js-yaml — js-yaml: YAML merge-key chains can force quadratic CPU consumption

- Advisory: https://github.com/advisories/GHSA-52cp-r559-cp3m
- Versões afetadas instaladas antes: 4.1.1. Intervalo vulnerável: `>=4.0.0 <4.3.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/eslintrc>js-yaml`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Configuração YAML não fiável pode causar DoS no tooling. Não há endpoint YAML. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.3.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.3.2.
- Resultado: eliminado da auditoria após atualização.

## HIGH — js-yaml — JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported

- Advisory: https://github.com/advisories/GHSA-5p4m-2wfm-xmqj
- Versões afetadas instaladas antes: 4.1.1. Intervalo vulnerável: `>=4.0.0 <4.3.1`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/eslintrc>js-yaml`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Configuração YAML não fiável pode causar DoS no tooling. Não há endpoint YAML. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.3.1`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.3.2.
- Resultado: eliminado da auditoria após atualização.

## HIGH — js-yaml — js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources

- Advisory: https://github.com/advisories/GHSA-2883-xcg3-v3hh
- Versões afetadas instaladas antes: 4.1.1. Intervalo vulnerável: `>=4.0.0 <4.3.2`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/eslintrc>js-yaml`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Configuração YAML não fiável pode causar DoS no tooling. Não há endpoint YAML. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.3.2`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.3.2.
- Resultado: eliminado da auditoria após atualização.

## HIGH — nanoid — nanoid: non-secure generators can loop indefinitely with negative size

- Advisory: https://github.com/advisories/GHSA-28wg-ghj8-5hjv
- Versões afetadas instaladas antes: 3.3.12. Intervalo vulnerável: `<3.3.16`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@tailwindcss/postcss`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `next`, `react-server-dom-webpack`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite>postcss>nanoid`.
- Uso real: Transitiva build/PostCSS. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Tamanhos zero/negativos em APIs específicas; sem parâmetro de utilizador nesse caminho. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.3.16`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.3.18.
- Resultado: eliminado da auditoria após atualização.

## HIGH — nanoid — nanoid: custom generators can loop indefinitely when size is zero

- Advisory: https://github.com/advisories/GHSA-2v37-7h3g-55p8
- Versões afetadas instaladas antes: 3.3.12. Intervalo vulnerável: `<3.3.18`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@tailwindcss/postcss`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `next`, `react-server-dom-webpack`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite>postcss>nanoid`.
- Uso real: Transitiva build/PostCSS. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Tamanhos zero/negativos em APIs específicas; sem parâmetro de utilizador nesse caminho. Atualizado.
- Versão/intervalo corrigido publicado: `>=3.3.18`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 3.3.18.
- Resultado: eliminado da auditoria após atualização.

## HIGH — next — Next.js: Middleware / Proxy bypass in App Router applications using Turbopack and single locale

- Advisory: https://github.com/advisories/GHSA-6gpp-xcg3-4w24
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — next — Next.js: Denial of Service in App Router using Server Actions

- Advisory: https://github.com/advisories/GHSA-m99w-x7hq-7vfj
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — next — Next.js: Server-Side Request Forgery in Server Actions on custom servers

- Advisory: https://github.com/advisories/GHSA-89xv-2m56-2m9x
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — next — Next.js: Server-Side Request Forgery in rewrites via attacker-controlled destination hostname

- Advisory: https://github.com/advisories/GHSA-p9j2-gv94-2wf4
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## HIGH — postcss — PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments

- Advisory: https://github.com/advisories/GHSA-6g55-p6wh-862q
- Versões afetadas instaladas antes: 8.4.31. Intervalo vulnerável: `<=8.5.11`.
- Relação: transitiva. Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next>postcss`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Parsing CSS/source maps não fiáveis no build; CSS do repositório controlado. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.5.12`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.5.23.
- Resultado: eliminado da auditoria após atualização.

## HIGH — postcss — PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure

- Advisory: https://github.com/advisories/GHSA-r28c-9q8g-f849
- Versões afetadas instaladas antes: 8.4.31, 8.5.14. Intervalo vulnerável: `<=8.5.17`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@tailwindcss/postcss`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `next`, `react-server-dom-webpack`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite>postcss`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Parsing CSS/source maps não fiáveis no build; CSS do repositório controlado. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.5.18`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.5.23.
- Resultado: eliminado da auditoria após atualização.

## HIGH — react-server-dom-webpack — react-server-dom: Denial of Service in Server Functions

- Advisory: https://github.com/advisories/GHSA-wx67-qw84-cm4g
- Versões afetadas instaladas antes: 19.2.6. Intervalo vulnerável: `>=19.2.0 <19.2.8`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `@vitejs/plugin-rsc`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@vitejs/plugin-rsc>react-server-dom-webpack`.
- Uso real: Direta dev no manifest, mas runtime RSC no Worker. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Potencialmente relevante no servidor RSC; patch obrigatório, aplicado.
- Versão/intervalo corrigido publicado: `>=19.2.8`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 19.2.8.
- Resultado: eliminado da auditoria após atualização.

## HIGH — sharp — sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591

- Advisory: https://github.com/advisories/GHSA-f88m-g3jw-g9cj
- Versões afetadas instaladas antes: 0.34.5. Intervalo vulnerável: `<0.35.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `next`, `vinext`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>sharp`.
- Uso real: Transitiva; Next opcional / Miniflare dev. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Next optimizer não usado. Miniflare local processa imagens: risco se receber AVIF/imagens não fiáveis. Permanecem avisos na versão do Miniflare.
- Versão/intervalo corrigido publicado: `>=0.35.0`. Compatibilidade: não forçada nas linhas antigas indicadas no relatório.
- Versões resolvidas depois no lockfile: 0.34.5, 0.35.4.
- Resultado: PERMANECE; risco/condições e decisão em security-0.2.1.md.

## HIGH — sharp — sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545

- Advisory: https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
- Versões afetadas instaladas antes: 0.34.5. Intervalo vulnerável: `<0.35.4`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `next`, `vinext`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>sharp`.
- Uso real: Transitiva; Next opcional / Miniflare dev. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Next optimizer não usado. Miniflare local processa imagens: risco se receber AVIF/imagens não fiáveis. Permanecem avisos na versão do Miniflare.
- Versão/intervalo corrigido publicado: `>=0.35.4`. Compatibilidade: não forçada nas linhas antigas indicadas no relatório.
- Versões resolvidas depois no lockfile: 0.34.5, 0.35.4.
- Resultado: PERMANECE; risco/condições e decisão em security-0.2.1.md.

## HIGH — undici — undici vulnerable to TLS certificate validation bypass via dropped requestTls in SOCKS5 ProxyAgent

- Advisory: https://github.com/advisories/GHSA-vmh5-mc38-953g
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.23.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## HIGH — undici — undici WebSocket client vulnerable to denial of service via fragment count bypass

- Advisory: https://github.com/advisories/GHSA-vxpw-j846-p89q
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## HIGH — undici — undici vulnerable to cross-origin request routing via SOCKS5 proxy pool reuse

- Advisory: https://github.com/advisories/GHSA-hm92-r4w5-c3mj
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.23.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## HIGH — undici — undici vulnerable to cross-user information disclosure and parse-time crash via degenerate private cache directives

- Advisory: https://github.com/advisories/GHSA-4cwx-7wf7-3272
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## HIGH — vite — vite: `server.fs.deny` bypass on Windows alternate paths

- Advisory: https://github.com/advisories/GHSA-fx2h-pf6j-xcff
- Versões afetadas instaladas antes: 8.0.13. Intervalo vulnerável: `>=8.0.0 <=8.0.15`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite`.
- Uso real: Direta build/dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Avisos do dev server Windows; não serve produção Cloudflare. Patch aplicado.
- Versão/intervalo corrigido publicado: `>=8.0.16`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.0.16.
- Resultado: eliminado da auditoria após atualização.

## HIGH — ws — ws: Memory exhaustion DoS from tiny fragments and data chunks

- Advisory: https://github.com/advisories/GHSA-96hv-2xvq-fx4p
- Versões afetadas instaladas antes: 8.18.0. Intervalo vulnerável: `>=8.0.0 <8.21.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>ws`.
- Uso real: Transitiva tooling Cloudflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: WebSocket do emulador/dev; app não expõe servidor ws em produção. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.21.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.21.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — baseline-browser-mapping — baseline-browser-mapping process termination on invalid input causes denial of service

- Advisory: https://github.com/advisories/GHSA-w5vr-8v7q-w6rv
- Versões afetadas instaladas antes: 2.10.30. Intervalo vulnerável: `>=2.0.0 <2.11.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@vitejs/plugin-rsc`, `eslint-config-next`, `next`, `react-server-dom-webpack`, `vinext`.
- Caminho representativo: `.>@vitejs/plugin-rsc>react-server-dom-webpack>webpack>browserslist>baseline-browser-mapping`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Entrada inválida em mapeamento de browsers; não é API da app. Atualizado.
- Versão/intervalo corrigido publicado: `>=2.11.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 2.11.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — esbuild — esbuild enables any website to send any requests to the development server and read the response

- Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
- Versões afetadas instaladas antes: 0.18.20. Intervalo vulnerável: `<=0.24.2`.
- Relação: transitiva. Dependências raiz que a introduzem: `drizzle-kit`.
- Caminho representativo: `.>drizzle-kit>@esbuild-kit/esm-loader>@esbuild-kit/core-utils>esbuild`.
- Uso real: Transitiva build/dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Condição: servidor esbuild exposto (e Windows para o aviso baixo). Não é o servidor de produção. Linhas antigas dos consumidores não forçadas.
- Versão/intervalo corrigido publicado: `>=0.24.3`. Compatibilidade: não forçada nas linhas antigas indicadas no relatório.
- Versões resolvidas depois no lockfile: 0.18.20, 0.25.12, 0.27.3, 0.28.1.
- Resultado: PERMANECE; risco/condições e decisão em security-0.2.1.md.

## MODERATE — fflate — fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives

- Advisory: https://github.com/advisories/GHSA-px8p-9vwx-vf98
- Versões afetadas instaladas antes: 0.7.4. Intervalo vulnerável: `>=0.7.0 <0.7.5`.
- Relação: transitiva. Dependências raiz que a introduzem: `vinext`.
- Caminho representativo: `.>vinext>@vercel/og>satori>@shuding/opentype.js>fflate`.
- Uso real: Transitiva Vinext/OG. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Descompressão ZIP de fontes via OG; app não tem endpoint OG/upload ZIP. Atualizado.
- Versão/intervalo corrigido publicado: `>=0.7.5`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 0.7.5.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — js-yaml — JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases

- Advisory: https://github.com/advisories/GHSA-h67p-54hq-rp68
- Versões afetadas instaladas antes: 4.1.1. Intervalo vulnerável: `>=4.0.0 <=4.1.1`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint`, `eslint-config-next`.
- Caminho representativo: `.>eslint-config-next>eslint-import-resolver-typescript>eslint-plugin-import>@typescript-eslint/parser>eslint>@eslint/eslintrc>js-yaml`.
- Uso real: Transitiva lint/build. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Configuração YAML não fiável pode causar DoS no tooling. Não há endpoint YAML. Atualizado.
- Versão/intervalo corrigido publicado: `>=4.1.2`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 4.3.2.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — next — Next.js: Cache confusion of response bodies for requests with bodies

- Advisory: https://github.com/advisories/GHSA-68g3-v927-f742
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — next — Next.js: Cache confusion of response bodies for requests with bodies containing invalid UTF-8 byte sequences

- Advisory: https://github.com/advisories/GHSA-4633-3j49-mh5q
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — next — Next.js: Unbounded Server Action payload in Edge runtime

- Advisory: https://github.com/advisories/GHSA-4c39-4ccg-62r3
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — next — Next.js: Denial of Service in the Image Optimization API using SVGs

- Advisory: https://github.com/advisories/GHSA-q8wf-6r8g-63ch
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — next — Next.js: Unauthenticated disclosure of internal Server Function endpoints

- Advisory: https://github.com/advisories/GHSA-955p-x3mx-jcvp
- Versões afetadas instaladas antes: 16.2.6. Intervalo vulnerável: `>=16.0.0 <16.2.11`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next`.
- Uso real: Direta produção; runtime substituído por Vinext. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Handlers Next afetados não usados neste deployment; atualizado por defesa em profundidade.
- Versão/intervalo corrigido publicado: `>=16.2.11`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 16.3.3.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — postcss — PostCSS has XSS via Unescaped </style> in its CSS Stringify Output

- Advisory: https://github.com/advisories/GHSA-qx2v-qp2m-jg93
- Versões afetadas instaladas antes: 8.4.31. Intervalo vulnerável: `<8.5.10`.
- Relação: transitiva. Dependências raiz que a introduzem: `next`, `vinext`.
- Caminho representativo: `.>next>postcss`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Parsing CSS/source maps não fiáveis no build; CSS do repositório controlado. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.5.10`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.5.23.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — postcss — PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset

- Advisory: https://github.com/advisories/GHSA-fxqj-rqcc-2cmp
- Versões afetadas instaladas antes: 8.4.31, 8.5.14. Intervalo vulnerável: `<=8.5.22`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@tailwindcss/postcss`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `next`, `react-server-dom-webpack`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite>postcss`.
- Uso real: Transitiva build. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Parsing CSS/source maps não fiáveis no build; CSS do repositório controlado. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.5.23`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.5.23.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to HTTP header injection via Set-Cookie percent-decoding

- Advisory: https://github.com/advisories/GHSA-p88m-4jfj-68fv
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to cross-user information disclosure via shared cache whitespace bypass

- Advisory: https://github.com/advisories/GHSA-pr7r-676h-xcf6
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to downstream response desynchronization via retry interceptor

- Advisory: https://github.com/advisories/GHSA-8xcm-r25x-g524
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to CRLF Injection via blob-like body 'type' property

- Advisory: https://github.com/advisories/GHSA-m8rv-5g2x-5cg5
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to cross-user information disclosure via whitespace around equals in Cache-Control directives

- Advisory: https://github.com/advisories/GHSA-jr45-8vmc-qm54
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — undici — undici vulnerable to cookie attribute injection via unsanitized domain and unparsed setCookie fields

- Advisory: https://github.com/advisories/GHSA-v3r7-h72x-cjcm
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — vite — launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows

- Advisory: https://github.com/advisories/GHSA-v6wh-96g9-6wx3
- Versões afetadas instaladas antes: 8.0.13. Intervalo vulnerável: `>=8.0.0 <=8.0.15`.
- Relação: direta (e também caminhos transitivos). Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `vinext`, `vite`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite`.
- Uso real: Direta build/dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Avisos do dev server Windows; não serve produção Cloudflare. Patch aplicado.
- Versão/intervalo corrigido publicado: `>=8.0.16`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.0.16.
- Resultado: eliminado da auditoria após atualização.

## MODERATE — ws — ws: Uninitialized memory disclosure

- Advisory: https://github.com/advisories/GHSA-58qx-3vcg-4xpx
- Versões afetadas instaladas antes: 8.18.0. Intervalo vulnerável: `>=8.0.0 <8.20.1`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>ws`.
- Uso real: Transitiva tooling Cloudflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: WebSocket do emulador/dev; app não expõe servidor ws em produção. Atualizado.
- Versão/intervalo corrigido publicado: `>=8.20.1`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 8.21.0.
- Resultado: eliminado da auditoria após atualização.

## LOW — @babel/core — @babel/core: Arbitrary File Read via sourceMappingURL Comment

- Advisory: https://github.com/advisories/GHSA-4x5r-pxfx-6jf8
- Versões afetadas instaladas antes: 7.29.0. Intervalo vulnerável: `<=7.29.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `eslint-config-next`, `next`, `vinext`.
- Caminho representativo: `.>eslint-config-next>eslint-plugin-react-hooks>@babel/core`.
- Uso real: Transitiva build/lint. Classificação pnpm das ocorrências: produção ou misto.
- Aplicabilidade: Source maps de código não fiável no build; não atende pedidos da app. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.29.1`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.6.
- Resultado: eliminado da auditoria após atualização.

## LOW — esbuild — esbuild allows arbitrary file read when running the development server on Windows

- Advisory: https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
- Versões afetadas instaladas antes: 0.27.3, 0.28.0. Intervalo vulnerável: `>=0.27.3 <0.28.1`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `drizzle-kit`, `react-server-dom-webpack`, `vinext`, `vite`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>vite>esbuild`.
- Uso real: Transitiva build/dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Condição: servidor esbuild exposto (e Windows para o aviso baixo). Não é o servidor de produção. Linhas antigas dos consumidores não forçadas.
- Versão/intervalo corrigido publicado: `>=0.28.1`. Compatibilidade: não forçada nas linhas antigas indicadas no relatório.
- Versões resolvidas depois no lockfile: 0.18.20, 0.25.12, 0.27.3, 0.28.1.
- Resultado: PERMANECE; risco/condições e decisão em security-0.2.1.md.

## LOW — undici — undici vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching

- Advisory: https://github.com/advisories/GHSA-g8m3-5g58-fq7m
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

## LOW — undici — undici vulnerable to HTTP response queue poisoning via keep-alive socket reuse

- Advisory: https://github.com/advisories/GHSA-35p6-xmwp-9g52
- Versões afetadas instaladas antes: 7.24.8. Intervalo vulnerável: `>=7.0.0 <7.28.0`.
- Relação: transitiva. Dependências raiz que a introduzem: `@cloudflare/vite-plugin`, `wrangler`.
- Caminho representativo: `.>@cloudflare/vite-plugin>miniflare>undici`.
- Uso real: Transitiva Miniflare dev. Classificação pnpm das ocorrências: dev.
- Aplicabilidade: Proxies/cache/cookies/WebSocket do cliente Node de emulação; Worker usa fetch do runtime, não este cliente. Atualizado.
- Versão/intervalo corrigido publicado: `>=7.28.0`. Compatibilidade: atualização da mesma major/linha compatível; instalação, TypeScript, build e testes passaram.
- Versões resolvidas depois no lockfile: 7.29.0.
- Resultado: eliminado da auditoria após atualização.

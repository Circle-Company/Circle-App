# Fluxo de refresh de token e integração com Persisted (diagnóstico e correções)

Este documento descreve os problemas identificados no fluxo de autenticação/refresh e sua integração com o Persisted (onde os tokens são armazenados), além de listar correções concretas e um plano de teste.

Arquivos principais envolvidos:
- `src/api/index.ts` (instância Axios com interceptors e fluxo de refresh)
- `src/api/auth/auth.ts` (rotas de auth auxiliares)
- `src/api/moment/moment.actions.ts` (ações que enviam headers manualmente)
- `src/contexts/Persisted/index.tsx` (sincronização da sessão com as stores)
- `src/contexts/Persisted/persist.account.ts` (persistência de tokens e dados de conta)

---

## 1) Resumo do fluxo atual

- O app injeta o header `Authorization` automaticamente via interceptor, lendo o token salvo no MMKV (sem o prefixo "Bearer").
- Algumas chamadas (p.ex., `WATCH`, `LIKE`, `UNLIKE`, `COMMENT`) ainda passam `Authorization` manualmente por props.
- O refresh de token é disparado no `responseInterceptor` quando há `401` com `code === "VAL_1001"`.
- O refresh é single-flight: requests 401 subsequentes ficam enfileiradas até concluir a renovação.
- Após refresh, o novo `jwtToken` é salvo no MMKV e refletido no Zustand (`useAccountStore`), e o `api.defaults.headers.common.Authorization` é atualizado.

---

## 2) Sintomas observados nos logs

- Múltiplos `POST /moments/:id/watch` retornando 401.
- GETs de thumbnails retornam 200.
- `WATCH` dispara em sequência (perda de foco, erro de vídeo, loop), o que amplifica logs de 401 se o token estiver inválido e o refresh não acontecer.

---

## 3) Principais causas prováveis

1) Critério de refresh muito restritivo
- O refresh só acontece quando o backend responde 401 com `code === "VAL_1001"`. Caso o endpoint `WATCH` retorne 401 com outro `code` (ou sem `code`), o refresh não é disparado, causando 401 repetidos.

2) Divergência no formato do header no refresh
- O projeto tem dois pontos que chamam refresh:
  - `src/api/index.ts` (fluxo automático via interceptor), que envia `Authorization` com o refresh token “cru” (sem `Bearer`).
  - `src/api/auth/auth.ts` (helper que não é usado pelo interceptor), que envia `Authorization: Bearer <refreshToken>`.
- Se o backend for estrito quanto ao formato, essa divergência causa falhas silenciosas no refresh dependendo de qual rota/use case está em execução.

3) Token stale/obsoleto nas actions manuais
- Ao passar `authorizationToken` diretamente via props (capturado da sessão), pode ocorrer de:
  - A action usar o token antigo enquanto o refresh já atualizou o storage.
  - Requests paralelas dispararem com tokens diferentes (pré e pós refresh).

4) Ausência intermitente de header `Authorization`
- Em cenários de race (sincronização de sessão, init, logout parcial), pode ocorrer de uma `WATCH` sair sem header. Como o endpoint é sensível à autorização, resulta em 401.

---

## 4) Correções recomendadas (concretas)

A) Relaxar o critério de refresh no `responseInterceptor`
- Objetivo: disparar refresh também em 401 sem `code`, ou com `code` inesperado, uma única vez por request.
- Ação:
  - Em `src/api/index.ts`, ao montar `isRefreshable`, permitir fallback quando `response.status === 401`, não for a rota de refresh, e `_retry` for `false`, mesmo sem `code`:
  - Manter preferência por `VAL_1001` quando presente, mas aceitar `undefined` como refrescável.

B) Padronizar o formato do header no refresh token
- Objetivo: evitar inconsistências. O backend foi confirmado como esperando token sem `Bearer`. Padronizar ambos os pontos do código para usar header “cru”.
- Ação:
  - Em `src/api/index.ts` (função que chama refresh automaticamente), manter `Authorization: <refreshToken>` (sem `Bearer`).
  - Em `src/api/auth/auth.ts`, alinhar para o mesmo formato (“cru”) para evitar confusão futura:
    - Trocar `Authorization: Bearer ${refreshToken}` por `Authorization: ${refreshToken}`.

C) Centralizar o envio do token via interceptor (remover headers manuais das actions)
- Objetivo: eliminar risco de token stale, e ter um único ponto de verdade (MMKV/storage).
- Ação:
  - Em `src/api/moment/moment.actions.ts`, remover o `headers: { Authorization: props.authorizationToken }` e deixar apenas `api.post(url, body)`; o interceptor injeta o token do storage atualizado.
  - Aplicar o mesmo para `like`, `unlike`, `comment`, etc.
- Observação: Essa mudança simplifica e torna as actions idempotentes em relação à sessão. Se quiser manter headers manuais, garanta que sejam sobrepostos pelo interceptor após refresh.

D) Ajustar sincronização Persisted para não sobrescrever expiração com string vazia
- Objetivo: não apagar `jwtExpiration` já persistido em refresh quando o payload de sessão (ex.: sign-in) não trouxer esse campo.
- Ação:
  - Em `src/contexts/Persisted/index.tsx`, no trecho que seta `AccountState`, só aplicar `jwtExpiration` se vier valor válido do backend. Caso contrário, preservar o que já está em storage/Zustand.

E) Telemetria específica para `WATCH`
- Objetivo: confirmar se o header está presente e com o formato correto antes de enviar `WATCH`.
- Ação:
  - Em `src/api/index.ts` (request interceptor), adicionar um log leve e seguro (sem expor o token) quando `cfg.url` contiver `/moments/` e `/watch`:
    - Logar `authHeaderPresent: true/false` e um prefixo de 6–8 chars do token para depuração local.

---

## 5) Plano de implementação

1) Ajustar `src/api/index.ts`
- Relaxar `isRefreshable` para aceitar 401 sem `code` (uma tentativa).
- Manter refresh single-flight.
- Adicionar log seguro para requests `WATCH`:
  - `authHeaderPresent` e `authPreview` (primeiros 6–8 chars).
- Garantir que, após refresh, `api.defaults.headers.Authorization` receba o novo JWT.

2) Ajustar `src/api/auth/auth.ts`
- Unificar o formato do header do refresh token (sem `Bearer`), para consistência com o fluxo automático.

3) Ajustar `src/api/moment/moment.actions.ts`
- Remover os headers manuais de `Authorization` das funções `like`, `unlike`, `watch`, `comment`.
- Confiar no interceptor para injetar o token.
- Se alguma action precisar usar um token “customizado” (caso raro), documentar explicitamente.

4) Ajustar `src/contexts/Persisted/index.tsx`
- No `syncSessionData`, ao setar `account`, não sobrescrever `jwtExpiration` com `""` se não houver valor novo.
- Garantir que `signOut` e a limpeza de stores ocorra apenas quando tokens forem efetivamente removidos (o que já é feito quando o refresh falha).

---

## 6) Plano de teste

- Cenário 1: Token válido
  - Abrir app logado, executar `WATCH` (perda de foco, loop e erro de vídeo).
  - Verificar no console do app:
    - `▶️ WATCH request ... authHeaderPresent: true`.
    - Ausência de 401 no servidor.
- Cenário 2: Token expirado com backend retornando `VAL_1001`
  - Forçar expiração (ou aguardar).
  - Disparar `WATCH`.
  - Esperado:
    - Interceptor loga 401 e `code` `VAL_1001`.
    - Dispara refresh uma vez.
    - `WATCH` é repetido com sucesso.
- Cenário 3: Token expirado com backend retornando 401 sem `code`
  - Disparar `WATCH`.
  - Esperado:
    - Fallback tenta um refresh (uma vez), repete `WATCH` e funciona.
- Cenário 4: Falha no refresh (refresh token inválido)
  - Disparar request autenticada.
  - Esperado:
    - Limpeza de tokens no MMKV.
    - Persisted detecta não autenticado e limpa stores.
    - Fluxo volta para a tela de auth/splash.
- Cenário 5: Regressão de headers manuais
  - Confirmar que nenhuma action esteja mais setando `Authorization` manualmente.
  - Conferir que todas as requests autenticadas levam header via interceptor.

---

## 7) Riscos e mitigação

- Se o backend realmente exigir `Bearer` no refresh: padronizar ambos para `Bearer` em `index.ts` e `auth.ts`. Avaliar com o backend e ajustar rapidamente.
- Fallback de refresh em 401 sem `code` pode mascarar erros de credenciais inválidas não relacionados a expiração. Mitigar limitando o fallback a uma única tentativa por request (`_retry`).
- Remover headers manuais implica depender do interceptor; garantir cobertura de testes de integração.

---

## 8) Checklist das mudanças

- [ ] `src/api/index.ts`: Relaxar critério de refresh para 401 sem `code` (uma tentativa).
- [ ] `src/api/index.ts`: Log direcionado para `WATCH` confirmando `authHeaderPresent`.
- [ ] `src/api/auth/auth.ts`: Padronizar header do refresh para o mesmo formato usado no interceptor (sem `Bearer`).
- [ ] `src/api/moment/moment.actions.ts`: Remover headers manuais de `Authorization` em `watch`, `like`, `unlike`, `comment`.
- [ ] `src/contexts/Persisted/index.tsx`: Não sobrescrever `jwtExpiration` com string vazia quando não vier valor novo.
- [ ] Padronizar o header do refresh sem `Bearer` (confirmado com backend) em todos os pontos (`src/api/index.ts` e `src/api/auth/auth.ts`).
- [ ] Utilizar `api.defaults.headers.common.Authorization` para atualizar o JWT após refresh e limpar esse default no logout/falha de refresh.
- [ ] Executar o plano de testes e monitorar logs de servidor (401) e cliente.

---

## 9) Notas finais

- Centralizar a responsabilidade do header `Authorization` no interceptor reduz bugs de sincronização e previne uso de token stale em actions.
- A robustez do fluxo de refresh depende fortemente de um critério de revalidação que cubra endpoints que eventualmente retornem 401 sem `code`. O fallback controlado resolve este ponto.
- A integração Persisted continua como a fonte da verdade dos tokens (MMKV ←→ Zustand). Garantir que a atualização aconteça apenas quando existir dado novo evita “pisar” na expiração calculada após o refresh.
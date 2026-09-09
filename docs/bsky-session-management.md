# Sessão do usuário: armazenamento, estrutura e ciclo de vida

Mapa completo de como a sessão é criada, guardada, rotacionada e destruída, cobrindo
`src/state/session/` (estado em memória + clientes de rede) e `src/state/persisted/`
(camada de storage).

---

## 1. Visão geral em uma frase

O app guarda uma **lista de contas** (`accounts[]`), cada uma com seu par de JWTs
(`accessJwt` / `refreshJwt`), dentro de **uma única chave de storage** (`BSKY_STORAGE`).
Em memória, a conta ativa é materializada num **`SessionBundle`**: uma `PasswordSession`
(do `@atproto/lex-password-session`, que é quem realmente detém e rotaciona os tokens)
mais três `Client` de rede construídos sobre ela. O storage é a fonte de verdade fria
(cold start, sync entre abas); a `PasswordSession` é a fonte de verdade quente enquanto o
app roda.

```
              +------------------------- memória --------------------------+
 storage      |  SessionStore (reducer)      SessionBundle                 |
 BSKY_STORAGE |  |- accounts[]               |- session: PasswordSession   |  rede
   .session   |  \- currentBundleState       |- appviewClient  --proxy-->  |  PDS /
   |- accounts|       |- did                 |- pdsClient      --direto--> |  appview /
   \- current |       \- bundle  ----------->\- chatClient     --proxy-->  |  chat
      Account |                                                            |
              +------------------------------------------------------------+
                 ^                                    |
                 \----- persisted.write('session') ---/  (a cada needsPersist)
```

---

## 2. Onde os dados moram

### 2.1 Camada persistida

| Plataforma | Backend | Arquivo |
| --- | --- | --- |
| Nativo (iOS/Android) | `AsyncStorage`, chave `BSKY_STORAGE` | `src/state/persisted/index.ts` |
| Web | `localStorage`, chave `BSKY_STORAGE` + `BroadcastChannel` | `src/state/persisted/index.web.ts` |

Pontos importantes:

- **Um único blob JSON.** Todo o estado persistido do app (tema, prefs de idioma,
  sessão...) vive numa só chave, validado por Zod em `src/state/persisted/schema.ts`.
- **Sem criptografia.** Os JWTs ficam em texto claro no `AsyncStorage`/`localStorage`.
  Não há Keychain/Keystore nesse caminho.
- **`init()` precisa rodar antes de tudo.** O `SessionStore` lê `persisted.get('session')`
  no construtor (`src/state/session/index.tsx:86`) e comenta explicitamente que o
  `persisted` já tem que estar carregado.
- **Falha de validação derruba tudo.** Se o `safeParse` do schema falhar, `tryParse`
  descarta o estado persistido *inteiro* - todas as contas e preferências - e o app sobe
  deslogado. Por isso o schema é deliberadamente frouxo (quase todo campo é `optional()`).
  O único campo estritamente validado é `did` (`z.string().refine(isDidString)`), com um
  docblock avisando desse risco em `src/state/persisted/schema.ts`.
- **`get` vs `readLatest`.** `get` devolve o `_state` em memória. `readLatest`
  (`src/state/persisted/types.ts`) força uma releitura síncrona do `localStorage` **sem**
  adotá-la como `_state` - existe só para o resgate de expiração entre abas (§7). No
  nativo é idêntico a `get`.

### 2.2 Estrutura de uma conta persistida

`accountSchema` em `src/state/persisted/schema.ts`:

```ts
{
  service: string          // entryway onde logou, ex. "https://bsky.social/"
  did: DidString           // identidade canônica; ÚNICO campo estritamente validado
  handle: string
  email?: string
  emailConfirmed?: boolean
  emailAuthFactor?: boolean // 2FA por e-mail
  refreshJwt?: string      // opcional: pode expirar / ser limpo no logout
  accessJwt?: string       // idem
  signupQueued?: boolean   // derivado do scope do accessJwt
  active?: boolean
  status?: string          // takendown | suspended | deactivated
  pdsUrl?: string          // endpoint real do PDS (do didDoc)
  isSelfHosted?: boolean   // service não começa com BSKY_SERVICE
}
```

E a raiz da sessão:

```ts
session: {
  accounts: PersistedAccount[]              // todas as contas conhecidas do device
  currentAccount?: PersistedCurrentAccount  // hoje só o `did` importa; resto é legado
}
```

> `currentAccount` já carregou tokens em versões antigas. Hoje serve apenas como ponteiro
> por `did`; os campos restantes estão marcados como deprecated no schema.

**Consequência de multi-conta:** os tokens de *todas* as contas ficam salvos ao mesmo
tempo. Trocar de conta não requer login novo - basta reconstruir um bundle a partir da
entrada correspondente em `accounts[]`.

---

## 3. Estrutura em memória

### 3.1 `SessionAccount`

`src/state/session/types.ts`: é literalmente um alias de `PersistedAccount`. O mesmo
formato atravessa storage, reducer e contexto React - não há DTO intermediário.

### 3.2 `SessionBundle`

`src/state/session/session-core.ts`:

```ts
type SessionBundle = {
  session: PasswordSession   // núcleo de auth: detém tokens e faz o refresh
  appviewClient: Client      // header atproto-proxy -> appview; envia appLabelers
  pdsClient: Client          // sem proxy -> PDS da conta; appLabelers: null
  chatClient: Client         // proxy -> chat.bsky.*; envia appLabelers
  readonly service: URL
}
```

Deslogado, o equivalente é `PublicSessionBundle` (`session: null`), onde `pdsClient` e
`chatClient` são um cliente que **lança `NotAuthenticatedError` antes de qualquer I/O**
(`src/state/session/clients.ts`) - falha legível em vez de 4xx opaco.

Os três clientes diferem só em headers, mas isso é semanticamente carregado:

- `appviewClient`: propaga `Client.appLabelers` (autoridades de moderação).
- `pdsClient`: `appLabelers: null` - requisição a PDS não é leitura de appview, então não
  pode carregar autoridade de moderação nenhuma.
- `chatClient`: carrega labelers (o serviço de chat hidrata labels de perfis embutidos).

### 3.3 Estado do reducer

`src/state/session/reducer.ts`:

```ts
type State = {
  accounts: SessionAccount[]
  currentBundleState: {bundle: OpaqueSessionBundle; did: string | undefined}
  needsPersist: boolean // limpo assim que a persistência é agendada
}
```

O bundle entra no reducer como **`OpaqueSessionBundle`** (só `service` visível) de
propósito: o reducer usa o bundle apenas por **identidade referencial**, nunca lê suas
entranhas. Essa identidade é o mecanismo central de correção - ver §6.

---

## 4. Sobre os JWTs

O app **não valida assinatura** de JWT em lugar nenhum. Ele só decodifica o payload
(`jwt-decode`) para responder a poucas perguntas:

| Utilitário | Arquivo | O que faz |
| --- | --- | --- |
| `isJwtExpired(token)` | `src/lib/jwt.ts` | decodifica; sem `exp` implica expirado; compara com `Date.now()/1000`; erro de parse implica expirado |
| `isSignupQueued(accessJwt)` | `src/state/session/session-data.ts` | `scope === 'com.atproto.signupQueued'` (cadastro em fila de espera) |
| `isAppPassword(token)` | `src/lib/jwt.ts` | `scope === 'com.atproto.appPass'` |
| `isSessionExpired(account)` | `src/state/session/session-data.ts` | `accessJwt ? isJwtExpired(accessJwt) : true` |

**accessJwt** - curta duração, enviado em toda requisição pela `PasswordSession`. Usado
localmente só para: decidir o caminho rápido no resume, detectar signup em fila, e nas
comparações de igualdade entre abas.

**refreshJwt** - longa duração, é o que de fato mantém o login. Regras que valem a pena
gravar:

1. **Um refresh token é de uso único.** Cada rotação bem-sucedida invalida o anterior no
   servidor. Daí toda a paranoia com bundles antigos: o comentário no efeito de descarte
   em `src/state/session/index.tsx` é literalmente *"Replaced bundles must never consume
   another refresh token"*.
2. **A ausência de `refreshJwt` é o sinal de logout.** O reducer não remove a conta: ele
   zera `accessJwt`/`refreshJwt` e mantém a entrada (para o seletor de contas). Vários
   caminhos checam `if (!latestEntry.refreshJwt)` para detectar logout feito em outra aba.
3. **Quem rotaciona é a `PasswordSession`**, não o app. O app só observa via hooks.

---

## 5. Trajetória do dado - o ciclo completo

### 5.1 Cold start (abrir o app)

```
persisted.init()                       lê BSKY_STORAGE -> _state
  \- new SessionStore()                getInitialState(persisted.get('session').accounts)
       \- estado inicial: contas carregadas, currentBundleState = bundle PÚBLICO
InnerApp useEffect  (src/App.tsx / src/App.web.tsx)
  \- readLastActiveAccount()           accounts.find(a => a.did === currentAccount.did)
       |- nenhuma conta -> await features.init  -> app deslogado
       \- conta         -> await resumeSession(account)
```

Repare: o app **sobe sempre deslogado** e só então promove a sessão. `isReady` (splash) só
vira `true` depois disso.

### 5.2 `resumeSession` -> `createSessionBundleAndResume`

`src/state/session/session-core.ts`. Dois caminhos, decididos por `isSessionExpired`:

- **`accessJwt` ainda válido** -> `new PasswordSession(sessionData, hooks)` - construção
  **síncrona, sem rede**. Confia nos tokens guardados.
- **`accessJwt` expirado** -> `await PasswordSession.resume(sessionData, hooks)` - faz o
  refresh na rede. Rejeita apenas quando a sessão está definitivamente morta; falha
  transitória (offline) reporta via `onUpdateFailure` e **resolve com os tokens velhos**.
  Ou seja: um cold start offline permanece "logado" com tokens mortos, em vez de deslogar.

Depois, na ordem:

1. `buildBundle(session, storedAccount.pdsUrl)` - se há `pdsUrl` guardado e parseável,
   embrulha a sessão em `routeSessionToPds` para fixar o host. Isso existe pela **janela
   pré-didDoc**: antes de um refresh entregar o didDoc, a `PasswordSession` resolveria as
   URLs contra o *entryway* (`bsky.social`), que é o host errado para conta em PDS
   próprio; e o caminho rápido síncrono não faz requisição nenhuma, então a janela cobre
   todo o cold start.
2. `registerBundleKillSwitch` - guarda o `kill()` num `WeakMap` (não há destroy local na
   `PasswordSession`; o descarte é feito desabilitando fetch + hooks).
3. `configureModerationForAccount`, prefetch de age assurance, feature gates.
4. `finishPreparation(...)` - se a sessão foi destruída durante o preparo, é **fatal**:
   os hooks ainda estavam desarmados, então o evento `expired` foi engolido e nada
   deslogaria a conta; o bundle é descartado e a promise rejeita.
5. `hooks.arm()` - **só agora** os eventos de sessão passam a ser despachados. O latch
   desarmado é o que engole o `onUpdated` inicial do `resume`.
6. O provider valida o `AbortSignal` e reconfere que a conta ainda tem `refreshJwt` (outra
   aba pode ter deslogado durante o voo), e então despacha `switched-to-account`.

### 5.3 Login / criação de conta

`createSessionBundleAndLogin` / `createSessionBundleAndCreateAccount` seguem o mesmo
formato: `PasswordSession.login({identifier, password, authFactorToken, allowTakendown})`
-> `buildBundle` (sem `pdsUrl` fixado, pois o didDoc virá do login) -> preparo -> `arm()`
-> `switched-to-account`.

`switched-to-account` põe a conta **no topo** de `accounts[]` e marca `needsPersist`.

### 5.4 Rotação de token (o caminho quente)

```
requisição 401
  \- PasswordSession refresh interno
       |- sucesso     -> onUpdated(sessionData)      -+
       |- transitório -> onUpdateFailure()            +-- makeSessionHooks (session-core)
       \- morta       -> onDeleted(sessionData)      -+
                             |
                        dispatch(event, data)   [só se armed]
                             |
                   onSessionChange(bundle, did, event, data)   (index.tsx)
                             |
     +-----------------------+----------------------------+
   'update'             'network-error'                'expired'
     |                       |                             |
 sessionDataTo-         reducer ignora              tenta resgate (§7);
 SessionAccount()       ("assume transitório")      senão emitSessionDropped()
     |                                                     |
     +-----------> store.dispatch('received-session-event') +
                             |
              reducer: guard de identidade do bundle
                             |
                 accounts[] atualizado, needsPersist = true
                             |
                 persisted.write('session', {...})   <- síncrono, fora do render
                             |
                     (web) broadcast -> outras abas
```

Detalhes que valem a leitura:

- **A `PasswordSession` chama os hooks *antes* de atualizar o próprio getter.** Por isso o
  provider usa o `sessionData` entregue no callback, e não `session.session`.
- **O `pdsUrl` é costurado de volta à mão.** O payload de refresh geralmente não traz
  didDoc; sem esse fallback, o refresh persistiria `pdsUrl: undefined` e o próximo cold
  start roteraria para o entryway.
- **Um hook nunca pode lançar.** O `dispatch` é envolvido em try/catch com um comentário
  explicando: a `PasswordSession` aguarda os hooks dentro da atribuição da sua promise
  interna, então um throw síncrono deixaria essa promise permanentemente rejeitada - toda
  requisição futura falharia, e como a sessão nunca é marcada `destroyed`, nem o
  `disposeBundle` perceberia que ela está morta.
- **Persistência é síncrona ao dispatch**, não ao render: `SessionStore.dispatch` grava
  antes de notificar os listeners.

### 5.5 Refreshes explícitos

| API | O que faz |
| --- | --- |
| `refreshSession()` | Rotaciona os tokens. **Rejeita quando nada rodou** - `PasswordSession.refresh()` resolve com o *mesmo objeto* em falha transitória, então a detecção é por **identidade de objeto**, não comparação de campos. Também rejeita se o bundle deixou de ser o corrente durante o voo. Devolve o snapshot da conta na hora, porque o `onUpdated -> dispatch` está um ciclo de render adiante e o `SignupQueued` decide de forma síncrona. |
| `partialRefreshSession()` | Chama `com.atproto.server.getSession` no PDS e aplica só `emailConfirmed` / `emailAuthFactor`. **Não rotaciona tokens**, não reconstrói bundle, não gera efeitos de mudança de sessão. Lê o `did` da *resposta*, não da sessão (que pode ter sido descartada em voo e cujos getters lançam). |

### 5.6 Logout

`logged-out-current-account` (ou `logged-out-every-account`) no reducer:

1. **Efeito colateral dentro do reducer** (sim, é intencional):
   `createTemporaryClientsAndResume` monta sessões descartáveis de uso único - **sem hooks
   de ciclo de vida** - só para autenticar o `unregisterPushToken`. Essa isolação é
   essencial: uma rotação feita por elas não pode persistir por cima nem correr com os
   tokens da sessão viva.
2. Zera `accessJwt`/`refreshJwt` na(s) conta(s), **mantendo a entrada** em `accounts[]`.
3. `currentBundleState` volta a ser o bundle público.
4. `needsPersist = true` -> grava.
5. No provider: limpa dados de age assurance, `clearPersistedQueryStorage(did)`, reseta o
   onboarding, cancela tarefas pendentes.

`removeAccount` é o mesmo, mas **retira** a conta de `accounts[]`.

### 5.7 Descarte do bundle

`useEffect` no provider, comparando com `currentBundleRef`. O descarte é **adiado para
pós-commit** de propósito: componentes ainda podem renderizar contra o bundle que sai
durante o commit que o troca, e desabilitar a sessão inline puxaria o transporte debaixo
deles. Eventos emitidos nessa janela são descartados pelo guard de identidade do reducer.

---

## 6. O guard de identidade do bundle

É a invariante mais importante do módulo. Toda ação `received-session-event` começa com:

```ts
if (bundle !== state.currentBundleState.bundle) return state
```

Isso impede que um bundle obsoleto (de um login superado, de uma troca de conta, de um
logout) **(a)** deslogue a conta corrente, ou **(b)** ressuscite tokens depois de um
logout. O mesmo padrão reaparece em `refreshSession` (rejeita se o bundle mudou),
`createSessionBundleFromStoredAccount` (predicado `shouldActivate`) e no reset do
bookkeeping de resgate.

---

## 7. Resgate de expiração (multi-aba, web)

Cenário: a aba A rotaciona os tokens; a aba B estava congelada, ainda segura o refresh
token velho, tenta usá-lo e recebe `expired`. Deslogar tudo aí seria errado.

`src/state/session/index.tsx` + `src/state/session/expiry-rescue.ts`:

1. Registra o `refreshJwt` moribundo num `Set` por DID (`failedExpiryTokensRef`).
2. Busca candidatos: `persisted.readLatest('session')` (releitura forçada do storage,
   passando por cima de broadcasts na fila) e o estado do reducer.
3. `pickExpiryRescueCandidate` escolhe a primeira geração de token que seja diferente da
   que morreu e ainda não tenha falhado. Limite: `MAX_EXPIRY_RESCUE_GENERATIONS = 5`.
4. Se achar, reconstrói o bundle e despacha `replaced-current-bundle`
   (`needsPersist: false` - o dado veio de outra aba; persistir criaria um ciclo).
5. Se não achar, cai no caminho normal: `emitSessionDropped()` (toast "sua sessão
   expirou") e o reducer desloga.

O `Set` só é limpo por um evento `'update'` do bundle **corrente** - um update tardio de
bundle obsoleto não pode zerar o contador que limita o laço.

---

## 8. Sincronização entre abas (só web)

`persisted.write` no web:

1. Relê o storage e adota como `_state` **sem** disparar listeners (evita loop).
2. Fast path: se o valor não mudou (`JSON.stringify`), aborta - evita broadcast inútil.
3. Grava e emite dois `postMessage` (o segundo é backcompat).

Do outro lado, `persisted.onUpdate('session', ...)` no provider despacha `synced-accounts`
e então:

- Conta sincronizada é **outra** -> `resumeSession(syncedAccount)` (o líder já refrescou
  antes de transmitir, então os seguidores recebem tokens frescos).
- **Mesma** conta -> não dá para "patchar" uma `PasswordSession` no lugar; reconstrói o
  bundle a partir dos tokens do líder e despacha `replaced-current-bundle`, com uma
  checagem de igualdade de tokens antes para não trocar o bundle vivo à toa.
- Conta ficou **sem `refreshJwt`** (logout no líder) -> cancela as tarefas pendentes.

O bundle **não** é transmitido - apenas o blob persistido. Cada aba materializa a sua
própria `PasswordSession`. `readFromStorage` memoiza pela string bruta, devolvendo a mesma
referência para dados inalterados; é por isso que `readLatest` deliberadamente **não**
adota o resultado em `_state` (adotar suprimiria a notificação do broadcast enfileirado
para aquela mesma escrita, deixando mudanças de outras contas obsoletas indefinidamente).

---

## 9. O que é logado

`src/state/session/logging.ts` redige tudo antes de sair do device: JWTs viram booleanos
de presença (`hasAccessJwt` / `hasRefreshJwt`) e PII (e-mail, service, pdsUrl) é
descartada. Nenhum tipo de payload é sequer *capaz* de carregar um JWT vivo - o comentário
explica que os stubs devem ser religados a Sentry/Bitdrift.

---

## 10. Resumo do fluxo por evento

| Evento | Ação do reducer | Persiste? | Efeito no bundle |
| --- | --- | --- | --- |
| Login / criar conta | `switched-to-account` | sim | novo bundle, conta ao topo |
| Resume (cold start / troca) | `switched-to-account` | sim | novo bundle |
| Refresh bem-sucedido | `received-session-event` (`update`) | sim | mesmo bundle, tokens novos |
| Erro de rede | `received-session-event` (`network-error`) | não | inalterado (assumido transitório) |
| Sessão expirada (sem resgate) | `received-session-event` (`expired`) | sim | volta ao bundle público |
| Sessão expirada (com resgate) | `replaced-current-bundle` | **não** | bundle reconstruído |
| Sync entre abas | `synced-accounts` / `replaced-current-bundle` | **não** | pode reconstruir |
| `partialRefreshSession` | `partial-refresh-session` | sim | inalterado |
| Logout (uma conta) | `logged-out-current-account` | sim | bundle público |
| Logout (todas) | `logged-out-every-account` | sim | bundle público |
| Remover conta | `removed-account` | sim | público se era a corrente |

---

## 11. Observações de segurança

- Tokens em texto claro no `AsyncStorage`/`localStorage`; nada de Keychain/Keystore, nem
  criptografia em repouso.
- No web, `localStorage` é acessível a qualquer JS na origem - um XSS lê o `refreshJwt` de
  **todas** as contas guardadas, não só da ativa.
- Nenhuma verificação de assinatura de JWT no cliente: `exp` e `scope` são lidos de um
  payload não confiável. É aceitável (o servidor valida), mas significa que um token
  adulterado localmente muda decisões de roteamento do app.
- O logout limpa os tokens, mas **não revoga a sessão no servidor** - apenas cancela o
  push token. O `refreshJwt` continua válido no servidor até expirar.
- O logout preserva as entradas de conta (por design, para o seletor de contas); só
  `removeAccount` apaga.

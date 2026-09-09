# Gerenciamento de sessão no Circle (proposta)

Desenho de como armazenar, rotacionar e destruir a sessão do usuário seguindo a linha do
Bluesky (`docs/bsky-session-management.md`), mas **mantendo MMKV** como backend de storage
em vez de `AsyncStorage`.

Este documento é normativo: descreve o alvo, o que muda em relação ao código atual
(`src/api/index.ts`, `src/contexts/Persisted/`, `src/contexts/auth.tsx`) e em que ordem
migrar.

---

## 0. Por que mudar

O modelo atual espalha a sessão por **três chaves soltas de MMKV**
(`account:jwt:token`, `account:jwt:refreshtoken`, `account:jwt:expiration`) escritas por
pelo menos quatro lugares diferentes:

| Escritor | Arquivo | Escreve |
| --- | --- | --- |
| `useAccountStore.set` | `persist.account.ts` | token, refresh, expiração |
| `doRefreshToken` | `api/index.ts` | token, refresh, expiração (direto no MMKV **e** no Zustand) |
| `persistSession` | `contexts/auth.tsx` | token, refresh |
| limpeza terminal do 401 | `api/index.ts` | `safeDelete` das três |

Problemas que decorrem disso e que o desenho abaixo elimina:

1. **Não há dono único do token.** O axios muta MMKV e Zustand "sem hooks"; o
   `AuthProvider` também escreve; o `PersistedProvider` reconstrói o objeto inteiro a cada
   sync. Duas escritas concorrentes podem ressuscitar um token já invalidado.
2. **Escrita não atômica.** `token`, `refreshToken` e `expiration` são três `storage.set`
   independentes. Um crash entre eles deixa par de tokens inconsistente — access novo com
   refresh velho já queimado no servidor.
3. **Nenhuma proteção contra bundle obsoleto.** Um refresh em voo de uma sessão antiga
   (logout durante o voo, troca de conta) grava por cima da sessão nova. O Bluesky resolve
   isso com o *guard de identidade do bundle* (§6 do doc deles); hoje não temos equivalente.
4. **A sessão não está ancorada numa identidade.** As chaves são globais e anônimas: nada
   amarra `account:jwt:token` a *qual* usuário. Se um segundo Apple ID logar no mesmo
   device, os dados residuais do anterior (`likedMoments`, `readNotifications`, cache do
   React Query) podem sobreviver ao `clearSessionDataPreservingTutorial` e vazar de uma
   conta para a outra. Conta única não dispensa identidade persistida — exige.
5. ~~**Uma chave escapa do prefixo `@circle:` e nunca é apagada.**~~ **✅ Corrigido.** Em
   `src/store/index.ts`, `user.profilePicture` era `"user:profilepicture"` — **sem** o
   `baseKey`. Como `clearSessionDataPreservingTutorial()` varre só o que começa com
   `@circle:`, a foto de perfil do usuário anterior sobrevivia ao logout e ao login
   seguinte. A chave passou a ser prefixada, com migração one-shot do valor legado
   (`migrateUnprefixedProfilePicture`) e teste de regressão em
   `src/store/__tests__/profilePictureKey.spec.ts`.
   A causa permanece: prefixo por convenção, sem nada que force a convenção — é o que o
   `scopes.ts` do §11.2 resolve de vez.
6. **Logs vazam token.** Vários `console.log` imprimem `authPreview` (prefixo/sufixo do
   JWT) e `headerPreview` do **refresh token**. Em produção isso vai para o console do
   device e potencialmente para qualquer coletor de logs.
7. **Cold start não tem caminho definido.** `checkIsSigned()` lê a expiração e decide;
   não há um "resume" explícito que refresque antes de montar as telas.
8. **O `signOut` não limpa as stores em memória.** `src/contexts/auth.tsx` chama
   `useUserStore().remove()` / `useAccountStore().remove()` — os **hooks**, fora de um
   componente React. Zustand resolve isso por `useSyncExternalStore`, então a chamada
   quebra em runtime; como está dentro de um `try/catch` com `console.warn`, falha em
   silêncio. Só o MMKV é limpo (pelo `clearSessionDataPreservingTutorial`), e o Zustand
   segue com os dados do usuário anterior até o próximo cold start. A forma correta é
   `useUserStore.getState().remove()` — que é, aliás, exatamente o que `doRefreshToken` já
   faz em `api/index.ts`.
9. **Retomar do background desloga o usuário.** É o sintoma mais visível hoje e tem causa
   própria — §0.1.

### 0.1 A falha de retomada do background, passo a passo

Sintoma: o app fica em segundo plano, o usuário volta, **tudo** dá 401 e o app cai para a
tela de login. A sequência abaixo é o que o código atual faz:

```
app em background  ──────────────── access token expira ─────────────────►
                   (ninguém percebe: não há refresh proativo, nenhum timer)

usuário volta
  │
  ├─ React Query remonta as telas → rajada de N requests em paralelo
  │     todas com o access token morto lido do MMKV
  │
  ├─ N × 401
  │     req #1  → isRefreshing = false → dispara doRefreshToken()
  │     req #2..N → isRefreshing = true → entram em pendingQueue
  │     TODAS marcadas com _retry = true
  │
  └─ doRefreshToken() ──► e agora, três finais possíveis:

     (a) rede ainda não subiu (iOS retoma o JS antes do stack de rede)
         → erro de rede → NÃO é SessionExpiredError → transitório, tokens preservados ✔
         → MAS pendingQueue inteira é rejeitada, e todas as N requests já têm
           _retry = true. Um novo 401 nelas cai em "não é refrescável" e passa direto.
           React Query está com retry: false → N telas em erro.
         → "401 em tudo", mesmo com a sessão perfeitamente viva.

     (b) o refresh token também expirou durante o background
         → 401 na rota de refresh → REFRESH_REJECTED → terminal
         → safeDelete dos três tokens + notifySessionExpired() → signOut()
         → logout instantâneo, sem uma única retentativa.

     (c) o refresh passa de REFRESH_TIMEOUT_MS (15s — plausível numa rede que
         acabou de acordar)
         → withTimeout rejeita a promise, mas NÃO cancela a request HTTP.
           O servidor pode processar e rotacionar assim mesmo.
         → localmente guardamos o refresh token ANTIGO, que o servidor já
           consumiu. A próxima tentativa manda um token queimado; backends com
           detecção de reuso revogam a família inteira → logout definitivo.
```

Três causas independentes, e nenhuma delas é "a sessão acabou": em (a) e (c) o usuário é
deslogado (ou fica com o app quebrado) com credenciais válidas. Só (b) é expiração de
verdade — e mesmo ela é evitável com refresh proativo antes de suspender.

O §5.4–§5.6 abaixo é o desenho que fecha os três.

---

## 1. Visão geral em uma frase

O app guarda **uma conta** — a do Apple ID que fez o login — com seu par de tokens, dentro
de **uma única chave MMKV** (`@circle:session`), validada por schema na leitura. Em memória,
ela é materializada num **`SessionBundle`** — um objeto `Session` que é o **único** dono dos
tokens e o único que faz refresh, mais a instância axios amarrada a ele. O storage é a fonte
de verdade fria (cold start); o `Session` é a fonte de verdade quente enquanto o app roda.

```
  MMKV                       +---------------------- memória ----------------------+
  @circle:session            |                                                     |
    state: "active"          |  SessionStore (reducer)     SessionBundle           |
      |- identity            |   |- account                 |- session: Session    |
      |    |- userId         |   |- currentBundleState      |     ^ dono do par    |   rede
      |    \- appleUserId    |   |    |- userId             |     ^ de tokens e    | ----> API
      |- credentials         |   |    \- bundle ----------> |     ^ do refresh     |
      |    |- accessToken    |   \- needsPersist            \- client: Axios       |
      |    |- refreshToken   |                                                     |
      |    \- generation     +-----------------------------------------------------+
      |- profile (cache)          ^                    |
      \- status (backend)         \-- persist(state) --/  (a cada needsPersist, síncrono)

  @circle:viewer, @circle:viewer:liked, @circle:metrics, ...   (§2.2: uma chave por
                                                                unidade de escrita)
```

Diferenças deliberadas em relação ao Bluesky:

| Ponto | Bluesky | Circle |
| --- | --- | --- |
| Backend de storage | `AsyncStorage` (assíncrono) | **MMKV (síncrono)** |
| Sync entre abas | `BroadcastChannel` (web) | **não existe** — app só nativo; §8 deles some |
| Nº de contas | `accounts[]` + seletor | **uma só**, a do Apple ID (§2.6) |
| Identidade canônica | `did` | `userId` do backend, ancorado no `appleUserId` |
| Camada de rede | `Client` do atproto (3 variantes) | **uma** `AxiosInstance` por bundle |
| Blob persistido | um só para o app inteiro (tema, prefs, sessão) | **um por unidade de escrita** (§2.2); uma sessão corrompida não derruba as preferências |
| Sessão morta = tela de login | sim | **não necessariamente** — o Apple permite re-auth de um toque (§5.8) |

A escolha de manter o blob restrito à sessão é intencional: no Bluesky, uma falha de
validação do schema derruba **todo** o estado persistido (tema, idioma, contas). Isolando a
sessão, uma sessão corrompida desloga o usuário mas não zera preferências.

Conta única remove três coisas do desenho do Bluesky — `accounts[]`, o ponteiro
`currentAccount`, e as ações `switched-to-account` / `removed-account` — mas **não** remove
o guard de identidade do bundle (§6): as corridas que ele resolve (refresh em voo durante
logout, re-login antes de o refresh anterior terminar) existem com uma conta só.

---

## 2. Onde os dados moram

### 2.1 Quatro princípios

O storage de hoje cresceu por acréscimo: `storageKeys()` tem ~40 chaves em cinco níveis de
aninhamento, sem nenhuma regra sobre quem escreve o quê, quando some, ou o que é autoridade
e o que é cache. Antes de desenhar qualquer estrutura, quatro regras:

**P1 — Uma unidade de escrita = um dado que precisa ser consistente consigo mesmo.**
`accessToken`, `refreshToken` e a geração do par **têm** que ser gravados juntos ou não
gravados: um par misto é um refresh token queimado. Já `likedMoments` não precisa ser
consistente com o token. Logo: sessão em um blob; coleções em chaves próprias.

**P2 — Blob para o que é lido junto e pequeno; chave própria para o que muda sozinho.**
O blob de sessão é lido inteiro no cold start e reescrito inteiro a cada rotação — cabe em
menos de 1 KB, e reescrevê-lo é barato. `likedMoments` cresce sem teto e é apendado a cada
toque de like: dentro do blob, cada like reescreveria os tokens junto. Fora dele, não.

**P3 — Todo campo persistido declara sua autoridade.** Ou o backend manda (`verified`), ou
o device manda (`appTimezone`), ou é cache de exibição (o `username` guardado só para a tela
montar antes da primeira request). Cache pode ser descartado sem perda; autoridade não.
Hoje isso não está escrito em lugar nenhum, e por isso `verified` existe em duplicata em
dois stores.

**P4 — Nunca persistir o que é derivável.** O `jwtExpiration` de hoje é
`Date.now() + expiresIn`, calculado com o relógio local, gravado, e depois lido como se
fosse verdade. O `exp` já está dentro do JWT. Derivado não se guarda — se recalcula.

### 2.2 O mapa de chaves

Uma chave por unidade de escrita, com dono único e escopo declarado:

| Chave | Dono (único escritor) | Escopo | Formato | Reescrita |
| --- | --- | --- | --- | --- |
| `@circle:session` | `SessionStore` | sessão | JSON (§2.3) | a cada rotação de token |
| `@circle:viewer` | `useViewerStore` | usuário | JSON (§2.5) | ao logar e ao editar perfil |
| `@circle:viewer:liked` | `useViewerStore` | usuário | JSON `string[]` | a cada like |
| `@circle:viewer:hidden` | `useViewerStore` | usuário | JSON `string[]` | raro |
| `@circle:viewer:read-notifications` | `useViewerStore` | usuário | JSON `string[]` | ao abrir o inbox |
| `@circle:viewer:moments` | `useViewerStore` | usuário | JSON `Moment[]` | ao publicar |
| `@circle:metrics` | `useMetricsStore` | usuário | JSON | a cada sync |
| `@circle:preferences` | `usePreferencesStore` | device | JSON | ao mudar ajuste |
| `@circle:device` | `persist.device.ts` | device | JSON | raro |
| `@circle:tutorial` | `TutorialProvider` | device | JSON | ao completar passo |
| `@circle:clock-offset` | `Session` (do header `Date`) | device | número | a cada refresh |
| `@circle:push-token` | `PushNotificationProvider` | device | string | ao registrar |

Cada blob carrega o **seu** `schemaVersion` (§2.4) — não há chave global de versão, porque
cada unidade migra sozinha. E há dois casos fora da tabela, de propósito:

- `@circle:like:pressed:*` (`LIKE_PRESSED_NS`) é **efêmero** por design e continua sendo
  chave-por-item; a limpeza por prefixo que já existe (`clearLikePressedNamespace`) basta.
- `@circle:sessionId` **some.** Hoje é escrito nos dois caminhos de login e exposto por
  `storageKeys().sessionId`, mas **nada no app o lê** — conferido por busca. Quem quiser a
  identidade lê `session.identity.userId`.

Ganhos concretos sobre o `storageKeys()` atual:

- **De ~40 chaves para 12.** Cada store lê e escreve **uma** chave: hoje
  `persist.account.read()` faz 17 `getString`/`getBoolean`/`getNumber` em sequência,
  `persist.preferences` faz 20, `persist.metrics` 14.
- **O prefixo é o escopo, e passa a ser verificável.** `clearUserScopedData()` (§11.2) vira:
  apagar as chaves cujo escopo declarado é `user`. Sem lista de exceções — e sem o buraco do
  item 5 do §0, em que uma chave sem prefixo escapa da varredura para sempre.
- **Tipagem real.** Um blob JSON valida contra um tipo; quinze chaves soltas não — daí os
  `storage.getBoolean(key) || false` espalhados, que transformam "ausente" e "false" na
  mesma coisa silenciosamente.

### 2.3 A sessão: uma união discriminada, não um objeto com campos opcionais

O erro do desenho anterior (e do `PersistedAccount` do Bluesky) é ser **um objeto plano com
tudo opcional**, onde "deslogado" se expressa como `refreshToken === undefined`. Isso tem
três defeitos: espalha quatro preocupações de vidas diferentes no mesmo nível; obriga todo
leitor a reconferir se o token existe; e permite estados que não deveriam ser
representáveis — `accessToken` sem `refreshToken`, `refreshToken` sem `userId`.

Duas mudanças resolvem: **agrupar por vida útil**, e **tornar o estado explícito**.

```ts
// src/session/schema.ts

/** Imutável enquanto a conta existe. Sobrevive ao logout. */
type Identity = {
    userId: string        // id do backend — a chave primária de tudo que é do usuário
    appleUserId?: string  // credential.user; ausente em conta migrada (§12, Fase 1)
}

/** O par de tokens. Escrito SEMPRE junto, só pela Session. */
type Credentials = {
    accessToken: string
    refreshToken: string
    generation: number    // incrementa a cada rotação; é o que o §5.4 compara
    issuedAt: string      // ISO, do relógio local — para diagnóstico, não para decisão
}

/** Cache de exibição: deixa a tela montar antes da primeira request. Descartável. */
type ProfileCache = {
    username: string
    name?: string
    profilePicture?: string
}

/** Autoridade do backend. Muda raro, e muda o que o app deixa fazer. */
type AccountStatus = {
    accessLevel: string
    verified: boolean
    blocked: boolean
    deleted: boolean
}

type SessionMeta = {
    signedInAt: string
    lastRefreshAt?: string
}
```

E o estado, como união:

```ts
type PersistedSession =
    | { schemaVersion: 1; state: "empty" }
    | {
          // deslogado, mas o device lembra quem era — é o que alimenta o §5.8
          schemaVersion: 1
          state: "signed-out"
          identity: Identity
          profile: ProfileCache
          signedOutAt: string
      }
    | {
          schemaVersion: 1
          state: "active"
          identity: Identity
          credentials: Credentials
          profile: ProfileCache
          status: AccountStatus
          meta: SessionMeta
      }
```

Por que isso é melhor que o objeto plano:

1. **"Deslogado mas lembrado" vira um estado de primeira classe.** Antes era o efeito
   colateral de zerar dois campos e torcer para ninguém interpretar errado. Agora tem nome,
   carrega exatamente o que o re-auth de um toque precisa (`appleUserId` + `username` para
   escrever "entrar como @fulano"), e **não carrega** o que não deve sobreviver ao logout —
   status e meta somem por construção, não por lembrar de apagar.
2. **O TypeScript passa a impedir o bug.** `session.credentials` só existe depois de
   estreitar para `state === "active"`. Não há como uma tela ler o token sem antes provar
   que há sessão — que é, no nível dos tipos, a mesma garantia que o `PublicBundle` do §3.2
   dá em runtime.
3. **Estados impossíveis param de ser representáveis.** `accessToken` sem `refreshToken`
   não compila. `refreshToken` sem `userId` não compila.
4. **A rotação escreve um objeto só.** `credentials` inteiro é substituído; `identity`,
   `profile` e `status` nem são tocados. P1 satisfeito pela forma do dado, não por
   disciplina do programador.
5. **`generation` mora onde é usado.** O contador que o §5.4 compara para decidir "esta
   request morreu com token velho, só repetir" é parte do par de tokens — não um contador
   solto em memória que se perde no cold start.

Note o que **não** está lá: `accessExpiresAt` e `refreshExpiresAt`. São deriváveis do `exp`
dentro dos próprios tokens (P4). O `issuedAt` fica porque não é derivável — mas é
explicitamente marcado como diagnóstico, para ninguém tomar decisão de expiração com ele.

### 2.4 Versionamento, e por que "parse falhou → desloga" não basta

Um `schemaVersion` no topo, e uma cadeia de migrações — não um `try/catch` que joga tudo
fora:

```ts
const CURRENT = 1

/** v(n) → v(n+1). Uma entrada por salto; nunca se edita uma migração já publicada. */
const MIGRATIONS: Record<number, (data: any) => any> = {
    // 0: blob gravado antes de existir schemaVersion — nenhum existe ainda,
    //    mas a entrada precisa estar aqui antes de CURRENT virar 2.
}

export function readSession(): PersistedSession {
    const raw = storage.getString(KEYS.session)

    // ATENÇÃO: a migração das chaves soltas de hoje NÃO é uma entrada de MIGRATIONS.
    // Ela roda justamente quando @circle:session ainda não existe — se ficasse na
    // cadeia, nunca seria alcançada, porque a cadeia só roda sobre um blob já lido.
    if (!raw) return migrateFromLegacyKeys() ?? { schemaVersion: CURRENT, state: "empty" }

    try {
        let data = JSON.parse(raw)
        let version = data.schemaVersion ?? 0
        while (version < CURRENT) {
            const step = MIGRATIONS[version]
            if (!step) break // sem caminho: cai no degrade abaixo
            data = step(data)
            version = data.schemaVersion ?? version + 1
        }
        return validate(data) ?? degrade(data)
    } catch {
        return { schemaVersion: CURRENT, state: "empty" }
    }
}
```

Dois detalhes que só aparecem na hora de implementar:

- **Blob de versão futura.** Um usuário que instalou uma build nova, gerou
  `schemaVersion: 2`, e depois voltou para a anterior (TestFlight, rollback) tem um blob que
  a build antiga não entende. `version > CURRENT` **não** pode virar `empty`: cai no
  `degrade`, que salva a `identity` se ela estiver na forma esperada e desloga para
  `signed-out` — nunca perde a identidade por causa de um downgrade.
- **A migração legada roda uma vez e não apaga nada.** Ela lê as três chaves de hoje e
  escreve o blob novo; as chaves antigas ficam onde estão até a Fase 5 (§12). Enquanto as
  duas representações coexistem, **o blob é a autoridade** — quem ainda ler as chaves
  antigas está lendo dado congelado.

O `degrade` é o detalhe que importa. Se o objeto tem `identity` válida mas `credentials`
corrompida, o resultado certo **não** é `empty` — é `signed-out`: preserva quem era e
oferece o re-auth de um toque, em vez de mandar o usuário para uma tela em branco. Só um
JSON irreparável, ou uma `identity` sem `userId`, chega em `empty`.

É o mesmo princípio do §5.6 aplicado ao storage: **degradar para o estado adjacente, não
para o pior estado**.

### 2.5 O viewer

Mesma disciplina, aplicada à fusão de `persist.account` + `persist.user` (§11.2):

```ts
// @circle:viewer  — um blob, escrito ao logar e ao editar o perfil
type PersistedViewer = {
    schemaVersion: 1
    userId: string          // redundante com identity.userId DE PROPÓSITO: é o que
                            // permite detectar dado órfão de outro usuário (§2.6)
    profile: {
        username: string
        name: string
        description: string
        richDescription: string
        profilePicture: string
    }
    status: AccountStatus   // mesmo tipo da sessão — uma definição, não duas
    terms: { agreed: boolean; version: string; agreedAt: string }
    coordinates?: { latitude: number; longitude: number; syncedAt: string }
}
```

As coleções ficam **fora** desse blob, cada uma na sua chave (P2), porque são apendadas com
frequência e crescem sem teto. E cada uma ganha o que hoje não tem: um teto.

| Coleção | Teto | Política |
| --- | --- | --- |
| `viewer:liked` | 5.000 ids | descarta os mais antigos (é cache de UI, não verdade) |
| `viewer:read-notifications` | 1.000 ids | idem |
| `viewer:hidden` | sem teto | é intenção explícita do usuário; não se descarta |
| `viewer:moments` | 200 | o resto vem da API |

Hoje `likedMoments` e `readNotifications` crescem para sempre — cada like adiciona um id que
nunca sai. Num usuário pesado, isso vira um JSON de centenas de KB parseado **no construtor
do store**, ou seja, no caminho crítico do cold start. O teto não é otimização prematura: é
o que impede o app de ficar mais lento quanto mais o usuário o usa.

O `userId` duplicado dentro do viewer é intencional e é o que torna o §2.6 verificável: ao
hidratar, se `viewer.userId !== session.identity.userId`, o dado é órfão de outro usuário e
deve ser descartado — sem depender de a limpeza no login ter rodado.

### 2.6 A âncora do Apple ID


O Circle entra **só por Apple Sign-In** (`app/(auth)/init.tsx` → `signWithApple`) e cada
device carrega **uma** conta. Isso simplifica o desenho, mas cria uma obrigação que o modelo
multi-conta resolvia de graça: **identificar de quem é o dado residual**.

> Os fluxos de usuário e senha (`signIn` / `signUp`, as telas `sign-in` e
> `sign-up-password`, `settings/password` e o `PasswordInput`) eram legado morto —
> inalcançáveis pela navegação — e **foram removidos**. O `appleUserId` continua opcional no
> schema por um único motivo: as contas migradas na Fase 1 não o têm, porque o storage atual
> nunca o guardou.

O `credential.user` do Apple é estável por (Apple ID × app), é o que o backend já recebe
hoje em `appleSign.user`, e chega a ser usado como fallback de username em `appleSignIn` —
mas **nunca é persistido**. Guardá-lo como `appleUserId` permite a regra:

```
no login, comparar a identidade que entrou com a persistida:
    appleUserId presente nos dois e diferente  → outra pessoa  → LIMPA
    userId diferente                           → idem (cobre a conta migrada)
    iguais                                     → mesma pessoa  → preserva

LIMPA = apagar as chaves de escopo "usuário" (§2.2) antes de gravar a nova sessão:
        @circle:viewer*, @circle:metrics, cache do React Query
        preservando as de escopo "device": preferences, tutorial, device
```

A comparação por `userId` é o que faz a regra valer também para a conta migrada da Fase 1,
que não tem `appleUserId`. E o `userId` duplicado dentro do `@circle:viewer` (§2.5) é a
segunda linha de defesa: mesmo que a limpeza no login não tenha rodado, a hidratação
descarta o blob cujo `userId` não bate com o da sessão.

Sem isso, o `clearSessionDataPreservingTutorial()` atual — que roda no logout, mas não no
login — deixa o segundo usuário herdando likes e notificações lidas do primeiro. É um bug de
privacidade, não de conveniência, e conta única é justamente o cenário onde ele acontece.

O `appleUserId` também é o que permite o **re-auth de um toque** do §5.8: sem ele não há
como perguntar ao Apple se aquela credencial ainda vale.

---

## 3. Estrutura em memória

### 3.1 `Session` — o dono dos tokens

Hoje não existe esse objeto: o interceptor do axios é que segura o estado do refresh em
variáveis de módulo (`isRefreshing`, `refreshPromise`, `pendingQueue`). Isso amarra o
refresh a **uma** instância global e impede que duas sessões coexistam (troca de conta,
logout com request em voo).

```ts
// src/session/session.ts
class Session {
    // exatamente Identity + Credentials do §2.3 — sem expiresAt: o exp vem do token (P4)
    private data: { identity: Identity; credentials: Credentials }
    private refreshInFlight: Promise<Credentials> | null = null
    private destroyed = false
    private hooks: SessionHooks // {onUpdated, onUpdateFailure, onDeleted}
    private armed = false // latch: hooks só disparam depois de arm()

    get accessToken(): string // lança se destroyed
    get generation(): number // credentials.generation — o que o §5.4 compara
    async refresh(): Promise<Credentials> // single-flight, DESTA sessão
    arm(): void
    kill(): void // desabilita fetch + hooks
}
```

Pontos não negociáveis:

1. **O single-flight vive na sessão, não no módulo.** Duas sessões (a que sai e a que
   entra numa troca de conta) têm filas independentes. A sessão morta não pode consumir o
   refresh token da viva.
2. **Um refresh token é de uso único.** Toda rotação bem-sucedida invalida a anterior no
   servidor. É por isso que bundle obsoleto **nunca** pode rodar refresh — a regra que o
   Bluesky escreve como *"Replaced bundles must never consume another refresh token"*.
3. **Hooks nunca lançam.** O `dispatch` é envolvido em try/catch. Um throw síncrono dentro
   do hook deixaria `refreshInFlight` permanentemente rejeitada e toda request futura
   falharia, sem a sessão nunca ser marcada como morta.
4. **O latch `armed`.** Entre construir a sessão e terminar o preparo (buscar perfil,
   configurar push), os hooks ficam desarmados: um `onUpdated` disparado nessa janela
   escreveria no store antes de o bundle existir nele. Se a sessão morrer com os hooks
   ainda desarmados, o preparo é **fatal** — descarta o bundle e rejeita, porque o evento
   de expiração foi engolido e nada deslogaria a conta.

### 3.2 `SessionBundle`

```ts
type SessionBundle = {
    session: Session
    client: AxiosInstance // interceptors amarrados A ESTA session
}
```

Deslogado, o equivalente é o `PublicBundle`: `session: null` e um client cujo interceptor
**lança `NotAuthenticatedError` antes de qualquer I/O**. Falha legível em vez de um 401
opaco vindo do servidor — e evita a situação atual em que o app monta rota autenticada sem
token e o interceptor precisa adivinhar (`"401 sem token nem refreshToken"`).

O interceptor de request deixa de ler o MMKV (`storage.getString(jwt.token)`) e passa a ler
`bundle.session.accessToken`. Essa é a mudança que fecha a corrida de token stale descrita
em `docs/refresh-auth-persisted.md` §3.3: não há mais como uma request sair com um token
lido antes do refresh.

### 3.3 Estado do reducer

```ts
type State = {
    session: PersistedSession // a união do §2.3 — é o que vai para o storage tal como está
    currentBundleState: { bundle: OpaqueSessionBundle; userId: string | undefined }
    needsPersist: boolean
}
```

`state.session` é **literalmente** o que se persiste: `persist()` é
`storage.set(KEYS.session, JSON.stringify(state.session))`, sem nenhuma transformação. Um
formato só entre memória e disco elimina a classe de bug em que os dois divergem — que é o
que acontece hoje, com o Zustand e o MMKV guardando versões diferentes dos mesmos tokens.

O bundle entra no reducer como **opaco** de propósito: o reducer o usa apenas por
**identidade referencial**, nunca lê suas entranhas. Essa identidade é o mecanismo central
de correção — §6.

---

## 4. Sobre os tokens

O app **não valida assinatura** de JWT. Só decodifica o payload para responder a poucas
perguntas. Hoje o `checkIsSigned` compara a string ISO `jwtExpiration` com `Date.now()`, o
que depende do backend ter mandado `expiresIn` e do relógio do device estar certo.

Os dois tokens têm naturezas **diferentes**, e confundi-las é a armadilha mais fácil deste
módulo:

| | Access token | Refresh token |
| --- | --- | --- |
| Expira? | sim — `expiresIn`, hoje 36000s (10h) | **não**: emitido sem claim `exp` |
| Quem decide se ainda vale | o `exp` dentro dele | o **banco** (`active` vs `used`) |
| Quantos usos | ilimitados até vencer | **um só** |
| O cliente pode avaliar? | sim, localmente | **não** — só tentando |

| Utilitário | O que faz |
| --- | --- |
| `decodeExp(token)` | decodifica o payload; devolve `exp` (segundos) ou `null` |
| `decodeSub(token)` | `sub` — plano B para o `userId` na migração da Fase 1 |
| `isAccessTokenExpired(token, skewMs)` | sem `exp` implica expirado; compara com `now()` corrigido (abaixo); erro de parse implica expirado |
| `isSessionExpired(session)` | `session.state === "active" ? isAccessTokenExpired(session.credentials.accessToken) : true` |

⚠️ **`isAccessTokenExpired` nunca pode ser aplicada ao refresh token.** Ela trata "sem `exp`"
como "expirado" — o lado seguro para o access, e exatamente o lado errado para o refresh,
que **nunca** tem `exp`. Aplicá-la ali declararia morta uma sessão viva. O nome carrega o
aviso de propósito, e o caso está travado em teste.

O `exp` **de dentro do JWT** é a autoridade — não um `expiresAt` persistido, que é derivado
do `expiresIn` do backend somado ao relógio local e some quando a resposta não traz
`expiresIn` (o bug D de `refresh-auth-persisted.md`). Por isso §2.3 não guarda
`accessExpiresAt`: é derivável (P4).

**Sobre o `clockOffset`.** `storageKeys()` já declara a chave `clockoffset`, mas — conferido
por busca — **nada no app escreve ou lê ela**. Ou seja: hoje não existe correção de relógio,
só o nome dela. Implementar de verdade custa pouco e vale a pena, porque uma decisão de
expiração feita com relógio adiantado desloga usuário com sessão válida:

```
a cada resposta da API, ler o header `Date` do servidor
offset = serverTime - Date.now()
gravar em @circle:clock-offset (só se |offset| > 30s, para não escrever à toa)
now() = Date.now() + offset
```

E uma **margem de skew** por cima: tratar como expirado o token que vence nos próximos 30s.
Um token que expira durante o voo da request é um 401 evitável.

**O sinal de logout é o discriminante `state`, não a ausência de um campo.** É a diferença
prática mais importante entre o §2.3 e o desenho do Bluesky: lá, "deslogado" é
`refreshToken === undefined` e todo leitor precisa se lembrar disso; aqui é
`state === "signed-out"`, que o compilador cobra. A entrada preserva `identity` e `profile`
— o que o §5.8 usa para oferecer "entrar como @fulano" em um toque — e descarta `status`,
`credentials` e `meta` por construção. Só o *delete de conta* leva a `empty`.

---

## 5. Trajetória do dado — o ciclo completo

### 5.1 Cold start

```
new SessionStore()                     lê @circle:session (síncrono, MMKV)
  \- estado inicial: session carregada, currentBundleState = bundle PÚBLICO
RootLayoutNav (app/_layout.tsx)
  \- switch (state.session.state)
       |- "empty"       -> redirect /(auth)/init
       |- "signed-out"  -> redirect /(auth)/init  (com o atalho do §5.8)
       \- "active"      -> await resumeSession(session) -> /(tabs)/moments
```

O app **sobe sempre deslogado** e só então promove a sessão. A splash só é liberada depois
disso — encaixa no `RootLayoutNav` atual, que já segura o splash enquanto decide o redirect.

### 5.2 `resumeSession`

Dois caminhos, decididos por `isSessionExpired`:

- **access ainda válido** → constrói a `Session` **síncrona, sem rede**. Confia nos tokens
  guardados.
- **access expirado** → `await Session.resume()`, que faz o refresh na rede.
  - rejeita apenas quando a sessão está **definitivamente** morta (401/403 no refresh);
  - **falha transitória (offline, 5xx) resolve com os tokens velhos** e reporta via
    `onUpdateFailure`. Cold start offline permanece "logado" com tokens mortos em vez de
    deslogar. Isso já é meio-caminho no código atual (`isTerminal` no `handleAuthError`);
    aqui vira regra do resume também.

Depois, na ordem: `buildBundle` → registrar kill switch → preparo (perfil, push token,
feature flags) → `finishPreparation` (fatal se a sessão morreu durante o preparo) →
`hooks.arm()` → `dispatch("resumed")`.

### 5.3 Login / cadastro

`Session.login()` → checagem de troca de Apple ID (§2.6) → `buildBundle` → preparo →
`arm()` → `signed-in`, que grava a conta e marca `needsPersist`.

Isso substitui o par `persistSession` + `injectAuthSession` de hoje, em que o
`AuthProvider` escreve no MMKV e o `PersistedProvider` reescreve por cima a partir do mesmo
payload. Passa a existir **um** caminho de escrita.

O `beginAuthGracePeriod` desaparece. Ele existe hoje para suprimir a rajada de 401 logo
após o login, causada justamente pela janela entre "login respondeu" e "token chegou no
MMKV". Com a sessão sendo o dono do token e o client amarrado a ela, a janela não existe.

### 5.4 Rotação de token — o caminho quente

```
request 401 (não é a rota de refresh)
  \- bundle.session.refresh()          single-flight DESTA sessão
       |- sucesso     -> onUpdated(data)      -+
       |- transitório -> onUpdateFailure()     +-- hooks
       \- morta       -> onDeleted(data)      -+
                              |
                        dispatch(event)   [só se armed]
                              |
       +----------------------+---------------------+
    'update'            'network-error'          'expired'
       |                      |                      |
   atualiza conta        reducer ignora        volta ao bundle público
       |                 (transitório)         + notifica UI ("sessão expirou")
       +----------> dispatch('received-session-event') <----+
                              |
                  reducer: GUARD DE IDENTIDADE do bundle
                              |
                  session.credentials trocada, needsPersist = true
                              |
                    storage.set("@circle:session", json)   <- síncrono, fora do render
```

Detalhes que valem gravar:

- **Persistência é síncrona ao dispatch**, não ao render. `SessionStore.dispatch` grava
  antes de notificar os listeners. Com MMKV isso é uma chamada síncrona barata — é a
  vantagem concreta sobre o `AsyncStorage` do Bluesky, que precisa agendar a escrita e
  conviver com a janela até ela concluir.
- **Um 401 na rota de refresh nunca dispara refresh** (já é assim hoje via `isRefreshRoute`).
- **O teto de tempo do refresh permanece.** `REFRESH_TIMEOUT_MS` existe hoje por um motivo
  real: um refresh pendurado travava a fila para sempre. Manter, agora por sessão.
- **Requests enfileiradas em refresh que falha são rejeitadas, não repetidas.** Já está
  correto hoje (`PendingEntry.fail`); preservar.

#### Geração de token: o 401 que não precisa de refresh

Toda request carrega a **geração** do token que usou (`(cfg as any).tokenGeneration`, um
contador que a `Session` incrementa a cada rotação). No 401:

```ts
if (request.tokenGeneration < session.generation) {
    // já rotacionamos desde que esta request saiu: ela morreu com token velho.
    // Não há nada a renovar — só repetir.
    return replay(request, session.accessToken)
}
```

Isso resolve sozinho a maior parte da rajada de retomada: as requests que saíram antes do
refresh terminar são **repetidas**, não viram gatilho de refresh. Sem isso, um 401 atrasado
de uma request pré-refresh dispara uma rotação inteiramente desnecessária — que, com refresh
token de uso único, é uma rotação que pode ser perdida (§0.1c).

#### `_retry` vira contador, não booleano

O `_retry: boolean` de hoje é a razão de a falha (a) do §0.1 deixar o app quebrado: uma
tentativa transitória frustrada gasta a única chance da request. Substituir por:

```ts
type RetryState = { authAttempts: number } // teto: 2
```

E, principalmente: **falha transitória do refresh não consome tentativa**. Só consome quem
recebeu 401 com um token comprovadamente corrente.

### 5.5 Refresh proativo e retomada do background

Três mecanismos, nessa ordem de importância.

**1. Agendamento por `exp`.** Ao armar a sessão, agendar o refresh para
`exp - 60s - jitter(0..10s)`. O jitter evita que todos os devices renovem no mesmo segundo
após um deploy. O refresh reativo (401) continua existindo como rede de segurança — relógio
errado, token revogado no servidor, push que acordou o app — mas deixa de ser o caminho
normal.

**2. Barreira de revalidação na volta do background.** É o coração da correção. No
`AppState` `active`:

```
AppState -> "active"
  │
  ├─ tempo em background < 30s e token ainda válido → nada a fazer, libera
  │
  └─ senão → abre a BARREIRA (session.revalidating = true)
        │
        ├─ toda request que sair agora AGUARDA a barreira em vez de disparar
        │    (interceptor de request, não de response — não gera 401 nenhum)
        │
        ├─ aguarda conectividade (NetworkContext / NetInfo), com teto de 10s
        │
        ├─ token válido com folga? → fecha a barreira, libera
        │
        └─ senão → refresh (§5.6 classifica o resultado)
               ├─ sucesso   → fecha a barreira, libera com o token novo
               ├─ transitório → fecha a barreira, libera assim mesmo
               │                (as requests falham em rede, não em auth — e o
               │                 React Query as repete quando a rede voltar)
               └─ terminal  → logout
```

A diferença essencial: hoje o app **descobre** que o token morreu recebendo N × 401; com a
barreira ele **sabe antes** de disparar a primeira request. A rajada de 401 simplesmente não
acontece, e com ela somem os dois efeitos colaterais dela — o `_retry` queimado e as
rotações concorrentes.

O timer do item 1 também é reavaliado aqui: um timer agendado para dali a 20 min que dormiu
6h precisa disparar imediatamente ao voltar, não no horário original. `setTimeout` não conta
tempo suspenso de forma confiável em iOS/Android — por isso a decisão é sempre recalculada a
partir de `exp` no `AppState`, nunca confiando só no timer ter disparado.

**3. Refresh antes de suspender.** No `AppState` `background`, se o token vence dentro da
próxima janela curta (~5 min), renovar já. Custa uma request e evita o cenário (b) inteiro
para as suspensões curtas e médias.

### 5.6 Classificação de falhas: quando deslogar

Esta é a regra que o código atual erra. Hoje `SessionExpiredError` é terminal e leva a
`signOut()` na hora; **qualquer outro erro** é transitório. O problema é que "outro erro" e
"sessão morta" não cobrem o espaço todo — falta o caso **desconhecido**, e tratá-lo como
terminal desloga usuário com sessão válida.

A tabela abaixo já usa os códigos reais do contrato (§13.1):

| Resposta de `GET /auth/refresh-token` | Classificação | Ação |
| --- | --- | --- |
| 200 com `token` + `refreshToken` | **sucesso** | grava o par **junto**, incrementa geração |
| 200 sem `token` no corpo | **terminal** | resposta inválida; nada a reter |
| 401 `REFRESH_TOKEN_INVALID` | **terminal** | token desconhecido, **já usado**, ou sessão revogada por login em outro device |
| 403 `ACCOUNT_BLOCKED` | **terminal** | conta bloqueada ou excluída |
| 400 (header ausente) | **terminal** | bug do cliente; não há o que renovar |
| 500 `INTERNAL_ERROR` | **transitório** | preserva tokens, backoff — o backend diz explicitamente que a credencial pode continuar válida |
| erro de rede, DNS, offline | **transitório** | preserva tokens, backoff |
| 429 | **transitório** | respeita `Retry-After` |
| **timeout local** | **desconhecido** | ver abaixo — nunca terminal |

**Um 401 aqui nunca é retentado.** O contrato é explícito: *"Nunca faça retry automático de
um refresh que falhou com 401. O token já morreu; repetir só confirma o reuso."* Uma
segunda tentativa não recupera nada e ainda dispara a revogação da família.

**Deslogar exige prova.** Só um veredito **terminal** desloga, e mesmo ele com duas
condições: (a) havia conectividade confirmada no momento da tentativa — um 401 forjado por
portal cativo de wifi de hotel não é prova de nada; (b) não é a primeira tentativa depois de
uma retomada longa do background, onde um retry único com 1s de espera resolve a corrida de
relógio.

**Transitório nunca desloga, nunca limpa token.** Faz backoff exponencial com jitter
(1s, 2s, 4s, 8s, teto de 30s). O app permanece "logado com token morto" — exatamente a
escolha do Bluesky no cold start offline, e o comportamento certo: o usuário vê erro de rede
nas telas, não a tela de login.

Duas condições de parada, para o retry não virar um laço eterno queimando bateria: para de
tentar quando o app vai para background (o §5.5 reavalia tudo na volta) e quando a rede cai
de vez (retoma no evento de reconexão do `NetworkContext`, não por timer). Sem gatilho, ele
fica parado — não há limite de tentativas, porque desistir só levaria ao logout que a
classificação inteira existe para evitar.

**Desconhecido é a categoria nova, e existe por causa do §0.1c.** Um timeout local não diz
se o servidor processou a rotação. Tratar como transitório é perigoso (podemos estar
segurando um refresh token já queimado); tratar como terminal desloga por engano. A saída:

1. Nunca abortar a request de refresh por timeout curto sem antes esgotá-la. Subir o teto
   para ~30s e usar o timeout apenas como proteção contra pendurar de vez.
2. Se ainda assim estourar, **não disparar outro refresh**: o token que temos pode já estar
   consumido, e reapresentá-lo revoga a família (§13.1). Sondar primeiro, com o access token
   atual, por um client **cru** — a sondagem não pode passar pelo interceptor de 401, senão
   ela mesma dispara um refresh. Não há rota dedicada (`apiRoutes.auth` tem só `apple` e
   `apple/exists`); usar `GET /account`, que já é autenticado e o app já chama.
   - 200 → o access ainda vale; não havia urgência, siga sem refrescar.
   - 401 → o access morreu e não sabemos o destino da rotação. **Este é o beco sem saída**:
     um refresh novo com o token possivelmente consumido revoga tudo. O menos ruim é
     degradar para `signed-out` e oferecer o re-auth de um toque (§5.8) — perde-se a sessão,
     mas não se queima a conta em uma revogação global.
3. Só o backend fecha esse buraco de verdade, com uma **janela de graça de reuso** (o token
   anterior aceito por ~30–60s, devolvendo o par corrente). Está pedido no §13.1 — é a única
   correção que não depende de heurística no cliente.

O melhor investimento aqui é **não chegar neste estado**: timeout generoso (30s), um único
refresh em voo por vez, e gravação atômica do par. Com access token de 10 horas, a janela em
que um refresh acontece é pequena; o que torna o cenário perigoso não é a frequência, é o
custo — cada ocorrência é um logout que o usuário não causou.

**Nada disso limpa tokens fora do caminho terminal.** E "limpar" deixa de ser três
`safeDelete` soltos: é **uma** escrita do blob transitando `active → signed-out` (§2.3),
que por construção não consegue deixar meio par de tokens para trás.

#### O que sobra do código atual

| Hoje | Vira |
| --- | --- |
| `isRefreshing` / `refreshPromise` / `pendingQueue` (módulo) | estado interno da `Session` |
| `_retry: boolean` | `authAttempts: number`, com teto e sem consumir em falha transitória |
| `REFRESH_TIMEOUT_MS = 15_000` | 30s + sondagem no estouro (§5.6) |
| `beginAuthGracePeriod` | some — a barreira e a geração de token cobrem o caso |
| `SessionExpiredError` com 2 razões | veredito de 4 categorias (sucesso / terminal / transitório / desconhecido) |
| `notifySessionExpired` no primeiro terminal | só desloga com conectividade confirmada e após o retry de cortesia |

### 5.7 Logout

1. `POST /auth/signout` — **best-effort**, com o **access token** no header (não o refresh).
   Revoga todos os refresh tokens em aberto do usuário e devolve `{ revokedTokens: n }`. É
   **idempotente**: chamar de novo devolve `0` e 200, não erro.

   ```ts
   try {
       await api.post("/auth/signout")
   } catch {
       // rede caiu, servidor fora: não importa
   } finally {
       clearSession() // isto SEMPRE acontece
   }
   ```

   O `finally` não é estilo: é o que garante que uma falha de rede não deixe o usuário
   preso logado. E note o que o signout **não** faz — não invalida o access token atual,
   que segue aceito até o próprio `exp` (até 10h). O signout garante que a sessão *não se
   renova*; quem efetiva o logout do ponto de vista do usuário é a limpeza local.

   Duas ressalvas: a chamada vai por uma **sessão descartável**, para que nada que ela faça
   possa persistir por cima da sessão que está sendo encerrada; e o **desregistro de push
   continua não existindo** — o device seguirá recebendo push da conta que saiu (pedido
   aberto no §13.1). O que dá para fazer hoje é apagar o token de push local.
2. Transição `active → signed-out` (§2.3): preserva `identity` e `profile`, descarta
   `credentials`, `status` e `meta`.
3. `currentBundleState` volta ao bundle público.
4. `needsPersist = true` → grava (uma escrita).
5. No provider: `clearUserScopedData()` (§11.2), limpar o cache do React Query da conta,
   cancelar tarefas pendentes.

O **delete de conta** é o mesmo, mas transita para `empty` — apaga também a `identity` — e é
o único caminho que faz isso.

### 5.8 Re-autenticação pelo Apple: o logout que não precisa doer

Com conta única e login exclusivo por Apple, existe uma saída que o Bluesky não tem: quando
a sessão morre de verdade (veredito terminal do §5.6), o usuário **não precisa** cair numa
tela de login em branco.

O `expo-apple-authentication` expõe `getCredentialStateAsync(appleUserId)`, que responde
**sem rede e sem interação** se aquela credencial ainda está autorizada para o app:

| Estado | Significado | O que o app faz |
| --- | --- | --- |
| `AUTHORIZED` | o usuário continua com o app autorizado no Apple ID | tela "entrar como @fulano" com **um botão**; o toque chama `signInAsync` (Face ID, sem digitar nada) e refaz a sessão |
| `REVOKED` | o usuário revogou o app em Ajustes → Apple ID | login completo, e limpar o dado por-usuário (§2.6) |
| `NOT_FOUND` | credencial desconhecida neste device | login completo |
| `TRANSFERRED` | migração de team id do app | tratar como login completo |

Três honestidades sobre isso:

1. **Não é re-auth silencioso.** O Apple não devolve `identityToken` novo sem gesto do
   usuário — `signInAsync` sempre apresenta a folha do sistema. O que economizamos é a
   digitação e a escolha: vira um toque com Face ID, não um fluxo de cadastro.
2. **`getCredentialStateAsync` é local.** Serve para decidir *qual tela mostrar*, nunca para
   decidir se a sessão do backend é válida. A autoridade sobre a sessão continua sendo o
   backend.

3. **Uma conta migrada da Fase 1 não tem `appleUserId`** e cai no login completo — a regra
   tem que checar o campo, não presumi-lo. Depois do primeiro login pós-migração o campo
   passa a existir, e a partir daí o atalho vale.

Note que isso é **local e instantâneo**, diferente do `checkAppleAccountExists` que o app já
tem: aquele é uma request ao backend para decidir entre `appleSignIn` e `appleSignUp`, e
continua necessária no fluxo de entrada. O `getCredentialStateAsync` só responde "esta
credencial ainda serve neste device", sem rede — que é a pergunta certa para escolher a tela.

Onde isso entra: no `RootLayoutNav`, no ramo `state === "signed-out"` (§5.1), e na tela para
onde o `signOut` por expiração leva. É o que transforma o pior caso do §0.1b —
o refresh token realmente expirou durante um background longo — de "fui deslogado e preciso
logar de novo" em "toquei uma vez e voltei".

Vale notar a ordem de prioridade: isto é o **último** recurso. O §5.5 existe para que o
refresh token quase nunca chegue a expirar; o §5.6 existe para que uma falha de rede nunca
seja confundida com expiração. Esta seção só cobre o que sobrar dos dois.

### 5.9 Descarte do bundle

`useEffect` no provider comparando com `currentBundleRef`. O descarte é **adiado para
pós-commit** de propósito: componentes ainda podem renderizar contra o bundle que sai
durante o commit que o troca, e desabilitar a sessão inline puxaria o transporte debaixo
deles. Eventos emitidos nessa janela são descartados pelo guard de identidade.

---

## 6. O guard de identidade do bundle

É a invariante mais importante do módulo. Toda ação `received-session-event` começa com:

```ts
if (bundle !== state.currentBundleState.bundle) return state
```

Isso impede que um bundle obsoleto — de um login superado, de uma troca de conta, de um
logout — **(a)** desloge a conta corrente, ou **(b)** ressuscite tokens depois de um logout.

O cenário (b) é reproduzível no código de hoje: um `doRefreshToken` em voo quando o usuário
desloga grava `storage.set(jwtKeys.token, newToken)` **depois** do
`clearSessionDataPreservingTutorial()`, deixando o app com token de uma sessão que o usuário
já encerrou. O guard fecha isso.

O mesmo padrão se repete em: `refreshSession()` (rejeita se o bundle mudou durante o voo) e
`resumeSession` (predicado `shouldActivate` antes de promover o bundle).

---

## 7. O que **não** portamos do Bluesky

- **§8 deles, sync entre abas.** Circle é app nativo; não há `BroadcastChannel` nem
  múltiplas instâncias sobre o mesmo storage. `persisted.readLatest` não tem razão de
  existir — com MMKV síncrono, `get` já é sempre a leitura mais recente.
- **§7 deles, resgate de expiração multi-geração.** Existe para resolver a corrida entre
  abas do item anterior. Sem abas, o cenário "outra instância rotacionou o token enquanto eu
  dormia" não ocorre. **Manter a nota**: se um dia houver App Clip, widget ou extensão
  compartilhando o App Group do MMKV, o cenário volta e o resgate precisa voltar junto.
- **Os três clientes (`appview`/`pds`/`chat`).** São específicos da arquitetura federada do
  atproto. Circle fala com um backend só: **um** `AxiosInstance` por bundle.

---

## 8. O que é logado

Regra: **nenhum log pode conter fragmento de token** — nem prefixo, nem sufixo. Um prefixo
de JWT é o header base64 (praticamente constante, inútil), mas o sufixo é parte da
assinatura, e o `headerPreview` do **refresh token** é o pior caso.

Os logs passam a carregar apenas booleanos de presença e metadados:

```ts
{ userId, hasAccessToken: true, hasRefreshToken: true, event: "update", durationMs: 412 }
```

Nenhum tipo de payload de log deve ser sequer **capaz** de carregar um token — o tipo do
evento de log não tem campo de string livre para isso. E os logs verbosos de
`/moments/*` e `/auth/*` do interceptor atual ficam atrás de `__DEV__`.

Ações concretas sobre o código atual, em `src/api/index.ts`:

- remover `authPreview`, `preview`, `headerPreview`, `gotTokenPreview`, `tokenPreview`,
  `refreshHeaderPreview`;
- envolver os blocos `console.log` de request/response em `if (__DEV__)`.

---

## 9. Observações de segurança

- **Tokens em texto claro no MMKV — risco aceito.** Criptografar em repouso foi avaliado e
  **saiu do escopo** (Fase 5, §12), com o custo e as pegadinhas registrados lá. Enquanto
  isso valer, o modelo de ameaça é explícito: quem tiver acesso ao storage do aparelho tem
  a sessão. As defesas que restam são as do backend — revogação por reuso e uma sessão ativa
  por usuário (§13.1).
- **Conta única reduz a superfície de credencial.** Há **um** par de tokens no device, não
  N como no seletor de contas do Bluesky. O risco muda de lugar, não some: a troca de Apple
  ID no mesmo aparelho vaza dado por-usuário se a limpeza do §2.6 não rodar — e hoje ela não
  roda (itens 4 e 5 do §0).
- **Sem verificação de assinatura no cliente.** `exp` é lido de um payload não confiável.
  Aceitável (o servidor valida), mas significa que um token adulterado localmente muda
  decisões de agendamento e roteamento do app — nunca decisões de autorização.
- **O refresh token é uma credencial permanente.** Ele não expira: vale até ser usado ou
  revogado. Isso o aproxima mais de uma senha do que de um token de sessão — um dump do MMKV
  de um aparelho é acesso à conta por tempo indeterminado, não por alguns dias. É o
  argumento que faria a criptografia em repouso valer a pena, e o motivo de a Fase 5 ficar
  registrada em vez de simplesmente apagada.
- **O logout revoga a sessão, mas não o access token nem o push.** `POST /auth/signout`
  (§5.7) invalida todos os refresh tokens do usuário, então a sessão não se renova. Mas o
  access token emitido continua aceito até o próprio `exp` — até 10h — e o device segue
  registrado para push da conta que saiu (pedido aberto no §13.1).

---

## 10. Resumo do fluxo por evento

| Evento | Ação do reducer | Estado resultante (§2.3) | Persiste? | Efeito no bundle |
| --- | --- | --- | --- | --- |
| Login / cadastro | `signed-in` | `active` | sim | novo bundle |
| Resume (cold start) | `resumed` | `active` | sim | novo bundle |
| Refresh bem-sucedido | `received-session-event` (`update`) | `active` (nova `credentials`) | sim | mesmo bundle, tokens novos |
| Erro de rede no refresh | `received-session-event` (`network-error`) | inalterado | **não** | inalterado (transitório) |
| Sessão expirada | `received-session-event` (`expired`) | `signed-out` | sim | volta ao bundle público |
| Atualização de perfil/status | `patched-profile` | `active` (novo `profile`/`status`) | sim | inalterado |
| Logout | `logged-out` | `signed-out` | sim | bundle público |
| Delete de conta | `account-deleted` | `empty` | sim | bundle público |

Note que **um único evento não persiste**: `network-error`. É a tradução em tabela da regra
do §5.6 — falha transitória não toca no storage, então nada que ela faça pode sobreviver a
um restart.

---

## 11. Estrutura de arquivos alvo

### 11.1 O novo módulo `src/session/`

```
src/session/
  schema.ts        Identity / Credentials / ProfileCache / AccountStatus + a união
                   PersistedSession (§2.3), validate() e degrade()
  storage.ts       leitura/escrita de @circle:session + cadeia de migração (§2.4)
  jwt.ts           decodeExp, decodeSub, isAccessTokenExpired, offset de relógio (§4)
  session.ts       class Session — dono dos tokens, single-flight, hooks, kill
  bundle.ts        buildBundle / PublicBundle / kill switch (WeakMap)
  reducer.ts       State, ações, guard de identidade
  store.ts         SessionStore — dispatch síncrono + persistência
  runtime.ts       ponte da Fase 2: instancia a Session e espelha nas chaves legadas
  revalidation.ts  barreira de AppState + agendamento por exp (§5.5)
  verdict.ts       classificação da falha de refresh em 4 categorias (§5.6)
  apple.ts         estado da credencial Apple + re-auth de um toque (§5.8)
  index.tsx        Provider React, resumeSession, login, logout, efeito de descarte
  logging.ts       tipos de evento redigidos (sem token possível)
  __tests__/
```

O `src/api/index.ts` perde o estado de refresh e a escrita no MMKV; vira uma
**factory** `createApiClient(session)` que instala os interceptors amarrados àquela sessão.

### 11.2 `src/contexts/Persisted/` reorganizado

Hoje o `Persisted` é dividido pelo **formato do payload de login** (`account`, `user`,
`preferences`, `metrics`) — que é um recorte do backend, não do app. Daí a esquisitice de
`persist.account.ts` guardar, no mesmo arquivo, tokens JWT e a lista de momentos curtidos.

Com os tokens saindo para `src/session/`, o recorte certo passa a ser **o tempo de vida do
dado**:

| Escopo | Sobrevive ao logout? | Some quando troca o Apple ID? |
| --- | --- | --- |
| **sessão** (`src/session/`) | não | — |
| **usuário** (`viewer`) | não | sim, obrigatoriamente |
| **device** | sim | não |

```
src/contexts/Persisted/
  index.tsx              Provider — hidrata as stores a partir dos eventos de sessão
  types.ts               tipos compartilhados (sem os campos de JWT)
  scopes.ts              ── NOVO: declara cada chave como "user" ou "device";
                            é o que alimenta clearUserScopedData() (§2.6)
  persist.viewer.ts      ── FUSÃO de persist.account.ts + persist.user.ts
  persist.preferences.ts (inalterado)
  persist.metrics.ts     (inalterado)
  persist.device.ts      ── NOVO: permissões, posição da câmera, tutorial
  helpers.ts             parseIdList e afins, hoje duplicados dentro de persist.account
  __tests__/
```

#### `persist.viewer.ts` — a fusão

`account` e `user` descrevem **a mesma entidade**: o usuário logado. A separação atual só
existe porque o backend devolve `session.user` e `session.status` em objetos diferentes.
Depois que os tokens saem, o que resta em `persist.account.ts` é: status da conta
(`verified`, `blocked`, `deleted`, `accessLevel`), termos aceitos, coordenadas e as coleções
de interação (`likedMoments`, `hiddenMoments`, `readNotifications`, `moments`). Nada disso é
"conta" em oposição a "usuário" — é tudo o mesmo viewer.

```ts
// src/contexts/Persisted/persist.viewer.ts
export interface ViewerState {
    // identidade (vinha de persist.user)
    id: string
    username: string
    name: string
    description: string
    richDescription: string
    profilePicture: string

    // status da conta (vinha de persist.account)
    isVerified: boolean
    isActive: boolean
    blocked: boolean
    deleted: boolean
    accessLevel: string
    terms: AccountTerms

    // interação (vinha de persist.account) — em memória vivem aqui, mas cada uma
    // persiste na SUA chave, não dentro do blob do viewer (§2.2 P2, §2.5)
    moments: AccountMoment[]
    totalMoments: number
    likedMoments: string[]
    hiddenMoments: string[]
    readNotifications: string[]
    coordinates: { latitude: number; longitude: number }

    setIdentity: (value: ViewerIdentity) => void
    setStatus: (value: ViewerStatus) => void
    // ...as ações de coleção, como hoje
    hydrate: () => void
    clear: () => void
}

export const useViewerStore = create<ViewerState>(/* ... */)
```

Três coisas que a fusão resolve, além de ser um arquivo a menos:

1. **Uma limpeza só, e que funciona.** Hoje o logout chama quatro `remove()` — e chama os
   quatro **errado**, pelo hook em vez de `.getState()` (item 8 do §0), de dentro de um `try/catch`
   que engole a falha. Além disso, o `remove()` do `persist.account` apaga `moments` e
   `totalMoments` do MMKV mas os omite do `set` final, deixando-os em memória mesmo se a
   chamada tivesse funcionado. Um store só, com um `clear()` só, chamado via `.getState()`
   pelo `SessionStore`: some a chance de divergir e some o hook fora de componente.
2. **`verified` para de existir em duplicata.** Hoje ele mora nos dois stores
   (`key.account.verified` e `key.user.verified`) e o `syncSessionData` grava o mesmo valor
   do backend nos dois. Duas fontes para o mesmo fato é uma fonte a mais do que existe.
3. **O `id` do viewer vira a âncora natural** do `clearUserScopedData` (§2.6) — hoje ele
   está em `persist.user` e as coleções que precisam ser limpas estão em `persist.account`.

O arquivo fica na ordem de 300 linhas, o mesmo tamanho do `persist.account.ts` atual: os
helpers repetidos (`parseIdList`, normalização de lista de ids) saem para `helpers.ts`.

#### `scopes.ts` — o que some quando

O `clearSessionDataPreservingTutorial()` de hoje decide por prefixo de string, com o
tutorial hardcoded como exceção. Toda chave nova nasce implicitamente "apaga no logout", e a
única forma de descobrir isso é ler a função. Inverter a declaração:

```ts
// src/contexts/Persisted/scopes.ts
// as chaves são exatamente as do mapa do §2.2
export const KEY_SCOPES = {
    "@circle:session": "session",
    "@circle:viewer": "user", // e todo o prefixo @circle:viewer:*
    "@circle:metrics": "user",
    "@circle:preferences": "device", // idioma e timezone são do aparelho
    "@circle:tutorial": "device",
    "@circle:device": "device",
} as const

export function clearUserScopedData() {
    /* varre por escopo declarado, não por exceção hardcoded */
}
```

`clearUserScopedData()` passa a ser chamado em **dois** lugares — no logout e no login com
Apple ID diferente (§2.6) — em vez de só no logout, que é o buraco do item 4 do §0.

#### O que `index.tsx` deixa de fazer

O `syncSessionData` atual normaliza o payload inteiro do backend e escreve nos quatro
stores. Ele perde o bloco de `account`: os `jwtToken` / `jwtExpiration` / `refreshToken`,
com todo o cuidado de "só sobrescrever se vier valor válido" — cuidado que existe
justamente porque hoje há dois donos do token. O que sobra é hidratar viewer, preferences e
metrics a partir do evento `signed-in` / `resumed` do `SessionStore`.

O `PersistedConsumerBinder` + `injectRef` de `contexts/auth.tsx` — a ponte por `ref` que
existe só para o `AuthProvider` alcançar o `PersistedProvider` — desaparece junto: quem
grava a sessão é o `SessionStore`, e o `Persisted` **observa** em vez de ser empurrado.

#### Testes

`persistedAccount.test.ts` + `persistedUser.test.ts` → `persistedViewer.test.ts`. Os testes
de token que hoje vivem em `persistedAccount.test.ts` migram para `src/session/__tests__/`,
e `src/api/__tests__/refresh.test.ts` vira `src/session/__tests__/session.spec.ts` — é ali
que o refresh passa a morar.

---

## 12. Migração

Fasear para nunca ter dois donos do token ao mesmo tempo.

**Fase 0 — higiene.** ✅ **Concluída.**

| Item | Resultado |
| --- | --- |
| Remover o login por senha (legado morto: `signIn`/`signUp`, telas, `PasswordInput`) | 3 telas, 1 componente, 2 rotas e o estado de senha |
| Corrigir a chave `profilePicture` sem prefixo (item 5 do §0) | chave prefixada + `migrateUnprefixedProfilePicture` + 5 testes |
| Remover previews de token dos logs e pôr os verbosos atrás de `__DEV__` (§8) | helper `devLog`; nenhum log carrega fragmento de token, e o corpo da resposta de erro deixou de ser despejado |
| Apagar o código morto do §13.2 | `useRefreshJwtToken` + teste, `apiRoutes.auth.refreshToken`, `refreshTokenProps`, `@circle:sessionId` |
| Remover `refreshExpiresIn` (§13.1: o campo não existe mais na API) | tipo e comentários |

Só a correção do `profilePicture` **muda comportamento**, de propósito: passa a apagar a
foto do usuário anterior no logout. Como efeito colateral, a extração do `ensureAuthHeader`
eliminou um erro de tipo pré-existente em `src/api/index.ts` e um bloco de "enforcement" de
header que nunca podia disparar (a condição era idêntica à da injeção que vem antes).

**Fase 1 — schema, storage e migração de chaves.** ✅ **Concluída.**

`src/session/{schema,storage,jwt}.ts`, sem fiação: os módulos existem e são testados, mas
ninguém os chama ainda — quem liga é a Fase 2. Isso é proposital, e é o que torna a fase
reversível: apagar a pasta desfaz tudo.

| Módulo | Entrega | Testes |
| --- | --- | --- |
| `schema.ts` | a união `PersistedSession` do §2.3, `validate()` e `degrade()` | 13 |
| `storage.ts` | `readSession`/`writeSession`, cadeia de migração e `migrateFromLegacyKeys` | 18 |
| `jwt.ts` | `decodeExp`/`decodeSub`, `isAccessTokenExpired`, offset de relógio pelo header `Date` | 17 |

Decisões tomadas durante a implementação, todas já refletidas acima:

- **`isAccessTokenExpired`, não `isTokenExpired`.** O nome é a defesa contra a armadilha do
  refresh token sem `exp` (§4, §13.1).
- **Base64url decodificado à mão**, sem depender de `atob`. Funciona em qualquer runtime e
  no ambiente de teste. Só lemos campos ASCII (`exp`, `sub`), o que torna a simplificação
  de latin1 inofensiva — está comentado no código.
- **A migração legada não apaga as chaves antigas** e **não roda se já houver blob**. A
  segunda regra tem teste próprio: sem ela, um logout seria desfeito na próxima leitura
  pelas chaves antigas que continuam lá.
- **O offset de relógio usa a chave `clockOffset` que já existia** em `storageKeys()` —
  declarada e nunca usada até agora — em vez de inventar uma nova.

Detalhes da `migrateFromLegacyKeys()` (§2.4), que monta
`{ state: "active", identity, credentials, profile, status, meta }` a partir das chaves
soltas e grava o blob:

- `identity.userId` vem de `@circle:user:id`; se ele estiver vazio mas houver tokens, o
  `userId` é lido do `sub` do próprio JWT — e só se nem isso existir a migração desiste e
  devolve `empty`.
- `appleUserId` não existe no storage atual: fica ausente e é preenchido no próximo login.
  Conta sem ele **nunca** dispara a limpeza do §2.6 — falha para o lado seguro de não apagar.
- `credentials.generation` começa em `0`.
- **As chaves antigas não são apagadas** — rollback precisa continuar possível.

**Fase 2 — `Session` + reducer + store, ainda sem trocar o axios.** ✅ **Concluída.**

A `Session` é a dona do refresh, e o interceptor **delega**. As variáveis de módulo
(`isRefreshing`, `refreshPromise`, `pendingQueue`) sumiram — a fila era uma reimplementação
manual de compartilhamento de promise, e `session.refresh()` já devolve a mesma promise a
todos os chamadores concorrentes. O guard de identidade entrou em vigor.

| Módulo | Entrega | Testes |
| --- | --- | --- |
| `verdict.ts` | as 4 categorias do §5.6 com os códigos reais, backoff com jitter | 14 |
| `session.ts` | single-flight, latch `armed`, `kill()`, timeout → "desconhecido" | 21 |
| `reducer.ts` | ações do §10 + **guard de identidade** | 16 |
| `store.ts` | dispatch síncrono, persiste antes de notificar | 10 |
| `runtime.ts` | a ponte: instancia a `Session`, espelha nas chaves legadas | 12 |

**A ponte, e por que ela existe.** Nesta fase as chaves antigas do MMKV continuam sendo o
storage de referência: o interceptor de request ainda lê `account:jwt:token`, e o login
ainda escreve por lá. A regra da coexistência é:

> as chaves antigas são a **fonte** das credenciais; a `Session` é a única que as **rotaciona**.

Uma rotação bem-sucedida escreve nos dois lugares. É redundante de propósito, e é o que
torna a fase reversível sem ninguém perder sessão.

O risco real dessa coexistência é o login: ele troca as credenciais **por fora** da
`Session`. Por isso o `runtime` reaproveita a instância apenas enquanto ela descrever o
**mesmo** refresh token; quando ele muda, a instância antiga leva `kill()` e não consegue
mais consumir token nenhum. Sem isso, uma sessão órfã de um login anterior poderia rotacionar
um token já substituído — e, com detecção de reuso, isso revoga a conta. Tem teste próprio.

**Mudança de comportamento deliberada.** Uma resposta 200 sem `refreshToken` passou a ser
**terminal**. O código antigo a aceitava (`if (newRefresh)`) e seguia com o access novo — o
que, pelo contrato atual, significa guardar um refresh token **já consumido** e disparar a
detecção de reuso na próxima tentativa. Os dois caminhos acabam em logout; este acaba sem
marcar a conta com um evento de segurança falso-positivo. O fixture do teste antigo
codificava o contrato anterior e foi atualizado.

**Fase 3 — bundle + client por sessão, e a barreira de retomada.** *Em andamento.*

Já feito no client:

- **O interceptor de request deixou de ler o MMKV.** O token vem de `currentAuth()`, que
  prefere a sessão viva e só cai no storage quando ainda não há `Session` construída (logo
  após o login, na coexistência da Fase 2). É o que fecha a corrida de token stale.
- **Geração de token carimbada em toda request** (§5.4). No 401, uma request de geração
  anterior é **repetida**, não vira gatilho de refresh — a regra que sozinha resolve a maior
  parte da rajada de retomada, e que evita a rotação extra que pode se perder.
- **`_retry` virou `authAttempts`** com teto 2, e só é consumido quando o refresh de fato
  aconteceu. Era o booleano que deixava o app quebrado após uma falha transitória (§0.1a).
- **`beginAuthGracePeriod` removido**, do `src/api` e do `AuthContext`. Ele adiava o 401 por
  um segundo para esconder a janela entre "login respondeu" e "token no MMKV" — janela que
  deixou de existir quando o interceptor passou a ler a sessão.

**Fiado e funcionando:**

- **A barreira está no ar.** `foreground.ts` instala o listener de `AppState` no
  `AuthProvider` e o interceptor de request aguarda `waitForRevalidation()` antes de deixar
  qualquer request sair. A rota de refresh é **isenta** — ela é quem abre a barreira, e
  fazê-la esperar seria esperar por si mesma: deadlock com o app travado sem erro nenhum.
- **O token manual deixou de vencer o token vivo.** O interceptor agora **sobrescreve** o
  header `Authorization` em vez de só preencher quando falta. Havia **34 chamadas** passando
  `session.account.jwtToken` à mão, lido do Zustand — que fica defasado logo após uma
  rotação. Como o header manual vencia, a corrida de token stale que o §3.2 fecha estava
  reaberta pela porta dos fundos. Quem legitimamente carrega outra credencial (o refresh,
  que manda o **refresh token**, e o signout) marca `ownAuth` e passa intacto.
- **A decisão de entrada saiu do booleano.** O `RootLayoutNav` usa `decideEntryScreen`
  (§5.8) sobre a união do §2.3, em vez de `checkIsSigned()`.

Módulos prontos, ainda **sem fiação** no provider:

| Módulo | Entrega |
| --- | --- |
| `bundle.ts` | `SessionBundle` / `PublicBundle` (client que lança `NotAuthenticatedError` antes de qualquer I/O), kill switch em `WeakMap`, `disposeBundle` idempotente |
| `revalidation.ts` | a barreira de `AppState` e o agendamento por `exp` (§5.5), com `now`/`isConnected`/`schedule` injetados — sem isso o módulo não roda no vitest |

Falta ligar os dois no provider e no `RootLayoutNav`.

> **Nota de escopo.** O desenho fala em `createApiClient(session)` — um `AxiosInstance` por
> bundle. Na prática, todos os arquivos de rota importam o singleton `api` de `@/api`, então
> instanciar um client por sessão exigiria passá-lo por contexto até cada chamada. O ganho
> real do §3.2 é o interceptor ler a sessão em vez do storage, e isso já está feito. O client
> por instância fica para quando (e se) houver mais de uma sessão viva ao mesmo tempo — o que
> com conta única não acontece.
`createApiClient(session)`; o interceptor de request para de ler o MMKV. `AuthContext` passa
a delegar para `SessionStore`. Entram a barreira de `AppState` e o agendamento por `exp`
(§5.5) — é o que fecha o sintoma que motivou tudo. Remover `beginAuthGracePeriod`.

**Fase 3.5 — reorganização do `Persisted` (§11.2).** ✅ **Núcleo e correções de bug
concluídos**; a fusão das stores fica pendente.

**O vazamento de privacidade está fechado.** `identityGuard.ts` compara quem entra com quem
o device lembra e chama `clearUserScopedData()` **no login**, não só no logout — que era o
buraco: quem troca de conta sem deslogar nunca passava pela limpeza. A comparação é por
`appleUserId` com fallback para `userId`, e o `recordLogin()` grava a âncora no blob, sem o
que ela nunca existiria para o login seguinte. Sem nada comparável dos dois lados, falha
para o lado de **não** apagar: perder dado de quem só atualizou o app é dano garantido; o
vazamento é possibilidade, e a entrada seguinte já decide certo.

**A fusão está feita.** `persist.account.ts` e `persist.user.ts` **não existem mais** — e com
eles foram embora a duplicata de `verified`, os quatro `remove()` que podiam divergir, e os
tokens dentro de uma store de perfil. Sobrou uma store por escopo:

```
persist.viewer.ts       o usuário logado (identidade + status + termos + interação)
persist.preferences.ts  device
persist.metrics.ts      usuário
scopes.ts / helpers.ts  a tabela de escopos e os utilitários antes duplicados
```

`session.user` e `session.account` continuam existindo no contexto, mas agora são **vistas
de leitura sobre a mesma store**, montadas em `index.tsx`. Foi a forma de fazer a fusão sem
uma renomeação em 38 arquivos e 117 pontos de consumo, que este repositório não conseguiria
verificar — ele não renderiza componente em teste (`CLAUDE.md`). Existe uma fonte de verdade;
os nomes antigos apontam para ela. A vista adapta três coisas: `id` → `userId`, o `set` que
misturava identidade e status, e o `remove()` que virou um `clear()` só.

O `jwtToken` sobrevive na vista marcado como `@deprecated`: o interceptor injeta o token da
sessão viva e sobrescreve o header (§3.2), então passá-lo à mão deixou de decidir
autenticação. Ele sai quando os 34 chamadores forem limpos — e agora isso é cosmético, não
correção.
`persist.viewer.ts` (a fusão), `scopes.ts` e `helpers.ts` existem e são testados. Falta o
**cutover**: trocar os importadores de `useAccountStore`/`useUserStore` e apagar os dois
arquivos antigos — que é a parte que toca arquivos compartilhados.

Duas coisas que o `scopes.ts` resolveu além do previsto: ele declara também as **chaves
legadas** que ainda existem enquanto a migração não termina (deixá-las de fora reabriria o
vazamento que a tabela existe para fechar), e resolve por **prefixo mais longo** — porque
`@circle:account:jwt:` é sessão embora `@circle:account:` seja do usuário. O escopo padrão
de uma chave não declarada é `"user"`: uma chave nova esquecida some no logout em vez de
vazar entre contas.

Detalhes originais da fase:
Fusão de `persist.account.ts` + `persist.user.ts` em `persist.viewer.ts`; `scopes.ts` e
`clearUserScopedData()`; `persist.device.ts`. Só faz sentido **depois** da Fase 3, quando os
tokens já saíram de `persist.account.ts` — fundir antes significaria mover código de token
duas vezes.

O raio de alcance é pequeno e conhecido: **5 arquivos de produção** importam
`useAccountStore`/`useUserStore` (`api/index.ts`, `contexts/auth.tsx`,
`Persisted/index.tsx`, `push.notification.tsx`, e os dois próprios stores) mais 2 de teste.
Fora a fusão, esta fase corrige dois bugs: a chave `profilePicture` sem prefixo (item 5 do
§0) e a limpeza no login com Apple ID diferente.

**Fase 4 — re-auth de um toque (§5.8).** ✅ **Núcleo concluído** (`src/session/apple.ts`,
10 testes). Falta ligar no `RootLayoutNav` e desenhar a tela.

`decideEntryScreen(session, deps)` traduz a sessão persistida em
`app | one-tap | full-login`, consultando o Apple **só quando a resposta pode mudar a
decisão**. O import do nativo é dinâmico e a dependência é injetável — sem isso o módulo não
carregaria no vitest.

Três casos degradam para login completo e valem registro, porque são os que evitam uma tela
pior que a tela de login:

- **Conta migrada sem `appleUserId`** — não há o que perguntar ao Apple, e perguntar custaria
  um round-trip inútil.
- **Sem `username` guardado** — o schema tem fallback `""`, então o atalho viraria "entrar
  como @". Admitir que não sabemos quem é, é melhor que isso.
- **Exceção do nativo** (simulador, iOS antigo, módulo ausente) — uma falha aqui derrubaria
  a navegação do cold start.

`clearUserScopedData` é devolvido como **sinal**, não executado: decidir tela e apagar
storage são responsabilidades de vidas diferentes. Quem consome chama o `clearUserScopedData()`
do §11.2.

**Fase 5 — criptografia em repouso.** ❌ **Removida do escopo.**

Chegou a ser implementada e depois retirada — módulo, dependências (`expo-secure-store`,
`expo-crypto`), plugin do `app.config.js` e mocks de teste. Fica o registro do que a fase
exigiria, para quem retomar não redescobrir do zero:

- **Duas dependências nativas, não uma.** Além do Keychain falta a fonte de aleatoriedade:
  o runtime do SDK 56 não tem `crypto.getRandomValues`, então sem `expo-crypto` a chave
  nunca é gerada e a criptografia não liga. Um teste em happy-dom **não** pega isso, porque
  lá existe Web Crypto.
- **Dev build obrigatório**, e com uma armadilha na janela: o import tem que ser estático
  (senão o Metro não inclui o pacote no bundle), e aí um binário sem o módulo nativo falha
  **no import**, não na chamada — nenhum try/catch interno protege disso.
- **O MMKV aceita no máximo 16 bytes de `encryptionKey` e trunca em silêncio.** Passar os 64
  caracteres hex de uma chave de 256 bits criptografaria com 64 bits. É preciso derivar.
- **Ponto sem volta.** Depois que as chaves saem do claro, um rollback para build anterior
  não as encontra e todo mundo desloga.
- **Decisão de produto embutida:** com `WHEN_UNLOCKED_THIS_DEVICE_ONLY` a chave não viaja em
  backup nem em migração de aparelho — o que desloga o usuário a cada troca de celular.

O argumento a favor continua de pé e vale reavaliar quando houver apetite: pelo contrato do
§13.1 **o refresh token não expira**, então em repouso ele é mais parecido com uma senha do
que com um token de sessão, e um dump do MMKV é acesso à conta por tempo indeterminado.

### Cobertura de testes por fase

Sob Vitest, sem renderização de componente (ver `CLAUDE.md` — `@testing-library/react-native`
não funciona aqui). Cada fase só fecha com os seus testes verdes:

| Fase | Arquivo | O que provar |
| --- | --- | --- |
| 1 | `schema.spec.ts` | blob válido; JSON corrompido → `empty`; `identity` sem `userId` → `empty`; `credentials` corrompida com `identity` boa → **`signed-out`**, não `empty`; `schemaVersion` futuro → `signed-out` |
| 1 | `storage.spec.ts` | migração legada roda quando a chave não existe; **não** roda quando já existe blob; não apaga as chaves antigas; `userId` vindo do `sub` do JWT quando `user:id` está vazio |
| 1 | `jwt.spec.ts` | `exp` ausente → expirado; token malformado → expirado; margem de skew de 30s; offset de relógio aplicado |
| 2 | `session.spec.ts` | **N chamadas concorrentes de `refresh()` produzem uma request**; falha transitória preserva tokens e não desloga; terminal mata; hook que lança não deixa a promise interna rejeitada para sempre; sessão morta (`kill()`) não consome refresh token |
| 2 | `verdict.spec.ts` | a tabela do §5.6 inteira, caso a caso — incluindo timeout → `desconhecido`, nunca terminal |
| 2 | `reducer.spec.ts` | **guard de identidade**: evento de bundle obsoleto não altera o estado; `network-error` não marca `needsPersist`; logout leva a `signed-out` preservando `identity` |
| 2 | `store.spec.ts` | persiste no dispatch, não no render; o que vai ao MMKV é `state.session` sem transformação |
| 3 | `client.spec.ts` | request com `tokenGeneration` antiga é **repetida** sem disparar refresh; a barreira segura requests em vez de deixá-las 401; `authAttempts` não é consumido por falha transitória |
| 3.5 | `persistedViewer.spec.ts` | `clear()` zera memória **e** storage; blob com `userId` diferente é descartado na hidratação; tetos das coleções (§2.5) |
| 4 | `apple.spec.ts` | cada estado de credencial leva à tela certa; conta sem `appleUserId` cai no login completo |

O teste que mais importa é o do single-flight na Fase 2: é ele que impede a regressão que
causou o §0.1 inteiro.

---

## 13. Pré-requisitos antes de codar

### 13.1 Contrato do backend — respondido

O time de backend documentou o ciclo de vida completo (*"Autenticação: refresh token e
signout — guia de implementação para o frontend"*, repositório `Circle-System`). As duas
perguntas bloqueantes estão respondidas, e **a resposta é o pior caso dos dois possíveis**:

| # | Pergunta | Resposta |
| --- | --- | --- |
| 1 | O refresh rotaciona? | **Sim.** Todo refresh devolve um par novo (access + refresh) |
| 2 | É de uso único? Há detecção de reuso? | **Sim para os dois.** O refresh vira `used` no instante em que é consumido, e reapresentá-lo **revoga todas as sessões do usuário** |
| 3 | TTL | Access: `expiresIn`, hoje **36000s (10h)**. Refresh: **não expira** — é emitido sem claim `exp` |
| 4 | Janela de graça de reuso? | **Não existe.** O token usado morre no mesmo instante |
| 5 | Rota de sondagem de sessão? | Não há |
| 6 | Rota de logout? | **Sim, nova:** `POST /auth/signout`. Desregistro de push continua não existindo |
| 7 | Header do refresh | `Bearer <refresh>` — o backend aceita o token cru, mas `Bearer` é o preferido |

Três consequências que atravessam o documento inteiro:

**O §0.1c é real e é o pior caso.** Com rotação de uso único, sem janela de graça, e com
detecção de reuso que revoga a **família toda**, um refresh cuja resposta se perdeu (timeout
local, app morto no meio) deixa o device segurando um token já consumido. A próxima
tentativa não falha sozinha: derruba a sessão inteira. Não há como o cliente se recuperar
disso — só re-login. As três defesas do desenho (timeout generoso, single-flight de verdade,
escrita atômica do par) deixam de ser zelo e viram requisito.

**O refresh token não tem `exp`, e isso é uma armadilha de código.** Toda função de
expiração deste projeto trata "sem `exp`" como "expirado" — o lado seguro para o access
token, e exatamente o lado errado para o refresh. Aplicar a checagem ao refresh declararia
morta uma sessão viva. Por isso a função se chama `isAccessTokenExpired` e não
`isTokenExpired`, com o caso travado em teste (`src/session/__tests__/jwt.spec.ts`).
Quem decide se o refresh ainda serve é o banco (`active` vs `used`), nunca o cliente.

**Uma sessão ativa por usuário.** `signin`, `signup` e `/auth/apple` revogam todos os
refresh tokens anteriores do usuário. Logar em outro aparelho derruba este. Então um
`401 REFRESH_TOKEN_INVALID` **não significa necessariamente "sua sessão expirou"** — pode
significar "você entrou em outro dispositivo". A mensagem ao usuário precisa dar conta das
duas leituras, e o re-auth de um toque do §5.8 fica ainda mais valioso: essa é uma causa de
logout que nenhum refresh proativo evita.

O que o backend recomenda bate com o que já estava desenhado aqui — single-flight por
promise compartilhada, gravação atômica do par, e 401/403 como logout contra 500 como
retry. Duas recomendações dele valem ser citadas literalmente, porque são as que o código
atual viola:

> "Nunca faça retry automático de um refresh que falhou com 401. O token já morreu; repetir
> só confirma o reuso."

> "Grave os dois tokens numa única escrita. Se o app cair entre gravar o access e o refresh,
> a sessão fica inconsistente."

#### O que ainda vale pedir ao backend

Nenhum destes bloqueia a implementação; todos reduzem logout indevido:

1. **Janela de graça de reuso (~30–60s)**, devolvendo o par corrente em vez de revogar a
   família. É a única correção que elimina o §0.1c na raiz — o cliente não tem como resolver
   uma rotação perdida sozinho.
2. **Rota barata de sondagem de sessão** (`GET /auth/session`), para o veredito
   "desconhecido" do §5.6 não precisar chutar.
3. **Desregistro de push no signout.** O `POST /auth/signout` revoga os refresh tokens, mas
   o device continua registrado para receber push da conta que saiu.
4. **Sessões simultâneas por dispositivo.** Hoje entrar no iPad derruba o iPhone. É decisão
   de produto, não de infraestrutura — mas convém que seja uma decisão consciente.

### 13.2 Código morto encontrado — ✅ removido na Fase 0

Registro do que foi encontrado ao cruzar o documento com o repositório, mantido porque
explica *por que* cada coisa saiu. Nada disso está mais no código:

- **`src/lib/hooks/useRefreshJwtToken.ts` — um segundo caminho de refresh, inteiramente
  quebrado.** Tem `//@ts-nocheck` no topo (por isso o `tsc` não acusa), importa de
  `@/contexts/persisted/persistedAccount` (arquivo que não existe — só resolve por acaso no
  Windows, e nem lá o `persistedAccount`), chama `apiRoutes.auth.refreshToken({username, id})`
  com uma assinatura que a rota não tem, usa `setJwtToken`/`setJwtExpiration` que não existem
  no store, e lê `response.data.jwtToken` quando o backend devolve `token`. **Ninguém o
  importa.** Ele e o seu teste devem sair — e com eles a rota `apiRoutes.auth.refreshToken`,
  que só existe para servi-lo (o refresh real é feito direto por `api.get` dentro do
  interceptor). É essa remoção que resolve a divergência de header da pergunta 7.
- **`@circle:sessionId`** — escrito nos dois caminhos de login e exposto em `storageKeys()`,
  sem nenhum leitor no app.
- **`storageKeys().clockOffset`** — a chave era declarada e nunca usada: o nome de uma
  proteção que não existia. **Ficou**, agora com a implementação por trás (`jwt.ts`, §4).
- **`refreshExpiresIn`** — o campo saiu da API (§13.1) e saiu dos tipos do app.

### 13.3 Decisões já tomadas (não precisam de discussão)

Para não reabrir na implementação: `REFRESH_TIMEOUT` 30s; backoff 1/2/4/8s com teto de 30s;
refresh proativo em `exp - 60s - jitter(0..10s)`; margem de skew de 30s; barreira de
revalidação a partir de 30s em background com teto de 10s esperando rede; `authAttempts`
teto 2; tetos das coleções conforme §2.5.

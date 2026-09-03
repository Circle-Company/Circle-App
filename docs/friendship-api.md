# API de Amizade — guia de integração para o frontend

Substitui o antigo modelo de **follow** (assimétrico) por **amizade recíproca com convite e
aceite**. Este documento cobre todos os endpoints, os payloads de entrada e saída, os
códigos de erro e as mudanças que **quebram** o contrato anterior.

> **Autenticação:** todas as rotas exigem `Authorization: Bearer <accessToken>`.
> Sem token válido a resposta é `401` com `{ success: false, error, code: "AUTHENTICATION_REQUIRED" }`.

---

## 1. Conceitos

Uma relação entre dois usuários tem um **status** e, para quem está olhando, uma **relação**.

### `relation` — o que o usuário logado vê

| valor | significado | o que a UI deve mostrar |
|---|---|---|
| `none` | sem amizade e sem convite | botão **Adicionar amigo** |
| `pending_outgoing` | você enviou o convite, aguardando resposta | **Convite enviado** + ação de cancelar |
| `pending_incoming` | você recebeu o convite | **Aceitar** / **Recusar** |
| `friends` | amizade aceita | **Amigos** + ação de desfazer |
| `declined` | seu convite foi recusado | **Adicionar amigo** (reconvite é permitido) |

**Importante:** `declined` só aparece para **quem enviou** o convite. Para quem recusou, a
relação volta a ser `none` — a recusa é silenciosa por design e o outro lado nunca é
notificado.

### `status` — o estado bruto do convite

`pending` · `accepted` · `declined` · `cancelled`

Aparece nas listagens de convite. Como as listagens só retornam convites **pendentes**, na
prática o frontend verá `pending` ali; o campo existe para não amarrar a UI ao filtro atual.

### Auto-aceite recíproco

Se A já tinha um convite pendente para B e **B envia um convite para A**, os dois viram
amigos na hora, sem passo de aceite. É por isso que `POST /users/:id/friend-request`
pode devolver `outcome: "auto_accepted"` — a UI deve tratar esse caso e já renderizar
"Amigos", não "Convite enviado".

---

## 2. Endpoints

### 2.1 Enviar convite

```http
POST /users/:id/friend-request
```

`:id` = id do usuário que vai **receber** o convite. Sem body.

**200 OK**

```json
{
  "success": true,
  "outcome": "created",
  "areFriends": false
}
```

| `outcome` | quando acontece | `areFriends` | UI |
|---|---|---|---|
| `created` | convite criado (ou recriado após recusa/cancelamento) | `false` | "Convite enviado" |
| `auto_accepted` | o alvo já tinha convidado você → virou amizade | `true` | "Amigos" |
| `already_pending` | você já tinha convite pendente para ele | `false` | "Convite enviado" |
| `already_friends` | já eram amigos | `true` | "Amigos" |

Os três últimos são **idempotentes**: repetir a chamada não gera convite duplicado nem
notificação repetida. O frontend pode reenviar sem medo (retry de rede, duplo toque).

---

### 2.2 Cancelar o convite que você enviou

```http
DELETE /users/:id/friend-request
```

**200 OK** — `{ "success": true, "cancelled": true }`

`404` se não há convite pendente seu para esse usuário. Ninguém é notificado.

---

### 2.3 Aceitar convite recebido

```http
POST /users/:id/friend-request/accept
```

`:id` = id de **quem enviou** o convite.

**200 OK** — `{ "success": true, "areFriends": true }`

`404` se não há convite pendente dele para você. Quem enviou recebe a notificação
`FRIEND_REQUEST_ACCEPTED`.

---

### 2.4 Recusar convite recebido

```http
POST /users/:id/friend-request/decline
```

`:id` = id de **quem enviou** o convite.

**200 OK** — `{ "success": true, "declined": true }`

`404` se não há convite pendente. **Não notifica ninguém** — quem enviou continua vendo
"convite enviado" até tentar de novo ou consultar o status.

---

### 2.5 Desfazer amizade

```http
DELETE /users/:id/friend
```

**200 OK** — `{ "success": true, "removed": true }`

`404` se vocês não eram amigos. Não notifica ninguém. Qualquer um dos dois lados pode
desfazer.

---

### 2.6 Status da relação com um usuário

```http
GET /users/:id/friendship-status
```

**200 OK**

```json
{
  "success": true,
  "relation": "pending_incoming",
  "areFriends": false
}
```

`areFriends` é apenas o atalho de `relation === "friends"`. Para o próprio usuário
(`:id` = você), devolve `relation: "none"` e `areFriends: false`.

---

### 2.7 Listar amigos

```http
GET /users/:id/friends?limit=50&offset=0
```

| query | default | limites |
|---|---|---|
| `limit` | `50` | máximo `200` (valores acima são truncados, não rejeitados) |
| `offset` | `0` | negativos viram `0` |

**200 OK**

```json
{
  "success": true,
  "total": 2,
  "friends": [
    {
      "id": "1930000000000000001",
      "username": "alice",
      "name": "Alice",
      "profilePictureUrl": "https://cdn/alice.jpg"
    },
    {
      "id": "1930000000000000002",
      "username": "bob",
      "name": null,
      "profilePictureUrl": null
    }
  ]
}
```

- `total` é a contagem **completa** de amigos, não o tamanho da página — use para o contador.
- A ordem é da amizade mais recente para a mais antiga.
- `name` e `profilePictureUrl` são `null` quando o usuário não os preencheu.

**Visibilidade:** listar os amigos de **outra pessoa** exige poder ver o perfil dela. Perfil
`friends_only` só libera a lista para amigos → `403 FORBIDDEN`. Bloqueio em qualquer
direção também dá `403`.

---

### 2.8 Caixa de convites do usuário logado

```http
GET /account/friend-requests?direction=incoming&limit=50&offset=0
```

| query | valores | default |
|---|---|---|
| `direction` | `incoming` \| `outgoing` | `incoming` (qualquer valor diferente de `outgoing` cai no default) |
| `limit` | 1..200 | `50` |
| `offset` | ≥ 0 | `0` |

**200 OK**

```json
{
  "success": true,
  "direction": "incoming",
  "pendingIncomingCount": 3,
  "invites": [
    {
      "id": "1930000000000000010",
      "userId": "1930000000000000002",
      "status": "pending",
      "relation": "pending_incoming",
      "requestedAt": "2026-08-08T12:00:00.000Z",
      "respondedAt": null,
      "becameFriendsAt": null
    }
  ]
}
```

- `userId` é **o outro lado** da relação (quem convidou, em `incoming`; quem foi convidado,
  em `outgoing`) — já resolvido pelo backend, não precisa deduzir.
- `pendingIncomingCount` vem **nas duas direções** e é a contagem total de convites
  recebidos pendentes → use direto no badge de notificação, sem precisar de outra chamada.
- Só convites **pendentes** são listados. Recusados e cancelados não aparecem.
- Ordenação: mais recente primeiro.

---

## 3. Erros

Todas as rotas de amizade usam o mesmo envelope de falha:

```json
{ "success": false, "error": "mensagem legível", "code": "FORBIDDEN" }
```

| `code` | HTTP | quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | id ausente, ou tentativa de virar amigo de si mesmo |
| `FORBIDDEN` | 403 | bloqueio em qualquer direção, conta inativa, perfil não visível |
| `NOT_FOUND` | 404 | não há convite/amizade para a ação pedida |
| `USER_NOT_FOUND` | 404 | usuário alvo (ou o próprio) não existe |
| `INTERNAL_ERROR` | 500 | falha inesperada |
| `AUTHENTICATION_REQUIRED` | 401 | token ausente ou inválido |

Mensagens de `403` que valem tratamento próprio na UI:

- `"You have blocked this user, you can't be friends"` — você bloqueou; ofereça desbloquear.
- `"This user has blocked you, you can't be friends"` — ele bloqueou; **não** revele isso de
  forma explícita se o produto preferir discrição.
- `"This user is not available"` — conta deletada ou banida.

---

## 4. Notificações push / inbox

Dois tipos novos chegam pelo canal de notificação já existente:

| `type` | vai para | quando |
|---|---|---|
| `FRIEND_REQUEST_RECEIVED` | destinatário do convite | convite criado |
| `FRIEND_REQUEST_ACCEPTED` | quem enviou o convite | aceite (inclusive o auto-aceite recíproco) |

O `data` do payload traz o deep link:

```json
{
  "type": "FRIEND_REQUEST_RECEIVED",
  "actorId": "1930000000000000002",
  "targetUserId": "1930000000000000001",
  "actorName": "Alice",
  "actorUsername": "alice",
  "actorPhotoUrl": "https://cdn/alice.jpg",
  "screen": "friend_requests"
}
```

- `FRIEND_REQUEST_RECEIVED` → `screen: "friend_requests"` (abrir a caixa de convites).
- `FRIEND_REQUEST_ACCEPTED` → `screen: "profile"` + `userId` do ator (abrir o perfil de
  quem aceitou).

**Não existe notificação** para recusa, cancelamento ou desfazer amizade.

---

## 5. ⚠️ Mudanças que quebram o contrato anterior

Estas são as alterações que o frontend **precisa** acompanhar.

### 5.1 Endpoints removidos

| removido | substituto |
|---|---|
| `POST /users/:id/follow` | `POST /users/:id/friend-request` |
| `DELETE /users/:id/follow` | `DELETE /users/:id/friend` (desfazer) ou `DELETE /users/:id/friend-request` (cancelar convite) |

O antigo follow era imediato; agora há um passo de aceite. Telas que assumiam
"clicou → já seguiu" precisam do estado intermediário `pending_outgoing`.

### 5.2 Perfil público — `GET /users/:id`

```diff
  "metrics": {
    "totalMomentsCreated": 12,
-   "totalFollowers": 340
+   "totalFriends": 87
  },
  "interactions": {
-   "isFollowing": true,
-   "isFollowedBy": false,
+   "areFriends": true,
+   "friendshipStatus": "friends",
    "isBlockedBy": false,
    "isBlocking": false
  }
```

`friendshipStatus` usa os mesmos valores de `relation` da seção 1 — é o que a tela de perfil
deve usar para escolher o botão.

### 5.3 Preferências de notificação — `PUT /account/notifications/preferences`

A chave `follow` virou `friends` e cobre **os dois** tipos de notificação de amizade
(convite recebido e convite aceito), com um único toggle.

```diff
  {
    "location": true,
-   "follow": true,
+   "friends": true,
    "like": true,
    "comment": true,
    "profileView": true
  }
```

O mesmo vale para a leitura das preferências. Contas existentes já foram migradas: o valor
que estava em `follow` foi copiado para `friends`.

### 5.4 Export de dados da conta — `GET /account/data`

```diff
- ?followersLimit=500&followersOffset=0&followingLimit=500&followingOffset=0
+ ?friendsLimit=500&friendsOffset=0
```

```diff
  "relationships": {
-   "followersUsernames": ["alice"],
-   "followingUsernames": ["bob"],
+   "friendsUsernames": ["alice", "bob"],
    "paging": {
-     "followers": { "limit": 500, "offset": 0, "hasMore": false },
-     "following": { "limit": 500, "offset": 0, "hasMore": false }
+     "friends": { "limit": 500, "offset": 0, "hasMore": false }
    }
  }
```

### 5.5 Visibilidade de moment e comentário

O valor `followers_only` virou **`friends_only`** no enum de visibilidade, tanto na
criação quanto na leitura de moments e comentários. Seletores de privacidade precisam
enviar e reconhecer o novo valor. O código de erro correspondente também mudou:
`FOLLOWERS_ONLY_RESTRICTED` → `FRIENDS_ONLY_RESTRICTED`.

### 5.6 Bloqueio agora desfaz a amizade

`POST /users/:id/block` passa a apagar a amizade **e** os convites pendentes entre o par,
nas duas direções. Depois de bloquear, `GET /users/:id/friendship-status` devolve `none`.

---

## 6. Fluxos de referência

### Botão de amizade na tela de perfil

```
GET /users/:id  →  interactions.friendshipStatus

none              → [Adicionar amigo]   → POST   /users/:id/friend-request
pending_outgoing  → [Convite enviado]   → DELETE /users/:id/friend-request
pending_incoming  → [Aceitar][Recusar]  → POST   /users/:id/friend-request/accept
                                        → POST   /users/:id/friend-request/decline
friends           → [Amigos]            → DELETE /users/:id/friend
declined          → [Adicionar amigo]   → POST   /users/:id/friend-request
```

Após qualquer ação, releia `GET /users/:id/friendship-status` (ou aplique o estado otimista
derivado da resposta) — atenção ao `outcome: "auto_accepted"`, que salta direto para
`friends`.

### Badge de convites pendentes

Use `pendingIncomingCount` de `GET /account/friend-requests`. Ele já vem correto mesmo
quando você pediu `direction=outgoing`, então uma chamada só resolve lista e badge.

### Aceite a partir do push

Notificação com `data.screen === "friend_requests"` → abrir a caixa de convites →
`GET /account/friend-requests?direction=incoming` → aceitar/recusar pelo `invites[].userId`.

---

## 7. Notas de comportamento

- **Ids são strings.** São snowflakes de 64 bits; nunca converta para `number` no
  JavaScript — perde precisão.
- **Datas são ISO 8601 em UTC** (`requestedAt`, `respondedAt`, `becameFriendsAt`).
- **`respondedAt` e `becameFriendsAt` são `null`** enquanto o convite está pendente.
- **Reconvite após recusa é permitido** e imediato: não há cooldown na versão atual.
- **Amizade é simétrica.** Não existe mais "seguidores" e "seguindo" separados — há um
  contador só, `totalFriends`.
- **Concorrência:** dois convites recíprocos simultâneos são resolvidos pelo backend numa
  única amizade (nunca em dois convites cruzados órfãos). O frontend não precisa de
  tratamento especial.

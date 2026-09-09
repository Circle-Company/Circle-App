# Visualizações de moment — guia de integração para o frontend

Duas coisas: **toda visualização de moment é registrada** (quem viu e quando) e o **dono** tem
uma tela de "quem viu", no formato da lista de visualizadores de stories do Instagram — foto,
username, quando viu e se **curtiu**.

> **Autenticação:** `Authorization: Bearer <accessToken>` obrigatório.
> Sem token válido: `401` com `{ success: false, error, code: "AUTHENTICATION_REQUIRED" }`.

---

## 1. Registrar a visualização

```http
POST /moments/:id/watch
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "watchTime": 12500 }
```

`watchTime` é o tempo assistido **em milissegundos**.

Cada chamada grava uma linha em `moment_views` com **quem viu, quando, por quanto tempo** e se
a visualização foi **completa** (≥ 80% da duração do vídeo). Não há deduplicação: ver duas vezes
gera dois registros, e a tela de visualizadores mostra a pessoa uma vez só, com `viewCount: 2`.

**O que muda em relação ao comportamento anterior:** a gravação agora é **aguardada** antes da
resposta. Um `200` significa que a view está persistida — antes era best-effort e podia se
perder em silêncio.

**A view do próprio dono não conta.** Rever o próprio moment não gera registro, não entra nos
totais e não aparece na lista de visualizadores.

**Quando chamar:** uma vez por sessão de exibição do moment, quando o usuário sai do moment ou
ele termina — com o tempo efetivamente assistido. Não chame a cada segundo de playback.

---

## 2. Quem viu o moment

### `GET /moments/:id/viewers`

```http
GET /moments/:id/viewers?limit=30&offset=0
Authorization: Bearer <accessToken>
```

**Somente o dono do moment.** Qualquer outro usuário recebe `403` — a lista é privada do autor e
não vaza nem para quem está nela.

| param | obrigatório | descrição |
|---|---|---|
| `limit` | não | Tamanho da página. Padrão **30**, teto **100** |
| `offset` | não | Deslocamento para paginar. Padrão **0** |

**Permissão:** `VIEW_MOMENT_STATS`.

### 200 OK

```json
{
  "success": true,
  "viewers": [
    {
      "userId": "1948572639485",
      "username": "ana.souza",
      "name": "Ana Souza",
      "profilePictureUrl": "https://cdn.circle.app/pictures/1948572639485.jpg",
      "lastViewedAt": "2026-09-03T18:24:11.000Z",
      "viewCount": 2,
      "hasCompleted": true,
      "hasLiked": true
    }
  ],
  "total": 37,
  "stats": {
    "totalViews": 52,
    "uniqueViewers": 37,
    "completedViews": 29,
    "averageWatchSeconds": 8.412,
    "lastViewedAt": "2026-09-03T18:24:11.000Z"
  }
}
```

**Cada visualizador**

| campo | tipo | uso na UI |
|---|---|---|
| `userId` | `string` | abrir o perfil |
| `username` | `string \| null` | texto principal da linha |
| `name` | `string \| null` | nome de exibição (opcional na linha) |
| `profilePictureUrl` | `string \| null` | avatar — **pode ser `null`**, use o padrão |
| `lastViewedAt` | ISO 8601 | "há 2 h"; é a visualização **mais recente** desta pessoa |
| `viewCount` | `number` | quantas vezes essa pessoa viu (≥ 1) |
| `hasCompleted` | `boolean` | assistiu o moment inteiro pelo menos uma vez |
| `hasLiked` | `boolean` | **coração na linha**, como no Instagram |

**Envelope**

| campo | descrição |
|---|---|
| `total` | visualizadores distintos — é o número que pagina |
| `stats.totalViews` | todas as views registradas, incluindo repetidas da mesma pessoa (nunca as do dono) |
| `stats.uniqueViewers` | pessoas distintas que viram (nunca o dono) |
| `stats.completedViews` | views marcadas como completas |
| `stats.averageWatchSeconds` | tempo médio assistido; **`null`** quando nenhuma view informou duração |
| `stats.lastViewedAt` | última visualização; `null` se nunca foi visto |

> O dono é excluído das duas leituras, então `total` e `stats.uniqueViewers` batem.
> Use `total` para paginar e `stats` para o cabeçalho de números.

**Ordem:** visualização mais recente primeiro — quem acabou de ver aparece no topo.

---

## 3. Erros

| HTTP | `code` | quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | id de moment ausente/inválido |
| `401` | `AUTHENTICATION_REQUIRED` | sem token ou token inválido |
| `403` | `FORBIDDEN` | quem pediu não é o dono do moment |
| `403` | `INSUFFICIENT_PERMISSION` | conta sem a permissão `VIEW_MOMENT_STATS` |
| `404` | `NOT_FOUND` | moment inexistente |
| `500` | `INTERNAL_ERROR` | falha inesperada |

---

## 4. Notas de comportamento

- **O dono nunca conta:** nem na lista, nem em `total`, nem em `stats`.
- **Sem deduplicação por janela:** duas visualizações da mesma pessoa contam duas vezes em
  `totalViews` e viram `viewCount: 2` numa linha só da lista.
- **`hasLiked` é o estado ATUAL do like**, não "curtiu enquanto via". Se a pessoa descurtir, a
  linha passa a `false` na próxima leitura.
- **Lista vazia é resposta normal** (`viewers: []`, `success: true`) — moment recém-publicado.
  Trate como estado vazio, não como erro.
- **Paginação por `offset`.** Como novas views chegam durante a navegação, a página seguinte pode
  repetir alguém que subiu para o topo; para uma lista curta como essa, recarregar do zero
  (pull-to-refresh) é mais previsível do que paginar muito fundo.
- **Perfil ausente não some da lista:** um visualizador cuja conta não foi encontrada vem com
  `username`/`name`/`profilePictureUrl` em `null`, mantendo o registro da visualização.

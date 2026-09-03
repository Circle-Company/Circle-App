# Populares na sua região — guia de integração para o frontend

Contrato da tela de descoberta **"populares na sua região"**: uma lista de pessoas próximas,
cada uma com **foto de perfil**, **username**, um **texto de popularidade** ("more than 10
friends") e o **botão de convite de amizade**. A lista é montada pela localização do usuário e
se atualiza sozinha conforme ele vai convidando.

> **Autenticação:** `Authorization: Bearer <accessToken>` obrigatório.
> Sem token válido: `401` com `{ success: false, error, code: "AUTHENTICATION_REQUIRED" }`.

Documentos relacionados: [`friendship-api-frontend.md`](./friendship-api-frontend.md) (o convite
em si) e [`proximity-radar-spec.md`](./proximity-radar-spec.md) (como a proximidade funciona).

---

## 1. Como a tela funciona

1. O app obtém a localização atual e chama `GET /radar/popular?latitude=..&longitude=..`.
2. O backend descobre quem está por perto (mesma base do radar da bússola), **descarta quem já
   é amigo ou já tem convite pendente com você**, ordena por popularidade e devolve os cards.
3. O usuário toca em **convidar** → `POST /users/:id/friend-request` (contrato completo no doc
   de amizade).
4. O app **recarrega a lista**. A pessoa convidada não volta — o backend já a filtra.

Ou seja: **a lista só contém gente que você ainda pode convidar**. Não existe estado
"convite enviado" nesta tela; quem foi convidado simplesmente sai dela.

> **Presença é obrigatória.** Só aparece quem tem presença registrada e recente
> (`user_hexes` + `user_coordinates` atualizados nos últimos 2 minutos). Contas semente (bots)
> são isentas do frescor. Isso é herdado do radar — ver a spec de proximidade.

---

## 2. Endpoint

### `GET /radar/popular`

```http
GET /radar/popular?latitude=-23.5505&longitude=-46.6333&limit=20
Authorization: Bearer <accessToken>
```

**Query params**

| param | obrigatório | tipo | descrição |
|---|---|---|---|
| `latitude` | sim | number | Latitude do usuário, entre -90 e 90 |
| `longitude` | sim | number | Longitude do usuário, entre -180 e 180 |
| `limit` | não | number | Máximo de pessoas retornadas. Padrão **20**, teto **50**. Valores fora da faixa são ajustados (nunca dão erro) |

**Permissão:** `VIEW_RADAR` (a mesma de `GET /radar/nearby`).

---

### 200 OK

```json
{
  "success": true,
  "origin": { "hexId": "89283082837ffff", "resolution": 9 },
  "scope": "res9",
  "people": [
    {
      "userId": "1948572639485",
      "username": "ana.souza",
      "name": "Ana Souza",
      "profilePictureUrl": "https://cdn.circle.app/pictures/1948572639485.jpg",
      "distanceMeters": 87,
      "friendsCountBucket": 10,
      "friendsLabel": "more than 10 friends"
    }
  ],
  "generatedAt": 1756900000000
}
```

**Campos de cada pessoa**

| campo | tipo | uso na UI |
|---|---|---|
| `userId` | `string` | id para o convite (`POST /users/:userId/friend-request`) e para abrir o perfil |
| `username` | `string \| null` | texto do card |
| `name` | `string \| null` | nome de exibição, se você quiser mostrar além do username |
| `profilePictureUrl` | `string \| null` | foto do card — **pode ser `null`**, use o avatar padrão |
| `distanceMeters` | `number` | distância real em metros; opcional na UI ("a 90 m de você") |
| `friendsCountBucket` | `number \| null` | piso da faixa de amigos, para você localizar o texto |
| `friendsLabel` | `string \| null` | texto pronto **em inglês**, ex.: `"more than 10 friends"` |

**Campos do envelope**

| campo | descrição |
|---|---|
| `origin` | célula H3 de busca usada como origem (`hexId`, `resolution`) — diagnóstico, a UI não precisa |
| `scope` | tier de busca que atendeu: `"res9"`, `"res9+neighbors"` ou `"res8+neighbors"` — diagnóstico |
| `generatedAt` | epoch em ms da geração da resposta |

---

## 3. O texto de popularidade

O backend **nunca devolve o número exato de amigos** de ninguém: ele muda a cada convite aceito
e revelaria a contagem exata de qualquer pessoa. O que sai é a **faixa**.

`friendsCountBucket` é o piso da faixa atingida. Pisos possíveis:

```
5 · 10 · 25 · 50 · 100 · 250 · 500 · 1000
```

A regra é **estritamente maior**: alguém com 11 amigos cai em `10`; com exatamente 10, cai em `5`.

| amigos reais | `friendsCountBucket` | `friendsLabel` |
|---|---|---|
| 0 – 5 | `null` | `null` |
| 6 – 10 | `5` | `"more than 5 friends"` |
| 11 – 25 | `10` | `"more than 10 friends"` |
| 1200 | `1000` | `"more than 1000 friends"` |

**Quando os dois vêm `null`, a pessoa não tem faixa** — a UI deve **omitir a linha de texto**
do card (não escrever "0 amigos", não mostrar `null`).

Para localizar, ignore `friendsLabel` e monte o texto a partir de `friendsCountBucket`:

```ts
const friendsText = person.friendsCountBucket
    ? t("popular.moreThanNFriends", { count: person.friendsCountBucket })
    : null
```

---

## 4. Ordenação

1. **Popularidade** (número de amigos) — decrescente.
2. **Empate → distância** — mais perto primeiro.

A ordem já vem pronta no array `people`; o app deve renderizar na ordem recebida, sem reordenar.

---

## 5. Erros

Todos seguem o envelope padrão `{ success: false, error, code }`.

| HTTP | `code` | quando | o que a UI faz |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `latitude`/`longitude` ausentes ou fora da faixa válida | pedir a localização de novo / checar a permissão de GPS |
| `401` | `AUTHENTICATION_REQUIRED` | sem token ou token inválido | fluxo de reautenticação |
| `403` | `INSUFFICIENT_PERMISSION` | usuário sem a permissão `VIEW_RADAR` | esconder a tela |
| `500` | `INTERNAL_ERROR` | falha inesperada | estado de erro com "tentar novamente" |

---

## 6. Estados vazios

`people: []` com `success: true` é uma **resposta normal**, não um erro. Acontece quando:

- não há mais ninguém por perto com presença recente; **ou**
- todo mundo por perto já é seu amigo ou já tem convite pendente com você.

A tela deve ter um estado vazio próprio ("ninguém novo por aqui agora") em vez de spinner
infinito ou mensagem de erro.

---

## 7. Fluxo de referência

```ts
// 1. Carregar a lista
const { latitude, longitude } = await getCurrentPosition()
const res = await api.get("/radar/popular", { params: { latitude, longitude, limit: 20 } })
setPeople(res.data.people)

// 2. Convidar
async function invite(userId: string) {
    // some do card na hora (otimista) — o backend já não vai devolvê-lo na próxima leitura
    setPeople((prev) => prev.filter((p) => p.userId !== userId))

    try {
        await api.post(`/users/${userId}/friend-request`)
    } catch (error) {
        // falhou: devolve o card e avisa
        reload()
        showError()
    }
}
```

**Recomendações**

- **Remoção otimista:** tire o card da lista assim que o convite for disparado; em caso de erro,
  recarregue. Isso evita esperar o round-trip para a lista "atualizar".
- **Recarregar a lista** ao voltar para a tela (foreground/pull-to-refresh) e quando a
  localização mudar de forma relevante. Não há push/websocket para esta tela.
- **Não faça polling agressivo:** a presença tem janela de 2 minutos; recarregar a cada poucos
  minutos (ou por ação do usuário) é suficiente.
- **`limit` maior não garante lista maior:** o backend varre uma vizinhança fixa; se houver pouca
  gente por perto, a lista vem curta mesmo com `limit=50`.

---

## 8. Notas de comportamento

- **Bloqueio:** quem você bloqueou (ou quem te bloqueou) nunca aparece, nos dois sentidos.
- **Contas removidas ou banidas** nunca aparecem.
- **Você nunca aparece na sua própria lista.**
- **Sem paginação.** A lista é curta e volátil por natureza; não há cursor nem `offset`.
- **Convite recusado:** se alguém recusou seu convite, a relação volta a `none` e a pessoa
  **pode voltar a aparecer** na lista (reconvite é permitido — ver o doc de amizade).
- **`GET /radar/nearby` continua existindo** e é outra tela (a bússola, com `layers` e
  `bearingDegrees`). Esta lista não substitui aquela.

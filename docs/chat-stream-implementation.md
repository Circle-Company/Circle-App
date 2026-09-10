# Chat — arquitetura e plano (Stream Chat, client puro)

A aba de chat do Circle App: UI própria sobre o client de baixo nível do Stream.

**Status:** camada visual construída com mock; integração com o Stream pendente do endpoint de
token no backend (§4).

> **Decisão que define o resto do documento.** A UI é **toda nossa**. O pacote
> `stream-chat-expo` (componentes prontos: `ChannelList`, `Channel`, `MessageList`,
> `MessageComposer`, `OverlayProvider`, sistema de tema) **não entra no projeto**. Usa-se só o
> `stream-chat`, o client JavaScript puro.
>
> Uma versão anterior deste documento planejava o caminho com o SDK de UI. Ele foi descartado:
> o desenho do grid já descartava a célula padrão do `ChannelList`, e não há forma documentada
> de substituí-la — então o SDK de UI entraria para ser quase todo sobrescrito, trazendo junto
> dependências nativas e um `prebuild`.

---

## 1. Objetivo

Uma quarta aba (`chat`) com duas telas:

1. **Lista de conversas** — grid de 3 por linha: avatar grande, nome embaixo, e um balão de
   fala **ocasional** sobrepondo o avatar quando aquela pessoa falou por último e não foi
   respondida. A contagem de não lidas vive dentro do balão, como um `+X` em negrito.
2. **Conversa** — bolhas estilo iMessage, sem tab bar, com campo de escrita nativo no rodapé.

Fora do escopo: push do chat, offline, moderação, vídeo.

---

## 2. O que já está construído

Tudo em `src/features/chat/` e `app/(tabs)/chat/`. Nenhum destes arquivos importa o
`stream-chat` — a UI é independente do transporte, e é isso que permitiu construí-la e vê-la
funcionando antes de o backend existir.

| Arquivo | O que é |
|---|---|
| `chat.types.ts` | `ChatPreview` e `ChatBubbleMessage` — os modelos de view |
| `chat.avatar.tsx` | Avatar circular com fallback de inicial e indicador de online |
| `chat.speech.bubble.tsx` | O balão em overlay do grid, com rabinho e `+X` |
| `chat.conversation.cell.tsx` | A célula do grid; exporta as constantes de geometria |
| `chat.message.bubble.tsx` | A bolha da conversa (iMessage) |
| `chat.grouping.ts` | Encadeamento das bolhas por autor e janela de tempo — lógica pura, com testes |
| `chat.composer.tsx` | Campo de escrita com o `TextInput` nativo do `@expo/ui` |
| `chat.client.ts` | O client do Stream: conectar, desconectar, single-flight |
| `chat.mock.ts` | Dados falsos, só sob `__DEV__` |
| `app/(tabs)/chat/{_layout,index,[cid]}.tsx` | As rotas |

Decisões de layout que não são cosméticas:

- **Altura de célula fixa.** Numa `FlatList` com `numColumns`, células de alturas diferentes
  na mesma linha desalinham a grade inteira. Por isso o balão é overlay (não ocupa fluxo) e
  há uma folga reservada no topo (`BUBBLE_OVERHANG`) dimensionada para o pior caso.
- **O `+X` fica fora do `Text` da mensagem.** Concatenado, ele seria a primeira coisa engolida
  pelas reticências numa mensagem longa — o dado mais importante do balão sumindo justamente
  quando há mais a ler.
- **Sem tab bar na conversa.** A rota entra na regra de `hideTabBar` do layout das abas
  (`app/(tabs)/_layout.tsx`), o mesmo mecanismo que `/you/[id]` e `/moment/[id]` já usavam.

### 2.1 Por que não o `NativeTabs.BottomAccessory`

Ele existe (SDK 55+) e parece a resposta para "input ancorado na barra de baixo", mas não é:
renderiza **acima** da tab bar em vez de substituí-la, é **iOS 26+** apenas (o app tem
`deploymentTarget` 16.4), e a documentação avisa que **duas instâncias renderizam
simultaneamente** — para um campo de texto isso significa dois inputs com estado divergente.

O campo fica na tela, colado no teclado pelo `KeyboardStickyView` do
`react-native-keyboard-controller`, que já estava instalado com o `KeyboardProvider` na raiz.

---

## 3. Dependências ✅ FEITO

```bash
npx expo install stream-chat     # client de baixo nível, sem UI
```

`stream-chat` (9.52.1) é JavaScript puro: **sem código nativo, sem `prebuild`**. Declara
condição de export `react-native`, e o Metro deste projeto já resolve por ela —
`resolverMainFields` com `react-native`/`browser`, `mjs`/`cjs` em `sourceExts` e
`unstable_enablePackageExports` já estavam configurados.

**Verificado, não presumido:** `npx expo export --platform ios` empacota sem erro, e o bundle
Hermes contém os literais do pacote (`stream-io-api.com`, `linkifyjs`, mensagens de erro do
client).

O campo de escrita usa o `TextInput` universal do `@expo/ui`, que já estava no projeto e já é
usado em `profile.dropdown.menu.tsx` e `profile.report.modal.tsx`. Nenhuma dependência nativa
nova entrou por causa do chat.

---

## 4. Endpoint de token no backend — BLOQUEANTE

**É trabalho no repositório do backend, não neste.** Sem ele nada conecta.

O *secret* do Stream nunca pode ir para o bundle. Só o servidor o conhece; o cliente recebe um
token de usuário assinado.

```
GET /chat/token
Authorization: Bearer <JWT da sessão do Circle>

200 {
  "apiKey": "<API key pública do app no Stream>",
  "token":  "<token de usuário assinado com o secret>",
  "userId": "<id do usuário no Stream — o mesmo id do Circle>"
}
```

O endpoint autentica pelo JWT que o app já emite, faz *upsert* do usuário no Stream (id, nome,
foto) e devolve o token. Manter o `userId` do Stream **igual** ao do Circle evita uma tabela de
correspondência e preserva a identidade única da sessão.

Do lado do app, `connectChatUser` aceita `token: string | TokenProvider`. **Prefira a
função:** o token expira, e o client a chama de novo sozinho; com uma string fixa a sessão do
chat morre e só volta com um reinício do app.

---

## 5. O que falta

### 5.1 Provider de chat

Um `src/contexts/chat.tsx` que:

- lê a sessão viva (`src/session/`);
- busca `/chat/token` via React Query;
- chama `connectChatUser({ apiKey, userId, token })`;
- entrega o client e o estado de conexão por contexto.

Entra na árvore **dentro do `AuthProvider`** (sem sessão não há token) e alto o suficiente para
a conexão não subir e descer a cada navegação.

> Sem SDK de UI não existe `useCreateChatClient` — aquele hook, que trata o strict mode, vive
> nos pacotes de UI. O ciclo de conexão é nosso, e `chat.client.ts` já o cobre: single-flight
> da conexão, guarda por `userId`, e desconexão antes de trocar de usuário.

### 5.2 Desconectar no logout

`disconnectChatUser()` existe e **ainda não está ligado** ao `signOut` de
`src/contexts/auth.tsx`. Sem isso o WebSocket do chat sobrevive ao logout: a sessão do app
morre e a do Stream continua viva, entregando mensagens de uma conta que já saiu do aparelho.

### 5.3 Adaptador `Channel → ChatPreview`

A única peça que vai conhecer os dois lados. Precisa resolver:

| Campo | Origem |
|---|---|
| `cid` | `channel.cid` |
| `lastMessage` | última mensagem do estado do canal |
| `unread` | contagem de não lidas do canal |
| `awaitingReply` | a última mensagem **não** é do usuário logado |
| `name` / `profilePicture` | o **outro** membro da DM |

O último é o ponto de atenção: sem os hooks do SDK de UI
(`useChannelPreviewDisplayName`, `ChannelAvatar`), isso passa a ser cálculo nosso sobre
`channel.state.members`, filtrando o próprio `userId`.

### 5.4 Trocar os mocks pela query de canais

Em cada tela a costura está isolada numa linha só:

```tsx
// app/(tabs)/chat/index.tsx
const previews: ChatPreview[] = __DEV__ ? MOCK_CONVERSATIONS : []
```

Vira a lista de canais vinda do client, mapeada pelo adaptador. O `__DEV__` garante que nenhum
usuário falso chegue a um build publicado.

### 5.5 Envio de mensagem

`ChatComposer` já chama `onSend(text)`; hoje o handler em `[cid].tsx` só registra no console —
de propósito, para não parecer que funciona e engolir a mensagem. Passa a chamar
`channel.sendMessage`.

### 5.6 Paginação e tempo real

Carregar mais canais ao chegar no fim do grid, mais mensagens ao subir na conversa, e assinar
os eventos do WebSocket para o estado acompanhar sem refresh manual.

---

## 6. Riscos em aberto

| # | Risco | Situação |
|---|---|---|
| 1 | Nome e foto do outro membro na DM | Cálculo nosso sobre `channel.state.members` (§5.3) |
| 2 | Logout do Circle sem desconectar o Stream | `disconnectChatUser()` pronto, falta ligar (§5.2) |
| 3 | Ciclo de conexão sob strict mode do React 19 | Mitigado em `chat.client.ts`; validar em runtime |
| 4 | Proporções da célula do grid | Não validadas em tela: ~120pt por célula num iPhone |
| 5 | `Host matchContents` com input multilinha crescendo dentro de uma `Row` | Não validado em tela |

Nada da UI foi validado rodando o app — a verificação até aqui foi tipo, lint, testes e
bundle.

---

## 7. Fontes

Páginas da documentação oficial efetivamente lidas. O que não está aqui, não foi verificado.

- [React Native Introduction](https://getstream.io/chat/docs/react-native.md) — `stream-chat` é o client de baixo nível
- [Initialization & Users](https://getstream.io/chat/docs/react-native/init-and-users.md) — `getInstance`, `connectUser`
- [Installation (SDK de UI)](https://getstream.io/chat/docs/sdk/react-native/basics/installation.md) — usado para decidir **não** adotá-lo
- [Custom ChannelList](https://getstream.io/chat/docs/sdk/react-native/guides/customize-channel-list.md) — só `additionalFlatListProps`; nenhuma prop documentada para trocar a célula
- [Custom Components](https://getstream.io/chat/docs/sdk/react-native/customization/custom-components.md) — `WithComponents`/`overrides`, sem nada específico do channel list
- [ChannelsContext](https://getstream.io/chat/docs/sdk/react-native/contexts/channels-context.md)
- [useChannelPreviewData](https://getstream.io/chat/docs/sdk/react-native/hooks/channel-preview/use-channel-preview-data.md)
- [Índice do SDK — React Native v9](https://getstream.io/cli/docs/chat-sdk-react-native.md)
- Skill `expo-router`, `references/tabs.md` — `hidden`, `NativeTabs.BottomAccessory`
- Skill `expo-ui`, `references/universal.md` — `TextInput` + `useNativeState`

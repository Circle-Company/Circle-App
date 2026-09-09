# Analytics: tudo o que o app rastreia

Inventário completo do que sai do aparelho para o Mixpanel. Este documento é a
fonte de verdade do que existe hoje; o catálogo em código
(`AnalyticsEvent`, em [`src/lib/trackEvent.ts`](../src/lib/trackEvent.ts)) é o que
o compilador garante. Os dois devem andar juntos — ao mexer num, mexa no outro.

**São 36 eventos.**

---

## 1. Como o tracking funciona

| | |
|---|---|
| SDK | `mixpanel-react-native` |
| Token | `MIXPANEL_KEY`, lido do `.env` via `@env` → `src/config/index.tsx` |
| Inicialização | Preguiçosa, no primeiro evento (`getMixpanel()`) |
| Eventos automáticos do SDK | **Desligados** (`trackAutomaticEvents = false`) |
| Modo nativo | Desligado (`useNative = false`) |

Se `MIXPANEL_KEY` estiver ausente ou inválida, o SDK não inicializa e todo
`track` vira no-op silencioso — o app não quebra, apenas não rastreia. Como o
`react-native-dotenv` inlina em build time, trocar o token exige
`npx expo start --clear`.

### Sem gate de consentimento

Não há gate de consentimento no código. A base legal é o aceite dos termos de
uso, que é pré-condição para a conta existir (o cadastro envia
`terms-accepted: true`). Decisão de produto/jurídico registrada no comentário de
`getMixpanel()` — leia o histórico daquele arquivo antes de reintroduzir um gate.

### Identidade

`identify()` usa a **chave primária do usuário no backend** (`user.id`), lida do
MMKV. Nunca o username: username é texto escolhido pela pessoa e, se mudasse, o
perfil se partiria em dois.

- Sem `id` não há `identify()` — evento sai anônimo, atrelado só ao device id.
  Perfil para anônimo polui a base e não dá para desfazer.
- `identify()` roda a cada evento, então cobre login **e** toda reabertura do app.
- `logout` chama `reset()` logo após o evento. Sem isso o próximo usuário do
  aparelho seria fundido na sessão do anterior.
- O username vai para o **perfil** (`people.set({ username })`), não como
  propriedade de cada evento.

### Propriedades em todo evento (super properties)

Registradas no init e reanexadas após o `reset()` do logout:

| propriedade | origem |
|---|---|
| `platform` | `Platform.OS` — `"ios"` ou `"android"` |
| `app_version` | `config.APP_VERSION` |

---

## 2. Sessão e cadastro

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `app_open` | Montagem do `AuthProvider` e toda vez que o `AppState` vira `active` | — | `src/contexts/auth.tsx` |
| `app_close` | `AppState` vira `inactive` ou `background`, e no unmount do provider | — | `src/contexts/auth.tsx` |
| `login` | Sessão criada com sucesso, tanto no Apple Sign-In quanto no login por usuário/senha | — | `src/contexts/auth.tsx` |
| `logout` | Logout confirmado. Dispara **antes** do `reset()` | — | `src/contexts/auth.tsx` |
| `sign_up_completed` | Cadastro concluído, **depois** de o usuário existir no backend | `sign_up_method` (`"apple"`) | `src/contexts/auth.tsx` |
| `profile_picture_onboarding_completed` | Foto enviada na etapa que segue o cadastro | — | `app/onboarding/profile-picture.tsx` |
| `profile_picture_onboarding_skipped` | "Pular por agora" na mesma etapa | `had_selected_photo` (booleano) | `app/onboarding/profile-picture.tsx` |

A etapa de foto aparece uma vez, na primeira entrada na parte logada depois do
cadastro, e só para quem acabou de criar a conta (a marca
`profilePictureOnboardingPending` nunca esteve ligada em conta antiga). Como a
tela sempre termina em um dos dois eventos, a soma deles é o denominador
prático para a taxa de pulo — o que escapa é só quem mata o app na tela.

`had_selected_photo: true` marca quem escolheu uma foto e ainda assim pulou.
Separa desistência no meio do caminho de quem nem abriu o seletor.

---

## 3. Navegação

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `screen_viewed` | Toda mudança de rota do Expo Router | `screen_name`, `previous_screen_name` (ausente na primeira tela) | `src/lib/hooks/useScreenTracking.ts` |

Cobre o app inteiro a partir do layout raiz — inclusive telas que ninguém
instrumentou. Dois cuidados embutidos:

- **Cardinalidade.** A rota é normalizada antes de virar propriedade:
  `/profile/1948572639485` vira `/profile/[id]`. Segmentos numéricos de 6+
  dígitos e UUIDs viram `[id]`. Sem isso cada perfil visitado seria um valor
  distinto de `screen_name` e a propriedade não serviria para agrupar.
- **Repetição.** O Expo Router reemite o mesmo pathname em re-render; uma guarda
  ignora o valor repetido, então tela parada não gera evento.

---

## 4. Feed e engajamento

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `moment_viewed` | Um moment fica visível no feed | `moment_id`, `feed_position` (número) | `src/features/moments/index.tsx` |

O `viewabilityConfig` do feed exige **3 s** de permanência (`minimumViewTime`) e
10% de área visível, então o evento significa "assistiu", não "passou por".
Deduplicado por `moment_id` dentro da sessão de feed: voltar o carrossel para um
moment já visto não reemite.

---

## 5. Criação e publicação de moment

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `moment_recording_started` | Gravação começa | — | `modules/camera/pages/camera.tsx` |
| `moment_recording_stopped` | Gravação para pelo botão | — | `modules/camera/pages/camera.tsx` |
| `moment_publish_started` | Início do pipeline de upload | `duration_seconds` | `modules/camera/pages/camera.tsx` |
| `moment_published` | Publicação confirmada | `duration_seconds`, `completed_in_background` (só no caso de timeout) | `modules/camera/pages/camera.tsx` |
| `moment_publish_failed` | Falha real do pipeline | `http_status` (quando houver) | `modules/camera/pages/camera.tsx` |
| `moment_publish_canceled` | Publicação não aconteceu por escolha ou guarda | `reason`: `"user_aborted"` ou `"too_short"`; `duration_seconds` no `too_short` | `modules/camera/pages/camera.tsx` |

Duas convenções que valem saber ao ler os números:

- **`too_short`** é a guarda de toque acidental: clipe abaixo de
  `MIN_PUBLISHABLE_SEC` é descartado antes de virar moment. Aparece como
  cancelamento, não como falha.
- **Timeout de polling** conta como `moment_published` com
  `completed_in_background: true`, não como falha — o servidor segue processando
  e publica. Do ponto de vista do usuário, o moment saiu.

---

## 6. Ações sobre moments

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `moment_liked` | Curtida confirmada | `moment_id` | `src/queries/moment.like.ts` |
| `moment_unliked` | Descurtida confirmada | `moment_id` | `src/queries/moment.like.ts` |
| `moment_comment_sent` | Comentário enviado | `moment_id` | `src/queries/moment.comment.ts` |
| `moment_reported` | Denúncia de moment enviada | `moment_id`, `reason` | `src/queries/moment.report.ts` |

---

## 7. Social

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `user_followed` | Follow confirmado | `target_user_id` | `src/queries/user.follow.ts` |
| `user_unfollowed` | Unfollow confirmado | `target_user_id` | `src/queries/user.follow.ts` |
| `user_blocked` | Bloqueio confirmado | `target_user_id` | `src/queries/user.block.ts` |
| `user_unblocked` | Desbloqueio confirmado | `target_user_id` | `src/queries/user.block.ts` |
| `user_reported` | Denúncia de usuário enviada | `target_user_id`, `reason` | `src/queries/user.report.ts` |
| `friend_request_sent` | Convite de amizade enviado | `target_user_id`, `auto_accepted` (booleano) | `src/queries/friendship.ts` |
| `friend_request_canceled` | Convite enviado foi cancelado | `target_user_id` | `src/queries/friendship.ts` |
| `friend_request_accepted` | Convite recebido foi aceito | `target_user_id` | `src/queries/friendship.ts` |
| `friend_request_declined` | Convite recebido foi recusado | `target_user_id` | `src/queries/friendship.ts` |
| `friend_removed` | Amizade desfeita | `target_user_id` | `src/queries/friendship.ts` |

`auto_accepted: true` marca o caso recíproco — o alvo já tinha convidado você e
a relação saltou direto para amigos, sem passar por "convite enviado".

> **`target_user_id` é o id de outra pessoa.** É o padrão em analytics de rede
> social e é o que permite analisar o grafo, mas amplia o que sai do aparelho.
> Registrado aqui para ficar explícito, não escondido numa tabela.

---

## 8. Value Moment

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `like_notification_received` | Notificação de curtida chega para quem publicou | `is_foreground` (booleano) | `src/contexts/push.notification.tsx` |

É o evento de valor do produto: a reação voltando para quem postou. Dispara por
duas vias, que o `is_foreground` distingue:

- `true` — app aberto, via `addNotificationReceivedListener`.
- `false` — app em background ou fechado, via toque no push
  (`addNotificationResponseReceivedListener`).

**Consequência para a análise:** com o app em background, só conta se o usuário
**tocar** no push. Notificação recebida e ignorada não gera evento. O número é,
portanto, um piso — não a contagem real de curtidas notificadas.

---

## 9. Conta e preferências

| evento | quando dispara | propriedades | onde |
|---|---|---|---|
| `account_description_updated` | Descrição do perfil salva | — | `src/queries/account.ts` |
| `account_name_updated` | Nome salvo | — | `src/queries/account.ts` |
| `notifications_marked_read` | Todas as notificações marcadas como lidas | — | `src/queries/account.ts` |
| `app_language_changed` | Idioma do app trocado | `app_language` | `src/queries/preferences.language.ts` |
| `haptics_enabled` | Vibração ligada | — | `src/queries/preferences.haptic.ts` |
| `haptics_disabled` | Vibração desligada | — | `src/queries/preferences.haptic.ts` |

---

## 10. O que **não** é rastreado

Explícito de propósito, para ninguém supor cobertura que não existe.

**Deliberadamente fora:**

- `useUpdateAccCoordsMutation` e `useSetPushTokenMutation` — sincronização
  automática em background, não ação de usuário. Rastrear viraria ruído de
  volume alto sem significado.
- Conteúdo de qualquer tipo: texto de comentário, descrição, vídeo, foto.
  Só ids e metadados saem do aparelho.
- Coordenadas de localização. Nenhum evento carrega latitude/longitude.

**Lacunas conhecidas** (não é decisão, é o que falta):

- `login` não distingue Apple de usuário/senha. Não há propriedade
  `login_method`.
- `sign_up_completed` existe só no fluxo Apple (`appleSignUp`). Se houver
  cadastro por usuário/senha, ele não é rastreado.
- Eventos de ação disparam no **sucesso** (`onSuccess` da mutation). Tentativa
  que falha na rede não gera evento — a única exceção é a publicação de moment,
  que tem `moment_publish_failed`.
- Não há evento de abertura de tela de comentários, só de envio.
- Permissões concedidas/negadas (câmera, microfone, localização, notificações)
  não são rastreadas.

---

## 11. Como adicionar um evento

1. Adicione o nome à união `AnalyticsEvent` em `src/lib/trackEvent.ts`. O
   compilador recusa qualquer nome fora dela — é o que impede nome montado em
   runtime, que produz milhares de eventos únicos e irreversíveis.
2. Chame `trackUserAction("nome_do_evento", { ...props })` no ponto da ação. A
   identidade é resolvida sozinha, lendo do MMKV.
3. Atualize a tabela correspondente **neste documento**.
4. Documente o evento no Lexicon do Mixpanel.

Regras que valem para toda propriedade nova:

- `snake_case` em nomes de evento e de propriedade. O Mixpanel diferencia
  maiúsculas de minúsculas.
- Número vai como número. String numérica não agrega.
- Omita a propriedade quando não houver valor. Nunca mande `null` ou `""`.
- Nada de prefixo `$` ou `mp_` em propriedade custom.
- Antes de criar, procure um evento existente que já responda a pergunta.

---

## 12. Pendências

Estão no painel do Mixpanel, fora do código:

- [ ] **Simplified ID Merge** verificado em Project Settings → Identity
      Management. **Irreversível depois que existir dado** no projeto.
- [ ] Projeto de **dev separado** do de produção. Hoje o app aponta para
      produção, então evento de teste vira dado real.
- [ ] **Lexicon** preenchido com a descrição de cada um dos 36 eventos.
- [ ] **Data Standards** exigindo `snake_case` e **Event Approval** ligados.
- [ ] Estimativa de custo. `screen_viewed` e `moment_viewed` serão de longe os
      mais volumosos, e o Mixpanel cobra por evento.

> Dropar evento no Mixpanel é irreversível. Esconda primeiro, espere um
> trimestre, só então drope.

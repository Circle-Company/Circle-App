# Módulo `camera` — arquitetura e integração global

Guia de referência do layout físico do módulo, do que cada arquivo é responsável,
e de como a máquina de estado interna se conecta ao provider global
(`CameraContext`) que outras partes do app consomem.

Foco em quem precisa alterar o módulo — se está só integrando, ler direto a
seção "8. Consumers externos".

---

## 1. Estrutura de pastas

```
modules/camera/
├── ARCHITECTURE.md                        ← este documento
├── INSTANT_PUBLISH_UX.md                  ← design da janela cancellable + auto-commit
├── SHARE_MOMENT_SAS_MIGRATION.md          ← plano de migração do shareMoment para SAS
│
├── index.tsx                              ← barrel público do módulo
├── routes.ts                              ← tipos das rotas do Expo Router
├── constants.ts                           ← magic numbers compartilhados
├── context.tsx                            ← CameraContext + Provider (o "hub global")
│
├── pages/
│   └── camera.tsx                         ← única tela do módulo (rota /(tabs)/create)
│
├── components/                            ← UI cru; nenhum toca a rede
│   ├── AnimatedCheck.tsx                  ← check com stroke draw-in (usado no success)
│   ├── CameraBottomBar.tsx                ← RotateButton | CaptureButton | FlashButton
│   ├── CameraPermissionNotProvidedCard.tsx← full-screen fallback quando falta câmera
│   ├── CameraStatusLine.tsx               ← hint dinâmico embaixo do preview
│   ├── CameraVideoSlider.tsx              ← (legacy) barra de progresso da gravação
│   ├── CancelShareCard.tsx                ← overlay full-screen do share lifecycle
│   ├── CaptureButton.tsx                  ← círculo central, gestos + gravação
│   ├── FlashIndicator.tsx                 ← chip "flash on" no top-left do preview
│   ├── FlipCameraHint.tsx                 ← chip "arraste para virar" (hint contextual)
│   ├── HandsFreeHint.tsx                  ← chip transient com mensagem parametrizada
│   ├── HandsFreeToggle.tsx                ← pill top-right que liga/desliga o modo
│   ├── MicPermissionNotProvidedCard.tsx   ← overlay quando o mic não foi liberado
│   ├── RecordingProgressHeaderTitle.tsx   ← título "Recording Xs" com fill roxo animado
│   ├── ZoomIndicator.tsx                  ← chip "1.5x" top-center do preview
│   ├── flashButton.tsx                    ← toggle torch no bottom bar (glass)
│   └── rotateButton.tsx                   ← flip front/back no bottom bar (glass)
│
└── hooks/                                 ← lógica stateful reutilizável
    ├── shareMoment.ts                     ← função que sobe o vídeo pro backend
    ├── useIsForeground.ts                 ← app está em foreground (RN AppState)
    ├── usePendingPublish.ts               ← fila de 1 clipe pendente + timer de cancel
    ├── usePinchZoomGesture.ts             ← Gesture.Pinch → zoom shared value
    ├── usePreferredCameraDevice.ts        ← lente preferida (persistida?)
    ├── useRecordingGlow.ts                ← shadow roxo animado durante recording
    ├── useRecordingInterval.ts            ← Date.now-based tick de recordingTime
    ├── useRequestCameraPermissions.ts     ← pede câmera + mic no mount da tela
    └── useZoomDisplay.ts                  ← bridge zoom (shared value) → string "1.5x"
```

### Convenções

| Pasta | Regra |
|---|---|
| `components/` | Componentes puros de UI. **Não** falam com rede, **não** têm estado global. Podem ter estado local (Reanimated, useState) e ler contexto para reagir. |
| `hooks/` | Lógica reutilizável. Hooks começam com `use*`. `shareMoment.ts` foge do padrão porque é função pura async, mas mora aqui porque é o "hook" do lado da rede. |
| `pages/` | Uma entry por rota do Expo Router. Só orquestração — a lógica fica nos hooks. |
| `context.tsx` | **Um só** provider por módulo. Se precisar de outro, pare e reconsidere. |
| `constants.ts` | Toda constante compartilhada entre 2+ arquivos vai aqui. Constantes locais ficam no próprio arquivo. |

---

## 2. `CameraContext` — o hub global

`context.tsx` exporta `CameraProvider` e o hook `useCameraContext()`. O provider é
montado na árvore de contextos do app (em `app/_layout.tsx`) — significa que
**qualquer componente do app** pode ler o estado da câmera, mesmo fora do módulo.

### Onde está montado

```
app/_layout.tsx
└── Redirect → Auth → QueryProvider → Toast → Tutorial → Language →
    Network → Geolocation →
    ┌─────────────────────────────────┐
    │  CameraProvider                 │ ← mount global
    │    ↳ Account → Profile → Feed → │
    │       BottomSheet → NewMoment → │
    │       PushNotification          │
    └─────────────────────────────────┘
```

`tabs/_layout.tsx` (a barra inferior nativa) já usa `useCameraContext().tabHide`
para esconder o tab bar durante gravação. Isso mostra que o contexto **não é** só
do módulo — é o namespace `camera:*` do app inteiro.

### Superfície pública (`CameraContextType`)

Agrupada por finalidade. Fields do provider (setters imperativos + estado).

```ts
// ─── UI / visibility ──────────────────────────────────────────
tabHide, setTabHide

// ─── Recording lifecycle ──────────────────────────────────────
isRecording, setIsRecording                  // driven by CaptureButton
recordingTime, setRecordingTime              // seconds since press
video, setVideo                              // path/duration/mimeType do último clipe

// ─── Camera lifecycle / activity ──────────────────────────────
isCameraInitialized, setIsCameraInitialized  // AVCaptureSession pronta
isActive, setIsActive                        // vision-camera prop
preferredDevice, setPreferredDevice          // lente preferida (multi-cam)
microphonePermission                         // ReturnType<useMicrophonePermission>

// ─── Camera controls ──────────────────────────────────────────
zoom, setZoom                                // React state (o worklet usa shared value paralela)
isPressingButton, setIsPressingButton        // (unused JS side; live no CaptureButton)
rotateAnimation, setRotateAnimation          // (unused; vestige)
cameraPosition, setCameraPosition            // "back" | "front"
torch, setTorch                              // "off" | "on"

// ─── Share lifecycle (novo) ───────────────────────────────────
isSharing, setIsSharing                      // true durante todo o card do CancelShareCard
isHandsFree, setIsHandsFree                  // modo tap-to-toggle

// ─── Metadata (opcional) ──────────────────────────────────────
description, setDescription                  // legenda do moment (não usado hoje)
authToken, setAuthToken                      // não usado; JWT vem do PersistedContext

// ─── Legacy upload API (vestigial) ────────────────────────────
isUploading, uploadError, lastUploadResponse
clearUploadError()
upload(): Promise<UploadResult>              // chamava a share.tsx (deletada)

// ─── Actions ──────────────────────────────────────────────────
reset()                                      // volta ao estado inicial após publicar
```

### Fields **legacy** que ainda existem

O bloco `isUploading` / `uploadError` / `lastUploadResponse` / `upload()` era
consumido pela `share.tsx` (tela intermediária de preview + share), que foi
**deletada** na migração para o fluxo instant-publish (ver
`INSTANT_PUBLISH_UX.md`). Ninguém do módulo camera chama isso hoje:

- `camera.tsx` chama **`shareMoment()` direto**, não via `context.upload()`.
- `isSharing` (novo) é a flag que os componentes olham durante o share.

Manter os fields legacy no `CameraContextType` **não quebra nada** (só ocupa
espaço), mas está listado como **candidato a remoção** — ver seção 9.

---

## 3. Ciclo de vida completo (recording → share → published)

Fluxograma consolidado dos handoffs entre módulo, hooks e contexto.

```
    Usuário toca CaptureButton
              │
              ▼
    ┌──────────────────────────┐
    │ CaptureButton.tsx        │
    │  useRef isRecording=true │
    │  startRecording()        │
    └──────────┬───────────────┘
               │  props.onRecordingStart()
               ▼
    ┌──────────────────────────┐
    │ camera.tsx               │
    │  setIsRecording(true)    │──── setter do context
    └──────────┬───────────────┘
               │  isRecording=true na context
               ▼
    ┌──────────────────────────┐
    │ useRecordingInterval     │  Date.now() tick, escreve
    │  (chamado no camera.tsx) │  setRecordingTime(elapsed) a cada 100ms
    └──────────────────────────┘
               │
               │  (elapsed segundos depois — user solta)
               ▼
    ┌──────────────────────────┐
    │ CaptureButton.tsx        │
    │  stopRecording()         │
    │  → onMediaCaptured(path) │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ camera.tsx               │
    │  if duration<5s:         │  → setHoldHintTrigger++  (hint chip)
    │    return                │
    │  schedulePending(item)   │  ↴ vai pro hook
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ usePendingPublish        │  timer de 5s + estado pending
    │  setPending(item)        │
    │  setTimeout(commit,5000) │
    └──────────┬───────────────┘
               │  (5s depois, ou cancelPending() se usuário toca Cancel)
               ▼
    ┌──────────────────────────┐
    │ camera.tsx               │
    │  commitPending(item)     │
    │  setShareStatus("sharing")│─── bridged automaticamente
    └──────────┬───────────────┘        │
               │                        │  useEffect
               │                        ▼
               │           ┌────────────────────────┐
               │           │ CameraContext          │
               │           │  setIsSharing(true)    │
               │           └────────┬───────────────┘
               │                    │  isSharing=true
               │                    ▼
               │        outros componentes reagem
               │        (ver seção 4)
               │
               ▼
    ┌──────────────────────────┐
    │ hooks/shareMoment.ts     │
    │  (compressão + POST)      │
    │  ou fluxo SAS quando      │  ← ver SHARE_MOMENT_SAS_MIGRATION.md
    │  a migração acontecer     │
    └──────────┬───────────────┘
               │
               │  sucesso
               ▼
    ┌──────────────────────────┐
    │ camera.tsx               │
    │  setShareStatus("success")│
    │  setCameraPosition("back")│
    │  setTimeout(clear,1400ms) │
    └──────────┬───────────────┘
               │  useEffect
               ▼
    ┌──────────────────────────┐
    │ CameraContext            │
    │  setIsSharing(false)     │
    └──────────────────────────┘
```

---

## 4. Consumers do `isSharing` — o que trava e por quê

Cada componente que reage à flag `isSharing` do context durante o ciclo de
share:

| Componente | Comportamento |
|---|---|
| `RotateButton` | `onPress` faz early-return; opacity animada 0.4 (via `withTiming`) |
| `FlashButton` | `disabled = isFront \|\| isSharing`; opacity 0.4 no wrapper; **também salva torch prévio e força off** durante o share (economia de bateria) — restaura ao sair |
| `CaptureButton` | Prop `enabled` do parent inclui `!isSharingActive`; gestos ignoram touches; visual dim |
| `HandsFreeToggle` | Comportamento próprio via `isRecording`, mas o toggle vive num ciclo isolado — não bloqueado por `isSharing` |
| `CancelShareCard` | Renderizada quando `pending \|\| shareStatus`; status controla se mostra Cancel button, spinner ou check |

Fluxo do bridge no `camera.tsx`:

```ts
const [shareStatus, setShareStatus] = useState<"sharing" | "success" | null>(null)
const isSharingActive = pending !== null || shareStatus !== null

useEffect(() => {
    setIsSharing(isSharingActive)
}, [isSharingActive, setIsSharing])
```

**Regra**: `isSharing` fica true durante toda a vida do card (janela cancellable
+ sharing real + success com check animado). Só volta false quando o card
desmonta.

---

## 5. Consumers do `isHandsFree` — o que muda no modo

Além do próprio `HandsFreeToggle` (que muta o valor), os seguintes consomem:

| Componente | Efeito quando `isHandsFree === true` |
|---|---|
| `CaptureButton` | Prop `handsFree=true` → substitui LongPress+Pan por Gesture.Tap → single tap toggle |
| `FlashButton` | Não esconde durante recording (por padrão esconde se torch off + recording) |
| `FlipCameraHint` | Early return null — sem hint (sem drag pra virar em hands-free) |
| `CameraStatusLine` | Copy troca pra "Free hands on, touch to record" / "Toque para parar" |
| `usePinchZoomGesture` (worklet) | Pinch desbloqueado mesmo com `isPressingButton=true` |

Bridge no `camera.tsx`:

```ts
const handsFreeSV = useSharedValue(isHandsFree)
useEffect(() => { handsFreeSV.value = isHandsFree }, [isHandsFree])
```

O `handsFreeSV` (shared value) é passado ao worklet do `usePinchZoomGesture` que
não consegue ler React state.

---

## 6. Dependências externas do módulo

O módulo importa de fora:

### Contextos globais

| Import | Uso |
|---|---|
| `@/contexts/Persisted` (`session`) | `session.user.id` + `session.account.jwtToken` no `shareMoment` |
| `@/contexts/language` (`LanguageContext.t`) | Traduções de strings visíveis |
| `@/contexts/Toast/notify` (`notify()`) | In-app toasts (falhas de publicação, cancelled) |

### Utils

| Import | Uso |
|---|---|
| `@/lib/hooks/useHapticFeedback` (`Vibrate`) | Feedback tátil em toda interação relevante |
| `@/lib/platform/detection` (`iOSMajorVersion`) | Gate iOS 26+ para liquid glass (em alguns componentes) |
| `@/constants/colors`, `fonts`, `sizes` | Tokens de design |

### Bibliotecas nativas

| Package | Onde |
|---|---|
| `react-native-vision-camera` | preview, captura, ref do `<Camera>` |
| `react-native-reanimated` | shared values, worklets, animações |
| `react-native-gesture-handler` | Gesture.LongPress + Pan + Pinch + Tap |
| `expo-glass-effect` | `GlassView` (liquid glass iOS 26) |
| `expo-blur` | fallback de glass para iOS < 26 |
| `expo-symbols` | SF Symbols nos indicadores |
| `expo-file-system/legacy` | leitura do arquivo do vídeo pré-upload |
| `react-native-compressor` | (será removido na migração SAS — server re-encoda) |
| `react-native-svg` | Circle + Rect + Path (CaptureButton, AnimatedCheck) |
| `@expo/ui/swift-ui` | (parcialmente removido; ainda usado por alguns componentes menores) |

### Roteamento

| Import | Uso |
|---|---|
| `expo-router` | `Stack.Screen`, `useRouter`, `useSegments`, `useIsFocused` |
| `../routes.ts` (interno do módulo) | Tipos das rotas conhecidas |
| `src/lib/navigation.ts` | `NAV.CAMERA.*` — paths tipados para o resto do app navegar aqui |

---

## 7. State locais (não em context)

Alguns estados vivem **só** em `camera.tsx` e nunca sobem pra context. Justificativa:
apenas essa tela precisa deles.

| State | Onde | Por que não sobe |
|---|---|---|
| `shareStatus` | `camera.tsx#useState` | Só a tela usa. O context recebe uma versão simplificada (`isSharing: boolean`) |
| `sharePhase` (futuro, seção 8 do SHARE_MOMENT_SAS_MIGRATION) | `camera.tsx#useState` | Idem — sub-fases do share são detalhe da UI |
| `shareAbortRef` | `camera.tsx#useRef` | Controller vive durante uma chamada; não faz sentido persistir |
| `successDismissTimerRef` | `camera.tsx#useRef` | Timer local pra dismiss automático da success card |
| `handsFreeHintTrigger` / `holdHintTrigger` | `camera.tsx#useState` | Bumper para (re)animar chips; só a página que renderiza usa |
| Refs internos do CaptureButton (`recorderRef`, `isRecording.current`, etc.) | `CaptureButton.tsx` | Detalhes do pipeline AVAssetWriter; parent só quer os callbacks |

---

## 8. Consumers externos ao módulo

Quem consome o `CameraContext` FORA de `modules/camera/`:

| Consumer | Field(s) usado(s) | Motivo |
|---|---|---|
| `app/(tabs)/_layout.tsx` | `tabHide` | Esconde o tab bar durante gravação |
| `app/(tabs)/create/_layout.tsx` | Monta o `CameraProvider` (se não estiver no root) | Escopo do módulo |

Se você precisa do estado da câmera em outra tela (ex.: dashboard mostrando "gravando agora…"), consome `useCameraContext()` normalmente — o provider está no root.

**Não** consuma **campos legacy** (`isUploading`, `upload()`, etc.) — vão ser
removidos. Se você realmente precisa de "estado global de share", use
`isSharing`.

---

## 9. Legacy API — plano de sunset

Os campos abaixo estão no `CameraContextType` mas **não são chamados**:

```ts
description, setDescription
authToken, setAuthToken
isUploading, uploadError, lastUploadResponse, clearUploadError
upload()
video, setVideo, videoBuffer, setVideoBuffer
rotateAnimation, setRotateAnimation
isPressingButton, setIsPressingButton
```

Motivos:
- `description`, `setDescription`, `video`, `setVideo` — usados pela `share.tsx` deletada
- `authToken` — nunca foi usado; JWT vem sempre de `PersistedContext`
- `isUploading` etc. — refletiam o `upload()` do context (também sem uso)
- `rotateAnimation` — vestigial de rotate button antigo
- `isPressingButton` — foi movido pro CaptureButton local

**Ação recomendada**: quando bater refactor de context, remover em um único
commit. Nenhum consumer externo deve estar chamando. Checagem prévia:

```bash
grep -rn "context\.\(video\|isUploading\|upload\|authToken\|rotateAnimation\)" \
    src/ modules/ app/ --include="*.ts" --include="*.tsx"
```

Se o grep retornar vazio, é seguro remover.

---

## 10. Guidelines para expansão

### Adicionar um novo hook

1. Arquivo em `hooks/useXxx.ts`. Nome começa com `use`.
2. Se usa React (`useState`, `useEffect`) → hook stateful, prefira `hooks/`.
   Se é função pura async (rede, IO) → também vai em `hooks/` mas nome sem `use`
   (ver `shareMoment.ts` como precedente).
3. Não importe de `pages/` (evita circular). Se precisa de constantes, importe
   de `constants.ts`.

### Adicionar um novo componente

1. Arquivo em `components/XxxYyy.tsx`. Nome PascalCase.
2. Consome contexto via `useCameraContext()` — livre para ler o que precisar.
3. Estado local só via `useState` / Reanimated. **Não** exponha imperativos
   (refs, callbacks) pro parent a menos que seja gesture-critical.

### Adicionar estado ao contexto

Antes de subir uma flag pro `CameraContextType`, faça as perguntas:

- Mais de uma tela consome? Se não → mantenha local
- Mais de um componente do módulo consome? Se sim → contexto vale
- É um valor de UI (posição de scroll, transform)? Prefira ref/shared value,
  não context

Sobe apenas `boolean`s ou primitivos. Objetos grandes forçam re-renders do
provider inteiro.

### Adicionar uma constante

- Usada em 2+ arquivos: `constants.ts`
- Usada em 1 arquivo: no topo do próprio arquivo, `const NOME = ...`

Convenção: `SCREAMING_SNAKE_CASE` para constantes runtime; `PascalCase` para
tipos.

---

## 11. Diagrama de dependências

Camadas do módulo em direção de dependência (ninguém quebra a seta):

```
             ┌───────────────────┐
             │   pages/camera    │  ← única tela; orquestra tudo
             └──────┬────────────┘
                    │
       ┌────────────┼────────────────┐
       ▼            ▼                ▼
┌────────────┐┌───────────┐┌──────────────┐
│  hooks/*   ││ components/*│ context.tsx │
└──────┬─────┘└────┬──────┘└────┬─────────┘
       │           │            │
       └────────┬──┴────────────┘
                ▼
      ┌─────────────────┐
      │  constants.ts   │
      └─────────────────┘
                │
                ▼
   contextos globais (@/contexts/*)
   libs nativas (react-native-*)
   design tokens (@/constants/*)
```

Regras:
- `pages/camera.tsx` importa qualquer coisa do módulo
- `hooks/` importam `constants.ts` + contextos globais + libs
- `components/` importam `context.tsx`, `constants.ts`, hooks se necessário
- `context.tsx` importa apenas contextos globais + libs (não importa `hooks/`
  do próprio módulo pra evitar circular)
- `constants.ts` importa apenas contextos globais / libs; folha da árvore

---

## 12. Como o módulo se conecta com o "resto do mundo"

TL;DR — **apenas o `CameraContext` sai para fora**. Todo o resto do módulo é
detalhe interno.

Superfície externa:

| Onde | O que exporta | Consumidor externo |
|---|---|---|
| `index.tsx` | `CameraPage`, `CameraProvider`, `useCameraContext`, `CameraContextType`, `Routes`, `CameraRoutes`, `CAMERA_ROUTES` | `app/(tabs)/create/index.tsx` (rota) e outros consumers de context |
| `routes.ts` | `CameraRoutes`, `Routes`, `CAMERA_ROUTES` | `src/lib/navigation.ts` |

**Não** exporte:
- Componentes internos (`CaptureButton`, `CancelShareCard`, etc.). Se alguém de
  fora precisar → sinal de que a lógica precisa ser generalizada e movida pra
  `src/components/`
- Hooks internos (`useRecordingInterval`, etc.). Mesmo raciocínio.

Se um consumer externo pedir acesso a algo interno, resista — geralmente é
sintoma de acoplamento indevido.

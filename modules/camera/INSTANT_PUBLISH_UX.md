# Instant Publish on Release — UX Design Notes

## Contexto atual

Hoje o fluxo é:

1. Usuário pressiona e segura o CaptureButton → começa a gravar
2. Solta → `onMediaCaptured` → `router.push("/(tabs)/create/media")` → preview + edit
3. Usuário confirma → upload → aparece no feed

O usuário quer:

- **Sem tela de preview.** Soltar = publica.
- **Sem risco de publicar gravação acidental** (dedo tocou o botão sem querer, começou a gravar 0.4s, soltou).

Essas duas coisas puxam em direções opostas: quanto mais rápido publica, menos filtro tem contra acidentes.

## O que conta como "acidente"

- **Toque muito rápido** (< 500ms) — dedo raspou o botão, quase-tap
- **Movimento intencional cancelado** — começou a gravar mas quer descartar (hoje isso vai pro preview e o usuário sai da tela; sem preview precisa de outro caminho)
- **Bug de racing** que já mitigamos (`MIN_RECORDING_MS = 600`, `releasePendingRef`)

Não são acidentes:
- Clipes curtos intencionais (1-2s de reação, meme, moment "flash")
- Segurar e mudar de ideia (é decisão consciente do usuário)

## Ideias

### 1. Rejeição de clipe curto (silenciosa)

Descarta clipe com duração < N ms sem publicar, sem navegar, sem toast. Câmera segue no estado padrão pronta pra próxima tentativa.

- **N = 800ms** parece bom ponto. `MIN_RECORDING_MS` já é 600 (garantia técnica pro `AVAssetWriter` finalizar; UX é ortogonal).
- **Prós**: zero fricção no happy path; usuário não percebe descarte silencioso quando foi acidente.
- **Contras**: usuário deliberado que fez clipe muito curto fica confuso ("gravei mas não saiu nada?"). Precisa de feedback.
- **Feedback sugerido**: haptic `notificationWarning` + toast breve "Segure mais tempo".

### 2. Undo Toast pós-publicação

Solta → publica instantaneamente → toast persistente por 4-5s com botão "Desfazer".

- **Prós**: zero fricção real. O usuário vê o resultado no feed enquanto o toast está lá pra reverter.
- **Contras**: dentro da janela de undo o post está visível pra outros (por poucos segundos). Precisa de endpoint `DELETE /moments/:id` rápido; se a rede for lenta o "instantâneo" fica mentira.
- **Servidor**: pode-se adicionar `?draft=true` no POST — só vira público depois do timeout do cliente confirmar. Undo cancela antes. Zero exposição pública.
- **Recomendado se puder mexer no backend.**

### 3. Threshold de commit visível

O progress bar do header (que já existe) marca uma faixa "descartável" e "commit". Enquanto o preenchimento estiver dentro da faixa vermelha inicial (< 800ms visualmente), soltar = descartar. Passando dela, entra em roxo = comitado.

- **Prós**: usuário aprende visualmente onde é o ponto de commit. Muito pedagógico.
- **Contras**: uma boa parte da progress bar vira "wasted" (aviso, não conteúdo). Fica meta.
- **Variante mais leve**: sem mudança de cor, mas haptic pulse (`impactMedium`) exatamente no ponto de commit. Usuário aprende pelo tato.

### 4. Haptic de commit + rejeição silenciosa (extensão da 3)

Combina:

- Aos ~800ms de hold → `Vibrate("impactMedium")` marcando "a partir daqui vira post"
- Soltar antes do pulse → descarta silenciosamente
- Soltar depois → publica instantaneamente

Adiciona canal tátil sem enfeitar visualmente a progress bar.

- **Prós**: aprendizado rápido pela repetição, não polui UI.
- **Contras**: haptics desligadas (preferência ou acessibilidade) neutralizam o feedback. Fallback necessário: aviso visual sutil (ex: cor da progress bar muda de translúcida pra sólida no ponto).

### 5. Publicação em background + navegação imediata

Solta → dispara o upload em background → volta imediatamente pra feed → o post aparece "publicando..." e depois "publicado".

- **Prós**: percepção de instantâneo, sem tela de preview.
- **Contras**: se falhar não tem preview pra retry — precisa de fila de retry robusta na camada de upload. Já temos infra pra isso? Provavelmente não pronta.

### 6. Cancelar por gesto durante upload

Solta → upload começa → indicador de progresso (canto/toast) → swipe up ou shake pra abortar antes do fim.

- **Prós**: casa bem com "publicação em background". Escape hatch mesmo sem preview.
- **Contras**: gestos escondidos = descobrimento zero, precisa de tutorial (ver FlipCameraHint pattern). Shake é acidental demais em muitos casos.

### 7. Nunca publicar automaticamente para clipes curtos

Regra: clipes < 3s NUNCA publicam direto — vão pro preview mesmo neste modo instantâneo. Só a partir de 3s a publicação é instantânea.

- **Racional**: quem grava < 3s frequentemente foi acidente ou reação impulsiva. Vale a etapa extra.
- **Prós**: elimina o risco maior de acidente sem overhead pro caso comum (clipes de "moment" que costumam ser 5-15s).
- **Contras**: comportamento inconsistente ("por que essa gravação foi pro preview e outra não?"). Precisa de indicador claro.

## Recomendação

**Compor 1 + 4 + 2:**

1. **Silenciosa < 700ms** (`MIN_PUBLISHABLE_MS`): nada acontece. Segundo hold é retomada natural.
2. **Haptic de commit em 700ms**: `Vibrate("impactMedium")` no worklet do interval de recording.
3. **Undo toast por 5s pós-publicação**: se possível com flag de rascunho no backend; senão com `DELETE` rápido.

Rationale:

- (1) filtra 90% dos acidentes sem UI.
- (2) ensina o tempo mínimo tacitamente (usuário sente a "confirmação") sem precisar de tutorial.
- (3) safety net final pro caso raro em que passou do threshold mas ainda foi acidente ou o usuário mudou de ideia.

Não precisa de tela intermediária, mantém a percepção de "solta = publica".

## Implementação (esboço)

### Constantes (em `constants.ts`)

```ts
export const MIN_PUBLISHABLE_MS = 700     // abaixo disso, descarta silenciosamente
export const COMMIT_HAPTIC_MS = 700        // dispara haptic exatamente no threshold
export const UNDO_WINDOW_MS = 5000         // duração do toast de undo
```

### `useRecordingInterval` (extensão)

Adiciona um pulse haptic quando `current` cruza `COMMIT_HAPTIC_MS / 1000`:

```ts
const committedRef = useRef(false)
// dentro do setInterval:
if (!committedRef.current && current * 1000 >= COMMIT_HAPTIC_MS) {
    committedRef.current = true
    Vibrate("impactMedium")
}
// reset em isRecording=false
```

### `onMediaCaptured` (guard + publish direto)

```ts
const onMediaCaptured = useCallback(async (filePath, duration) => {
    setIsRecording(false)
    setRecordingTime(0)

    // Guard 1: clipe curto = acidente, descarta
    if (duration * 1000 < MIN_PUBLISHABLE_MS) {
        // opcional: apagar o arquivo em disco
        return
    }

    // Publicação instantânea (não navega pra preview)
    await publishMoment({ path: filePath, duration, ... })

    // Mostrar undo toast
    toast.show({
        message: t("Publicado"),
        action: { label: t("Desfazer"), onPress: () => undoLastPost() },
        duration: UNDO_WINDOW_MS,
    })
}, [...])
```

### Backend (idealmente)

`POST /moments?holdUntil=<epoch>` — cria com estado "pendente publicação" invisível ao feed dos outros. Cliente confirma passando o `holdUntil` ou envia `DELETE /moments/:id` durante a janela. Servidor tem cronjob curto que publica pending após expirar.

Alternativa MVP: `POST /moments` normal + `DELETE /moments/:id` rápido (< 500ms). Aceita 3-5s de exposição pra quem já é seguidor durante a janela de undo.

### Configuração/preferência

`preferences.instantPublish` no MMKV. Quando false, mantém o fluxo atual com preview. Default: true (o UX principal proposto).

## Edge cases

- **Câmera vira mid-record**: `enablePersistentRecorder` mantém o arquivo. Duração conta desde o início do hold. Sem mudança.
- **Bateria acaba durante undo window**: post fica publicado. Aceito.
- **Rede offline no momento do release**: upload vai pra fila local. Toast: "Publicando quando voltar a conexão. Desfazer?". Undo remove da fila.
- **Usuário fecha o app dentro da janela de undo**: publicação vira firme. Toast some. Aceito.
- **Feed dos seguidores durante a janela**: se o backend suportar hold, ninguém vê. Se não, uns 3-5s de exposição — provavelmente aceitável pra baixo volume, revisar quando escalar.

## Métricas pra validar

- % de clipes < `MIN_PUBLISHABLE_MS` descartados (sanity: usuário testando não trava).
- % de undos usados dentro da janela (se > 10% → threshold curto demais ou UX confuso).
- Tempo médio de hold antes do release (se convergir pra ~`COMMIT_HAPTIC_MS` → aprendizado funcionou).
- Suporte queixa "publiquei sem querer" (deve tender a zero).

## Fora do escopo aqui

- Fluxo de edição (crop, filtro, música). Se o usuário quiser editar, precisa de outro trigger — proposta: tap simples (sem hold) abre o preview/editor tradicional. Fica pra outra iteração.
- Câmera em outro app (Reels, TikTok) — não copiar sem entender o próprio funil.

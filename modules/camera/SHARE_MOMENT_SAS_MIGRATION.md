# Migração do `shareMoment` para Upload Direto (Presigned URL / Azure SAS)

Guia de implementação do novo fluxo de upload de vídeo no módulo camera. Substitui o
`shareMoment.ts` atual (que envia base64 na body do POST) por um pipeline em **3
chamadas à API + 1 PUT direto ao Azure Blob + polling** de status.

Referência: guia da API `Upload de Moments — Guia do App (Upload Direto via Presigned
URL / Azure SAS)`.

---

## 1. O que muda

### Implementação atual (`hooks/shareMoment.ts`)

```
recording.mov → Video.compress(480p, 800Kbps)
              → FileSystem.readAsStringAsync(Base64)
              → api.post("/moment/create", { moment: { midia: { base64 } } })
              → 413 nginx (mesmo com 480p) OR sucesso
```

**Problemas**:
- Base64 infla o payload em 33% → estoura `client_max_body_size` do nginx.
- Compressão local antes do envio duplica trabalho (o servidor re-encoda em H.264
  no worker).
- Sem controle de progresso — o usuário vê spinner sem progresso real.
- Cancelamento aborta o axios mas não a compressão do `react-native-compressor` na
  hora certa (o hook faz best-effort via `getCancellationId`).

### Novo fluxo (SAS)

```
recording.mov → POST /moments/upload-url          (1)   metadata JSON, ~200 KB
              → PUT {uploadUrl} bytes direto ao Azure  (2)   binário puro, streaming
              → POST /moments/{momentId}/confirm   (3)   sem body, ~50 B
              → GET  /moments/{momentId} (poll)    (4)   loop até completed
              → moment.media.url + thumbnail.url
```

**Ganhos**:
- Nginx nunca vê os bytes do vídeo — 100 MB sem 413.
- Podemos **remover a compressão local** (o servidor faz crop 1080×1674 + encode).
- `expo-file-system.uploadAsync` dá **progresso real** durante o PUT → barra de
  progresso na `CancelShareCard`.
- Cancelamento fica trivial em cada fase (AbortController da API; parar polling
  apenas seta uma flag JS).

---

## 2. Máquina de estados do lado do app

### Fases internas (opacas para o UI)

```
       ┌──────────────┐
       │  cancellable │ ← janela de 5s (nada acontece na rede)
       └──────┬───────┘
              │ commit
       ┌──────▼───────┐
       │  requesting  │ ← POST /moments/upload-url  (~200 ms)
       └──────┬───────┘
              │ 200 OK  { momentId, upload }
       ┌──────▼───────┐
       │  uploading   │ ← PUT bytes → Azure (progress 0→100 %)
       └──────┬───────┘
              │ 201 Created
       ┌──────▼───────┐
       │  confirming  │ ← POST /moments/{momentId}/confirm  (~200 ms)
       └──────┬───────┘
              │ 202 Accepted
       ┌──────▼───────┐
       │   polling    │ ← GET /moments/{momentId} a cada 2 s
       └──────┬───────┘
              │ processing.status === "completed"
              │ status.current === "published"
       ┌──────▼───────┐
       │   success    │ ← check animado, 1.4 s, dismiss
       └──────────────┘
```

### Mapeamento para `CancelShareCardStatus` atual

A card já expõe 3 estados: `"cancellable" | "sharing" | "success"`. Mantemos a API,
consolidando as 4 sub-fases de rede como `"sharing"`. Um sub-status interno drive
apenas a UI dentro do sharing (barra de progresso do PUT ou "processando…" no polling).

| Fase interna | `CancelShareCardStatus` público | Cancel disponível? |
|---|---|---|
| Janela de 5s | `cancellable` | ✓ (limpa timer, sem HTTP) |
| Requesting URL | `sharing` | ✓ (aborta fetch) |
| Uploading para Azure | `sharing` (barra de progresso) | ✓ (aborta PUT) |
| Confirming | `sharing` | ✓ (não chama confirm) |
| Polling | `sharing` (spinner + "Processando…") | ✗ (moment vai publicar) |
| Completed | `success` | — |

**Decisão**: depois que `POST /confirm` retorna `202`, o momento **vai ser
publicado** (o servidor não expõe endpoint de delete pós-confirm nesta versão da
API). O botão Cancel deve **sumir** ao entrar na fase polling — ou virar
"Publicar em segundo plano" que apenas dispensa a card sem alterar o estado real.

---

## 3. Assinaturas TypeScript propostas

### Novo `hooks/shareMoment.ts`

```ts
export interface ShareMomentParams {
    userId: number | string             // mantido pra logs; não vai no body do novo endpoint
    jwtToken: string
    videoPath: string
    videoMetadata: {
        mimeType: "video/mp4" | "video/quicktime"
        size: number                    // bytes do arquivo original
        duration?: number               // segundos (≤ 30)
    }
    description?: string | null
    visibility?: "public" | "followers_only"

    /**
     * Callbacks para o parent atualizar UI. Todos opcionais.
     *   - onPhaseChange: transições entre requesting/uploading/confirming/polling
     *   - onUploadProgress: 0..1 durante o PUT (setado a cada ~200 ms)
     *   - onCommit: `momentId` recebido no passo 1 (útil pra reportar no toast)
     */
    onPhaseChange?: (phase: SharePhase) => void
    onUploadProgress?: (fraction: number) => void
    onCommit?: (momentId: string) => void

    signal?: AbortSignal
}

export type SharePhase =
    | "requesting"
    | "uploading"
    | "confirming"
    | "polling"

export interface ShareMomentResult {
    momentId: string
    mediaUrl: string
    thumbnailUrl?: string
}

export async function shareMoment(props: ShareMomentParams): Promise<ShareMomentResult>
```

### Tipos internos das respostas da API

```ts
interface UploadUrlResponse {
    success: true
    momentId: string
    upload: {
        uploadUrl: string
        method: "PUT"
        key: string
        container: string
        headers: Record<string, string>   // { "x-ms-blob-type": "BlockBlob", "Content-Type": "video/mp4" }
        expiresAt: string                 // ISO-8601
    }
}

interface ConfirmResponse {
    success: true
    momentId: string
    status: "processing"
}

interface MomentPollResponse {
    success: true
    moment: {
        id: string
        status: { current: "under_review" | "published" | "archived" | "blocked" | "deleted" }
        processing: {
            status: "pending" | "processing" | "uploaded" | "media_processed" | "completed" | "failed"
            progress?: number
        }
        media: { url: string }
        thumbnail: { url: string }
    }
}
```

---

## 4. Implementação passo-a-passo

Snippets prontos pra copiar. Todos usam `AbortSignal` e propagam
`{ name: "AbortError" }` para o caller detectar cancelamento.

### 4.1. Guard de aborto

```ts
const throwIfAborted = () => {
    if (props.signal?.aborted) {
        const err = new Error("shareMoment aborted") as Error & { name: string }
        err.name = "AbortError"
        throw err
    }
}
```

### 4.2. Passo 1 — Pedir URL de upload

```ts
async function requestUploadUrl(props: ShareMomentParams): Promise<UploadUrlResponse> {
    throwIfAborted()
    const res = await api.post(
        "/moments/upload-url",
        {
            mimeType: props.videoMetadata.mimeType,
            size: props.videoMetadata.size,
            filename: `moment-${Date.now()}.mp4`,
            duration: props.videoMetadata.duration,
            description: props.description ?? null,
            visibility: props.visibility ?? "public",
        },
        {
            headers: { Authorization: props.jwtToken },
            signal: props.signal,
        },
    )
    if (!res.data?.success) {
        throw new Error(res.data?.error ?? "Falha ao pedir upload URL")
    }
    return res.data
}
```

### 4.3. Passo 2 — PUT direto ao Azure

**Crítico**: o PUT tem que ser **streaming** — não pode carregar o vídeo inteiro
na memória do JS. `fetch` do RN copia o body inteiro pra memória JS antes de
enviar, o que trava vídeos de 30s em ~50 MB.

Usar `FileSystem.uploadAsync` do `expo-file-system/legacy` (já importado no
projeto):

```ts
import * as FileSystem from "expo-file-system/legacy"

async function uploadToAzure(
    upload: UploadUrlResponse["upload"],
    videoPath: string,
    onProgress?: (fraction: number) => void,
    signal?: AbortSignal,
): Promise<void> {
    const fileUri = videoPath.startsWith("file://") ? videoPath : `file://${videoPath}`

    // Cancellation via TaskHandle. O signal do AbortController vira uma flag
    // que checkamos em cada callback de progresso — API do expo-file-system
    // não aceita AbortSignal diretamente.
    const uploadTask = FileSystem.createUploadTask(
        upload.uploadUrl,
        fileUri,
        {
            httpMethod: upload.method,             // "PUT"
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: upload.headers,               // { "x-ms-blob-type": "BlockBlob", "Content-Type": "video/mp4" }
        },
        (progress) => {
            if (progress.totalBytesExpectedToSend > 0) {
                onProgress?.(progress.totalBytesSent / progress.totalBytesExpectedToSend)
            }
        },
    )

    const onSignalAbort = () => {
        uploadTask.cancelAsync().catch(() => {})
    }
    signal?.addEventListener("abort", onSignalAbort)

    try {
        const result = await uploadTask.uploadAsync()
        if (!result) throw new Error("Upload cancelled")
        if (result.status !== 201) {
            throw new Error(`Azure PUT falhou (HTTP ${result.status})`)
        }
    } finally {
        signal?.removeEventListener("abort", onSignalAbort)
    }
}
```

**Verificações críticas na chamada**:
1. Use `upload.uploadUrl` **sem modificar** a query string (é o SAS token).
2. `headers` vem exatamente do `upload.headers` — não substitua nem misture.
3. `uploadType: BINARY_CONTENT` — sem multipart, sem base64, bytes puros do arquivo.
4. Verifique `expiresAt` antes de chamar: se já passou → refaça o passo 1.

### 4.4. Passo 3 — Confirm

```ts
async function confirmUpload(
    momentId: string,
    jwtToken: string,
    signal?: AbortSignal,
): Promise<void> {
    throwIfAborted()
    const res = await api.post(
        `/moments/${momentId}/confirm`,
        {},
        {
            headers: { Authorization: jwtToken },
            signal,
        },
    )
    if (res.status !== 202 || !res.data?.success) {
        throw new Error(res.data?.error ?? "Falha ao confirmar")
    }
}
```

### 4.5. Passo 4 — Polling

```ts
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 120_000

async function pollUntilPublished(
    momentId: string,
    jwtToken: string,
    signal?: AbortSignal,
): Promise<{ mediaUrl: string; thumbnailUrl?: string }> {
    const deadline = Date.now() + POLL_TIMEOUT_MS

    while (true) {
        throwIfAborted()

        const res = await api.get(`/moments/${momentId}`, {
            headers: { Authorization: jwtToken },
            signal,
        })
        const moment = res.data?.moment
        const procStatus = moment?.processing?.status
        const currentStatus = moment?.status?.current

        if (procStatus === "failed") {
            throw new Error("Processamento falhou no servidor")
        }
        if (procStatus === "completed" && currentStatus === "published") {
            return {
                mediaUrl: moment.media.url,
                thumbnailUrl: moment.thumbnail?.url,
            }
        }

        if (Date.now() >= deadline) {
            // Deixamos o processamento continuar em background — o servidor
            // eventualmente publica. Signal para o parent chamar dismiss e
            // mostrar toast "Publicando em segundo plano".
            const err = new Error("Polling timeout") as Error & { code: string }
            err.code = "POLL_TIMEOUT"
            throw err
        }

        await sleep(POLL_INTERVAL_MS)
    }
}

const sleep = (ms: number) =>
    new Promise((r) => setTimeout(r, ms))
```

### 4.6. Orquestração no `shareMoment`

```ts
export async function shareMoment(props: ShareMomentParams): Promise<ShareMomentResult> {
    props.onPhaseChange?.("requesting")
    const { momentId, upload } = await requestUploadUrl(props)
    props.onCommit?.(momentId)

    // Falha rápida se o SAS já expirou entre a resposta e a próxima chamada
    // (raro, mas cobre casos de dispositivo com relógio adiantado).
    if (new Date(upload.expiresAt).getTime() < Date.now()) {
        throw new Error("Upload URL expired before PUT")
    }

    props.onPhaseChange?.("uploading")
    await uploadToAzure(upload, props.videoPath, props.onUploadProgress, props.signal)

    props.onPhaseChange?.("confirming")
    await confirmUpload(momentId, props.jwtToken, props.signal)

    props.onPhaseChange?.("polling")
    const { mediaUrl, thumbnailUrl } = await pollUntilPublished(
        momentId,
        props.jwtToken,
        props.signal,
    )

    return { momentId, mediaUrl, thumbnailUrl }
}
```

---

## 5. Cancelamento em cada fase

| Fase | Como parar | Estado do servidor | Ação de limpeza |
|---|---|---|---|
| **Janela 5s** (cancellable) | `clearTimeout` do timer no `usePendingPublish` | Nada foi chamado | Nenhuma |
| **Requesting URL** | `AbortController.abort()` → axios cancela | Nenhum draft criado ainda (ou draft órfão se abortou depois do 200) | Servidor GC os drafts sozinho |
| **Uploading** | `uploadTask.cancelAsync()` via listener no signal | Blob parcial no Azure | Servidor GC do container OR passa validação no confirm (que nunca vai chamar) |
| **Confirming** | `AbortController.abort()` no fetch | Blob completo no Azure sem confirm | Draft + blob são coletados pelo GC do servidor |
| **Polling** | Parar o loop (verificando `signal.aborted` no `throwIfAborted`) | **Moment já foi enfileirado para publicação** | **Sem cleanup possível** — o moment vai aparecer no feed |

**Regra de UX**: assim que `onPhaseChange("polling")` dispara, o parent
(`camera.tsx`) deve **esconder o botão Cancel** e trocar por "Fechar" ou nada. Se
o usuário insistir em cancelar, apenas dispensa a card visualmente — o moment
publicará normalmente. Toast opcional: "Publicação em andamento, aparecerá no
feed em instantes".

---

## 6. Progresso e polling — UX

### Progresso do PUT (fase "uploading")

Substituir o `ActivityIndicator` da `CancelShareCard` por barra de progresso
durante essa fase. Fluxo:

```ts
// no camera.tsx
const uploadProgress = useSharedValue(0)

const commitPending = React.useCallback(async (item: PendingPublishItem) => {
    // ... setup do controller
    try {
        await shareMoment({
            // ...
            onUploadProgress: (fraction) => {
                // De JS → shared value; useAnimatedStyle na card renderiza a barra
                uploadProgress.value = withTiming(fraction, { duration: 200 })
            },
            onPhaseChange: (phase) => {
                setSharePhase(phase)   // React state para escolher texto/spinner/barra
            },
            // ...
        })
    }
})
```

### Polling

Durante polling, mostrar spinner + texto contextual "Processando…" ou similar.
Não expor progresso real (o `processing.progress` da API pode não ser confiável
frame-a-frame).

Se `POLL_TIMEOUT_MS` estourar (120s), tratar como sucesso **best-effort**:
- Dispensa a card
- Toast: "Publicação em segundo plano — vai aparecer em instantes"
- Não trata como falha (o servidor eventualmente publica)

---

## 7. Tratamento de erros e retry

### Falhas fatais (parent chama `notify` warning)

| Fonte | Detecção | Mensagem |
|---|---|---|
| Passo 1: `mimeType` inválido | 400 body `.error` | "Formato de vídeo não suportado" |
| Passo 1: `size` > 100 MB | 400 body `.error` | "Vídeo muito grande" |
| Passo 1: `duration` > 30 | 400 body `.error` | "Vídeo muito longo" |
| Passo 3: blob missing | 400 body `.error` | "Upload não completou" |
| Polling: `processing.status === "failed"` | GET response | "Falha no processamento" |

### Retriáveis automaticamente

**SAS expirado durante PUT** (Azure 403):

```ts
async function uploadWithRetry(props, attempt = 0) {
    try {
        return await uploadFlow(props)
    } catch (err) {
        const isSasExpired =
            attempt === 0 &&
            (err.message?.includes("HTTP 403") || err.message?.includes("expired"))
        if (isSasExpired) {
            return uploadWithRetry(props, attempt + 1)  // reinicia do passo 1
        }
        throw err
    }
}
```

Regra: **1 retry apenas** para SAS expirado. Se o segundo também falhar, é
problema real de rede/permissão — reportar erro ao usuário.

### Cancelamento

**Não é** tratado como erro — os catches devem detectar `err.name === "AbortError"`
e sair silenciosamente (o toast de "cancelado" já foi emitido pelo handler do
botão Cancel).

---

## 8. Impacto em `camera.tsx` e `CancelShareCard`

### `camera.tsx`

**Adicionar states**:
```ts
const [sharePhase, setSharePhase] = React.useState<SharePhase | null>(null)
const uploadProgress = useSharedValue(0)
```

**Atualizar `commitPending`**:
```ts
const commitPending = React.useCallback(async (item: PendingPublishItem) => {
    const controller = new AbortController()
    shareAbortRef.current = controller
    setShareStatus("sharing")

    try {
        const info = await FileSystem.getInfoAsync(item.path)
        const fileSize = (info as { size?: number }).size ?? 0

        const result = await shareMoment({
            userId: session.user.id,
            jwtToken: session.account.jwtToken,
            videoPath: item.path,
            videoMetadata: {
                mimeType: item.mimeType as "video/mp4",
                size: fileSize,
                duration: item.duration,
            },
            description: null,
            visibility: "public",
            onPhaseChange: (phase) => setSharePhase(phase),
            onUploadProgress: (frac) => {
                uploadProgress.value = withTiming(frac, { duration: 200 })
            },
            signal: controller.signal,
        })

        console.log("[share] published", result.momentId, result.mediaUrl)
        setShareStatus("success")
        setSharePhase(null)
        // ... setCameraPosition + auto-dismiss timer (inalterados)
    } catch (err: any) {
        setSharePhase(null)
        const aborted = err?.name === "AbortError"
        if (aborted) {
            setShareStatus(null)
            return
        }
        // Polling timeout ≠ falha para o usuário
        if (err?.code === "POLL_TIMEOUT") {
            setShareStatus(null)
            notify({
                params: {
                    title: t("Publicando em segundo plano"),
                    variant: "success",
                    config: { duration: 3000 },
                },
            })
            return
        }
        // ... resto do tratamento de erro
    } finally {
        shareAbortRef.current = null
    }
}, [...])
```

**Regra de exibição do Cancel**:
```tsx
<CancelShareCard
    status={/* ... */}
    // Novo prop — parent controla visibilidade explícita
    canCancel={sharePhase !== "polling" && shareStatus !== "success"}
    onCancel={/* ... */}
    uploadProgress={uploadProgress}   // shared value opcional
    phase={sharePhase}                 // pra escolher spinner vs barra vs mensagem
/>
```

### `CancelShareCard`

**Novas props**:
```ts
interface Props {
    status: CancelShareCardStatus
    canCancel: boolean
    onCancel: () => void
    uploadProgress?: SharedValue<number>
    phase?: SharePhase | null
}
```

**Conteúdo do ícone/spinner slot depende da fase**:
- `requesting` / `confirming`: `ActivityIndicator`
- `uploading`: barra de progresso animada por `uploadProgress`
- `polling`: `ActivityIndicator` + subtítulo "Processando…"
- `success`: `AnimatedCheck` (já existe)

**Botão Cancel**:
- Renderiza apenas quando `canCancel === true`
- Layout permanece — quando o botão some, adiciona um espaço equivalente pra
  card não colapsar/pular altura

---

## 9. Decisões abertas

1. **Compressão local — remover ou manter?**
   Recomendação: **remover**. O servidor faz crop + H.264 no worker. Poupa 3-5s
   de CPU local e libera bateria. Trade-off: upload PUT fica um pouco maior
   (5-15 MB para 30s vs 3-8 MB compressor), mas o progresso visível compensa.
   Decisão final quando testar em rede 4G real.

2. **`filename` no passo 1**
   A doc diz que o servidor **decide a key** (`uploads/{ownerId}/{momentId}.mp4`).
   O `filename` que enviamos é apenas metadado. Sugestão: `moment-{timestamp}.mp4`
   pra debug em logs.

3. **`visibility` default**
   A doc mostra `"public"` como default. Manter até o momento em que a UI
   expuser toggle público/seguidores.

4. **Timeout do polling em rede lenta**
   120s é razoável pra vídeo 30s + 2 min de processamento worst-case. Se a
   telemetria mostrar > 5 % dos casos estourando, dobrar pra 240s.

5. **Renomear função?**
   Como o novo fluxo não é mais um único POST, `shareMoment` continua semântico
   mas o corpo mudou drasticamente. Manter o nome — a interface do parent
   (`await shareMoment(...)`) é a mesma.

---

## 10. Checklist de migração

- [ ] Reescrever `hooks/shareMoment.ts` conforme seção 4
- [ ] Adicionar tipos internos (`UploadUrlResponse`, `ConfirmResponse`, `MomentPollResponse`)
- [ ] Adicionar `SharePhase` como export do módulo
- [ ] Adicionar `onPhaseChange`, `onUploadProgress`, `onCommit` na interface
- [ ] Remover `Video.compress` do pipeline (a doc do server confirma que o worker
      re-encoda)
- [ ] Substituir base64 + `api.post("/moment/create")` pelas 3 chamadas + PUT
- [ ] Implementar retry único para SAS expirado
- [ ] Atualizar `camera.tsx#commitPending`: `sharePhase` state + `uploadProgress`
      shared value + tratamento de `POLL_TIMEOUT`
- [ ] Ler `FileSystem.getInfoAsync` para obter `size` real do arquivo antes do
      passo 1
- [ ] `CancelShareCard`: nova prop `canCancel`, `uploadProgress`, `phase`
- [ ] Esconder botão Cancel quando `sharePhase === "polling"`
- [ ] Substituir spinner por barra de progresso durante `sharePhase === "uploading"`
- [ ] Testar cancelamento em cada fase (breakpoint manual ou throttle)
- [ ] Testar retry de SAS expirado (mock: forçar 403 no primeiro PUT)
- [ ] Testar polling timeout (mock: `processing.status = "processing"` para sempre)
- [ ] Remover `react-native-compressor` do pipeline se não for usado em outro lugar

---

## 11. Anexos

### Endpoints envolvidos

| Método | URL | Auth | Resposta |
|---|---|---|---|
| POST | `/moments/upload-url` | JWT | 200 `{ success, momentId, upload }` |
| PUT | `{upload.uploadUrl}` | (SAS na URL) | 201 (Azure) |
| POST | `/moments/{momentId}/confirm` | JWT | 202 `{ success, momentId, status: "processing" }` |
| GET | `/moments/{momentId}` | JWT | 200 `{ success, moment }` |

### Envelope de erro padrão da API

```json
{
    "success": false,
    "error": "<mensagem legível>",
    "code": "<CÓDIGO_OPCIONAL>"
}
```

Códigos observados: `AUTHENTICATION_REQUIRED` (401). Outros erros vêm apenas com
`error` textual — parse com fallback.

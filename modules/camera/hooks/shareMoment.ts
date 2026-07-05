import api from "@/api"
import * as FileSystem from "expo-file-system/legacy"

/**
 * Fase interna do pipeline de share. O parent usa isso pra decidir qual
 * visual mostrar (spinner vs barra de progresso, texto do subtítulo, etc).
 */
export type SharePhase = "requesting" | "uploading" | "confirming" | "polling"

export interface ShareMomentProps {
    userId: number | string
    jwtToken: string
    videoPath: string
    videoMetadata: {
        mimeType: string
        duration?: number
    }
    description?: string | null
    visibility?: "public" | "followers_only"

    /** Notifica cada transição entre requesting/uploading/confirming/polling. */
    onPhaseChange?: (phase: SharePhase) => void
    /** 0..1 durante o PUT (uploading). Chamado a cada tick do expo-file-system. */
    onUploadProgress?: (fraction: number) => void
    /** Dispara com o momentId do rascunho assim que o passo 1 volta. */
    onCommit?: (momentId: string) => void

    signal?: AbortSignal
}

export interface ShareMomentResult {
    momentId: string
    mediaUrl: string
    thumbnailUrl?: string
}

interface UploadUrlResponse {
    success: true
    momentId: string
    upload: {
        uploadUrl: string
        method: "PUT"
        key: string
        container: string
        headers: Record<string, string>
        expiresAt: string
    }
}

interface MomentPollResponse {
    success: true
    moment: {
        id: string
        status: { current: string }
        processing: { status: string; progress?: number }
        media: { url: string }
        thumbnail?: { url: string }
    }
}

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 120_000

/**
 * Timeout do polling não é erro pro usuário — o servidor continua processando
 * em segundo plano. O parent detecta isso via `.code === "POLL_TIMEOUT"` e
 * mostra toast "publicando em segundo plano".
 */
export const POLL_TIMEOUT_CODE = "POLL_TIMEOUT" as const

const raiseAbort = (): never => {
    const err = new Error("shareMoment aborted") as Error & { name: string }
    err.name = "AbortError"
    throw err
}

/**
 * Fluxo de upload em 4 etapas + polling (ver `SHARE_MOMENT_SAS_MIGRATION.md`):
 *   1) POST /moments/upload-url         → recebe momentId + SAS URL
 *   2) PUT bytes direto ao Azure Blob   → binary streaming via expo-file-system
 *   3) POST /moments/{momentId}/confirm → server valida e enfileira job
 *   4) GET  /moments/{momentId} (loop)  → aguarda processing.status = completed
 *
 * Todos os passos respeitam o `signal` do AbortController. Um retry único é
 * aplicado apenas se o SAS expirou no meio do PUT (403 do Azure) — outros
 * erros propagam ao caller.
 */
export async function shareMoment(props: ShareMomentProps): Promise<ShareMomentResult> {
    const throwIfAborted = () => {
        if (props.signal?.aborted) raiseAbort()
    }

    const fileUri = props.videoPath.startsWith("file://")
        ? props.videoPath
        : `file://${props.videoPath}`

    const info = await FileSystem.getInfoAsync(fileUri)
    const size = (info as { size?: number }).size ?? 0
    if (size <= 0) throw new Error("Video file is empty or missing")

    console.log(`[shareMoment] file size = ${(size / 1024).toFixed(1)} KB`)

    return await runFlow(props, fileUri, size, throwIfAborted, /* retry */ 0)
}

async function runFlow(
    props: ShareMomentProps,
    fileUri: string,
    size: number,
    throwIfAborted: () => void,
    attempt: number,
): Promise<ShareMomentResult> {
    // === Passo 1: pedir URL de upload ===
    props.onPhaseChange?.("requesting")
    throwIfAborted()
    const { momentId, upload } = await requestUploadUrl(props, size)
    props.onCommit?.(momentId)

    if (new Date(upload.expiresAt).getTime() < Date.now()) {
        throw new Error("Upload URL already expired")
    }

    // === Passo 2: PUT direto ao Azure ===
    props.onPhaseChange?.("uploading")
    throwIfAborted()
    try {
        await uploadToAzure(upload, fileUri, props.onUploadProgress, props.signal)
    } catch (err: any) {
        // Retry único se o SAS expirou durante o PUT (403 do Azure).
        // Só re-tentamos na primeira falha — se der 403 duas vezes,
        // há algo maior errado (relógio, permissão) e não vale insistir.
        const isSasExpired =
            attempt === 0 &&
            typeof err?.message === "string" &&
            /HTTP 403|expired/i.test(err.message)
        if (isSasExpired && !props.signal?.aborted) {
            console.warn("[shareMoment] SAS expired mid-upload — retrying once")
            return runFlow(props, fileUri, size, throwIfAborted, attempt + 1)
        }
        throw err
    }

    // === Passo 3: confirmar ===
    props.onPhaseChange?.("confirming")
    throwIfAborted()
    await confirmUpload(momentId, props.jwtToken, props.signal)

    // === Passo 4: aguardar processamento ===
    props.onPhaseChange?.("polling")
    const { mediaUrl, thumbnailUrl } = await pollUntilPublished(
        momentId,
        props.jwtToken,
        props.signal,
    )

    return { momentId, mediaUrl, thumbnailUrl }
}

async function requestUploadUrl(
    props: ShareMomentProps,
    size: number,
): Promise<UploadUrlResponse> {
    const res = await api.post(
        "/moments/upload-url",
        {
            mimeType: props.videoMetadata.mimeType,
            size,
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

async function uploadToAzure(
    upload: UploadUrlResponse["upload"],
    fileUri: string,
    onProgress?: (fraction: number) => void,
    signal?: AbortSignal,
): Promise<void> {
    // O `fetch` do RN copia o body inteiro pra memória JS — inviável para
    // vídeos ~30 MB. `expo-file-system.createUploadTask` streama do disco
    // e emite progresso, exatamente o que a UX precisa.
    const uploadTask = FileSystem.createUploadTask(
        upload.uploadUrl,
        fileUri,
        {
            httpMethod: upload.method,
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: upload.headers,
        },
        (progress) => {
            if (progress.totalBytesExpectedToSend > 0) {
                onProgress?.(
                    progress.totalBytesSent / progress.totalBytesExpectedToSend,
                )
            }
        },
    )

    // `expo-file-system` não aceita AbortSignal direto; propagamos abort via
    // um listener que chama `.cancelAsync()` no task.
    const onSignalAbort = () => {
        uploadTask.cancelAsync().catch(() => {})
    }
    signal?.addEventListener("abort", onSignalAbort)

    try {
        const result = await uploadTask.uploadAsync()
        if (!result) {
            raiseAbort()
        }
        if (result!.status !== 201) {
            throw new Error(`Azure PUT falhou (HTTP ${result!.status})`)
        }
    } finally {
        signal?.removeEventListener("abort", onSignalAbort)
    }
}

async function confirmUpload(
    momentId: string,
    jwtToken: string,
    signal?: AbortSignal,
): Promise<void> {
    const res = await api.post(
        `/moments/${momentId}/confirm`,
        {},
        {
            headers: { Authorization: jwtToken },
            signal,
        },
    )
    if (!res.data?.success) {
        throw new Error(res.data?.error ?? "Falha ao confirmar")
    }
}

async function pollUntilPublished(
    momentId: string,
    jwtToken: string,
    signal?: AbortSignal,
): Promise<{ mediaUrl: string; thumbnailUrl?: string }> {
    const deadline = Date.now() + POLL_TIMEOUT_MS

    while (true) {
        if (signal?.aborted) raiseAbort()

        const res = await api.get<MomentPollResponse>(`/moments/${momentId}`, {
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
                mediaUrl: moment!.media.url,
                thumbnailUrl: moment!.thumbnail?.url,
            }
        }

        if (Date.now() >= deadline) {
            const err = new Error("Polling timeout") as Error & { code: string }
            err.code = POLL_TIMEOUT_CODE
            throw err
        }

        await sleep(POLL_INTERVAL_MS)
    }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

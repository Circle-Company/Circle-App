import api from "@/api"
import * as FileSystem from "expo-file-system/legacy"
import { cancelCompression, Video } from "react-native-compressor"

export interface ShareMomentProps {
    description: string | null
    userId: number | string
    videoMetadata: {
        mimeType: string
        duration?: number
    }
    videoPath: string
    jwtToken: string
    /**
     * Optional AbortSignal. When aborted:
     *   - If compression is running, it's cancelled through
     *     `cancelCompression(id)`.
     *   - If the axios request is in flight, it's aborted at the network
     *     layer via the same signal.
     * shareMoment will reject with the abort error, letting the caller
     * distinguish user-cancellation from an actual failure.
     */
    signal?: AbortSignal
}

// Same endpoint + body shape as `src/contexts/newMoment.tsx` — the canonical
// working share path in this project. `/moment/create` accepts larger
// payloads than `/moments`. The 480p+800Kbps compression stays as a
// belt-and-suspenders measure so requests are small regardless.
const COMPRESSION_MAX_SIZE = 480
const COMPRESSION_BITRATE_BPS = 800_000

export async function shareMoment(props: ShareMomentProps) {
    const fileUri = props.videoPath.startsWith("file://")
        ? props.videoPath
        : `file://${props.videoPath}`

    const throwIfAborted = () => {
        if (props.signal?.aborted) {
            const err = new Error("shareMoment aborted") as Error & { name: string }
            err.name = "AbortError"
            throw err
        }
    }

    let compressionId: string | null = null
    const onSignalAbort = () => {
        if (compressionId) cancelCompression(compressionId)
    }
    props.signal?.addEventListener("abort", onSignalAbort)

    try {
        throwIfAborted()

        const compressedUri = await Video.compress(fileUri, {
            compressionMethod: "manual",
            maxSize: COMPRESSION_MAX_SIZE,
            bitrate: COMPRESSION_BITRATE_BPS,
            minimumFileSizeForCompress: 0,
            getCancellationId: (id) => {
                compressionId = id
                if (props.signal?.aborted) cancelCompression(id)
            },
        })
        throwIfAborted()

        const compressedInfo = await FileSystem.getInfoAsync(compressedUri)
        const compressedSize = (compressedInfo as { size?: number }).size ?? 0

        const base64Video = await FileSystem.readAsStringAsync(compressedUri, {
            encoding: FileSystem.EncodingType.Base64,
        })
        throwIfAborted()

        console.log(
            `[shareMoment] compressed ${(compressedSize / 1024).toFixed(1)} KB → base64 ${(base64Video.length / 1024).toFixed(1)} KB`,
        )

        try {
            const response = await api.post(
                "/moment/create",
                {
                    user_id: props.userId,
                    moment: {
                        description: props.description || null,
                        midia: {
                            content_type: "VIDEO",
                            base64: base64Video,
                        },
                        metadata: {
                            duration: props.videoMetadata.duration,
                            file_size: compressedSize,
                            file_type: props.videoMetadata.mimeType,
                        },
                    },
                },
                {
                    headers: { Authorization: props.jwtToken },
                    signal: props.signal,
                },
            )
            return response.data
        } catch (error: any) {
            const errPayload = error?.response?.data ?? error?.message ?? error
            console.error("shareMoment error:", errPayload)
            throw error
        }
    } finally {
        props.signal?.removeEventListener("abort", onSignalAbort)
    }
}

import api from "@/api"
import * as FileSystem from "expo-file-system/legacy"
import { Video } from "react-native-compressor"

export interface uploadMomentInterface {
    description: string | null
    userId: number | string
    videoMetadata: {
        mimeType: string
        duration?: number
    }
    videoPath: string
    jwtToken: string
}

// Same endpoint + body shape as `src/contexts/newMoment.tsx#uploadMoment` —
// the canonical working uploader in this project. `/moment/create` accepts
// larger payloads than `/moments`. The 480p+800Kbps compression stays as a
// belt-and-suspenders measure so requests are small regardless.
const COMPRESSION_MAX_SIZE = 480
const COMPRESSION_BITRATE_BPS = 800_000

export async function uploadMoment(props: uploadMomentInterface) {
    const fileUri = props.videoPath.startsWith("file://")
        ? props.videoPath
        : `file://${props.videoPath}`

    const compressedUri = await Video.compress(fileUri, {
        compressionMethod: "manual",
        maxSize: COMPRESSION_MAX_SIZE,
        bitrate: COMPRESSION_BITRATE_BPS,
        minimumFileSizeForCompress: 0,
    })

    const compressedInfo = await FileSystem.getInfoAsync(compressedUri)
    const compressedSize = (compressedInfo as { size?: number }).size ?? 0

    const base64Video = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
    })

    console.log(
        `[uploadMoment] compressed ${(compressedSize / 1024).toFixed(1)} KB → base64 ${(base64Video.length / 1024).toFixed(1)} KB`,
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
            { headers: { Authorization: props.jwtToken } },
        )
        return response.data
    } catch (error: any) {
        const errPayload = error?.response?.data ?? error?.message ?? error
        console.error("uploadMoment error:", errPayload)
        throw error
    }
}

import api from "@/services/Api"
import DeviceInfo from "react-native-device-info"
import { Dimensions, PixelRatio } from "react-native"
import * as FileSystem from "expo-file-system"

export interface uploadMomentInterface {
    description: string | null
    videoMetadata: {
        filename: string
        mimeType: string
        size: number
    }
    videoPath: string
    jwtToken: string
}

export async function uploadMoment(props: uploadMomentInterface) {
    const { width: dpW, height: dpH } = Dimensions.get("screen")
    const scale = PixelRatio.get()
    const screenResolution = `${Math.round(dpW * scale)}x${Math.round(dpH * scale)}`

    // Garantir URI com prefixo file://
    const fileUri = props.videoPath.startsWith("file://")
        ? props.videoPath
        : `file://${props.videoPath}`

    console.log("🔄 Convertendo vídeo para base64 em uploadMoment...")
    console.log("Path do vídeo:", fileUri)

    // Converter vídeo para base64 usando expo-file-system
    const base64Video = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    })

    console.log("✅ Vídeo convertido para base64! Tamanho:", base64Video.length)

    // Montar data URI com base64
    const videoData = `data:${props.videoMetadata.mimeType};base64,${base64Video}`

    try {
        const authHeader = props.jwtToken?.startsWith("Bearer ")
            ? props.jwtToken
            : `Bearer ${props.jwtToken}`

        const body = {
            description: props.description ? props.description : null,
            visibility: "public",
            ageRestriction: false,
            contentWarning: false,
            videoMetadata: props.videoMetadata,
            device: {
                type: "mobile",
                os: DeviceInfo.getSystemName(),
                osVersion: DeviceInfo.getSystemVersion(),
                model: DeviceInfo.getModel(),
                screenResolution: screenResolution,
                appVersion: DeviceInfo.getVersion(),
                orientation: "portrait",
            },
            videoData: videoData,
        }
        console.log(body)

        const response = await api.post("/moments", body, {
            headers: { Authorization: authHeader },
        })
        return response.data
    } catch (error: any) {
        const errPayload = error?.response?.data ?? error?.message ?? error
        console.error("uploadMoment error:", errPayload)
        throw error
    }
}

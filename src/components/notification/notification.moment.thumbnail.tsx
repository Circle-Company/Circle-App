import React from "react"
import { View, ViewStyle } from "react-native"
import { Image } from "expo-image"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import type { NotificationPayload } from "@/contexts/push.notification"

// Retângulo na proporção do moment (vertical), alinhado à altura da linha.
const THUMBNAIL_HEIGHT = sizes.sizes["3md"] * 1.2
const THUMBNAIL_WIDTH = THUMBNAIL_HEIGHT / sizes.moment.aspectRatio

/**
 * A thumbnail chega achatada no push (`momentThumbnailUrl`) e pode vir aninhada
 * na listagem do backend — por isso a leitura tolerante às duas formas.
 */
export function getMomentThumbnailUrl(item: NotificationPayload): string | null {
    const raw = item as unknown as Record<string, any>
    const url =
        raw?.momentThumbnailUrl ?? raw?.moment?.thumbnailUrl ?? raw?.moment?.thumbnail ?? null
    return typeof url === "string" && url.length > 0 ? url : null
}

export function NotificationMomentThumbnail({ url }: { url: string }) {
    const container: ViewStyle = {
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        marginLeft: sizes.margins["2sm"],
        borderRadius: sizes.borderRadius["1sm"] * 0.8,
        backgroundColor: colors.gray.grey_08,
        overflow: "hidden",
    }

    return (
        <View style={container}>
            <Image
                source={{ uri: url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
            />
        </View>
    )
}

export default NotificationMomentThumbnail

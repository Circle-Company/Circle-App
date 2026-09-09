import fonts from "@/constants/fonts"
import { MessageSizeProps } from "./message.types"

/**
 * Presets de tamanho da bolha, no mesmo espírito de `sizes.moment.*`:
 * o componente nunca calcula geometria à mão, escolhe um preset.
 */
export const messageSizes: Record<"compact" | "standart" | "large", MessageSizeProps> = {
    compact: {
        maxWidthRatio: 0.7,
        padding: 8,
        borderRadius: 14,
        borderRadiusTight: 5,
        avatarSize: 26,
        gap: 5,
        fontSize: fonts.size.footnote,
    },
    standart: {
        maxWidthRatio: 0.78,
        padding: 10,
        borderRadius: 18,
        borderRadiusTight: 6,
        avatarSize: 34,
        gap: 6,
        fontSize: fonts.size.callout,
    },
    large: {
        maxWidthRatio: 0.85,
        padding: 12,
        borderRadius: 22,
        borderRadiusTight: 8,
        avatarSize: 40,
        gap: 8,
        fontSize: fonts.size.headline,
    },
}

export default messageSizes

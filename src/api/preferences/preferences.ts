import api from "@/api"
import { SetLanguageProps, SetHapticsProps } from "./preferences.types"

async function setLanguage({ appLanguage }: SetLanguageProps): Promise<void> {
    await api.put("/account/language", {
        language: appLanguage,
    })
}

async function setHaptics({ disableHaptics }: SetHapticsProps): Promise<void> {
    await api.put("/account/haptic-feedback", {
        hapticFeedback: disableHaptics,
    })
}

export const routes = {
    language: {
        setLanguage,
    },
    content: {
        setHaptics,
    },
}

import api from "@/api"
import { storage, storageKeys } from "@/store"
import { SetLanguageProps, SetHapticsProps } from "./preferences.types"

async function setLanguage({ userId, appLanguage }: SetLanguageProps): Promise<void> {
    await api.put(
        "/account/language",
        {
            language: appLanguage,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

async function setHaptics({ disableHaptics }: SetHapticsProps): Promise<void> {
    await api.put(
        "/account/haptic-feedback",
        {
            hapticFeedback: disableHaptics,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

export const routes = {
    language: {
        setLanguage,
    },
    content: {
        setHaptics,
    },
}

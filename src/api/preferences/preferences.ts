import api from "@/api"
import { storage, storageKeys } from "@/store"
import { SetLanguageProps, SetHapticsProps } from "./preferences.types"

async function setLanguage({ userId, appLanguage }: SetLanguageProps): Promise<void> {
    await api.put(
        "/preferences/app-language",
        {
            user_id: userId,
            app_language: appLanguage,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        },
    )
}

async function setHaptics({ userId, disableHaptics }: SetHapticsProps): Promise<void> {
    await api.put(
        "/preferences/haptics",
        {
            user_id: userId,
            disable_haptics: disableHaptics,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
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

import api from "../.."
import { storage, storageKeys } from "../../../../store"
import {
    GetUserPreferencesProps,
    SetAddToMemoryProps,
    SetAppLanguageProps,
    SetFollowUserProps,
    SetHapticsProps,
    SetLikeMomentProps,
    SetNewMemoryProps,
    SetViewUserProps,
} from "./types"

async function getUserPreferences({ userId }: GetUserPreferencesProps): Promise<any> {
    return await api.get(`/preferences/get/${userId}`, {
        headers: { Authorization: storage.getString(storageKeys().account.jwt.token) || "" },
    })
}

async function setAppLanguage({ userId, appLanguage }: SetAppLanguageProps): Promise<void> {
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
        }
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
        }
    )
}

async function setLikeMoment({ userId, disableLikeMoment }: SetLikeMomentProps): Promise<void> {
    await api.put(
        "/preferences/push-notification/like-moment",
        {
            user_id: userId,
            disable_like_moment_push_notification: disableLikeMoment,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function setNewMemory({ userId, disableNewMemory }: SetNewMemoryProps): Promise<void> {
    await api.put(
        "/preferences/push-notification/new-memory",
        {
            user_id: userId,
            disable_new_memory_push_notification: disableNewMemory,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function setAddToMemory({ userId, disableAddToMemory }: SetAddToMemoryProps): Promise<void> {
    await api.put(
        "/preferences/push-notification/add-to-memory",
        {
            user_id: userId,
            disable_add_to_memory_push_notification: disableAddToMemory,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function setFollowUser({ userId, disableFollowUser }: SetFollowUserProps): Promise<void> {
    await api.put(
        "/preferences/push-notification/follow-user",
        {
            user_id: userId,
            disable_follow_user_push_notification: disableFollowUser,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function setViewUser({ userId, disableViewUser }: SetViewUserProps): Promise<void> {
    await api.put(
        "/preferences/push-notification/view-user",
        {
            user_id: userId,
            disable_view_user_push_notification: disableViewUser,
        },
        {
            headers: {
                Authorization: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

export const routes = {
    language: {
        setAppLanguage,
    },
    content: {
        setHaptics,
    },
    pushNotification: {
        getUserPreferences,
        setLikeMoment,
        setNewMemory,
        setAddToMemory,
        setFollowUser,
        setViewUser,
    },
}

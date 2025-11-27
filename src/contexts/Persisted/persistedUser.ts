import { SessionUser, UserDataType } from "./types"
import { storage, storageKeys } from "../../store"

import { create } from "zustand"

const storageKey = storageKeys().user

type LegacyProfilePicture = {
    small_resolution: string
    tiny_resolution: string
}

export interface UserState extends SessionUser {
    profile_picture: LegacyProfilePicture
    set: (value: UserDataType) => void
    load: () => void
    remove: () => void
}

const buildLegacyProfilePicture = (profilePicture: string | null): LegacyProfilePicture => ({
    small_resolution: profilePicture ?? "",
    tiny_resolution: profilePicture ?? "",
})

const emptyUser: Partial<UserState> = {
    id: "",
    username: "",
    name: "",
    description: "",
    richDescription: "",
    isVerified: false,
    isActive: false,
    profilePicture: null,
    profile_picture: buildLegacyProfilePicture(null),
}

const readFromStorage = (): Partial<UserState> => {
    const profilePicture = storage.getString(storageKey.profile_picture.small) || null

    return {
        id: storage.getString(storageKey.id) || "",
        username: storage.getString(storageKey.username) || "",
        name: storage.getString(storageKey.name) || "",
        description: storage.getString(storageKey.description) || "",
        richDescription: storage.getString(storageKey.description + ":rich") || "",
        isVerified: storage.getBoolean(storageKey.verified) || false,
        isActive: storage.getBoolean(storageKey.verified + ":active") || false,
        profilePicture,
        profile_picture: buildLegacyProfilePicture(profilePicture),
    }
}

export const useUserStore = create<UserState>((set) => ({
    ...(readFromStorage() as UserState),

    set: (value: UserDataType) => {
        const profilePicture = value.profilePicture ?? null

        storage.set(storageKey.id, value.id)
        storage.set(storageKey.username, value.username)
        storage.set(storageKey.name, value.name ?? "")
        storage.set(storageKey.description, value.description ?? "")
        storage.set(storageKey.description + ":rich", value.richDescription ?? "")
        storage.set(storageKey.verified, value.isVerified ?? false)
        storage.set(storageKey.verified + ":active", value.isActive ?? false)

        if (profilePicture) {
            storage.set(storageKey.profile_picture.small, profilePicture)
        } else {
            storage.delete(storageKey.profile_picture.small)
        }

        set({
            id: value.id,
            username: value.username,
            name: value.name ?? "",
            description: value.description ?? "",
            richDescription: value.richDescription ?? "",
            isVerified: value.isVerified ?? false,
            isActive: value.isActive ?? false,
            profilePicture,
            profile_picture: buildLegacyProfilePicture(profilePicture),
        })
    },
    load: () => {
        set(readFromStorage())
    },
    remove: () => {
        storage.delete(storageKey.id)
        storage.delete(storageKey.username)
        storage.delete(storageKey.name)
        storage.delete(storageKey.description)
        storage.delete(storageKey.description + ":rich")
        storage.delete(storageKey.verified)
        storage.delete(storageKey.verified + ":active")
        storage.delete(storageKey.profile_picture.small)

        set(emptyUser)
    },
}))

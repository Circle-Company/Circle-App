import { SessionUser, UserDataType } from "./types"
import { storage, storageKeys, safeSet, safeDelete } from "@/store"
import { textLib } from "@/circle.text.library"
import { create } from "zustand"

const key = storageKeys().user

export interface UserState extends SessionUser {
    set: (value: UserDataType) => void
    load: () => void
    remove: () => void
}

const read = (): Partial<UserState> => {
    return {
        id: storage.getString(key.id) || "",
        username: storage.getString(key.username) || "",
        name: storage.getString(key.name) || "",
        description: storage.getString(key.description) || "",
        richDescription: storage.getString(key.richDescription) || "",
        isVerified: storage.getBoolean(key.verified) || false,
        isActive: storage.getBoolean(key.active) || false,
        profilePicture: storage.getString(key.profilePicture) || "",
    }
}

export const useUserStore = create<UserState>((set) => ({
    ...(read() as UserState),

    set: (value: UserDataType) => {
        set({
            id: value.id,
            username: value.username,
            name: value.name ?? "",
            description: value.description ? textLib.rich.formatToNormal(value.description) : "",
            richDescription: value.richDescription ?? "",
            isVerified: value.isVerified ?? false,
            isActive: value.isActive ?? false,
            profilePicture: value.profilePicture ?? "",
        })

        safeSet(key.id, value.id)
        safeSet(key.username, value.username)
        safeSet(key.name, value.name)
        safeSet(key.description, value.description)
        safeSet(key.richDescription, value.richDescription)
        safeSet(key.verified, value.isVerified)
        safeSet(key.active, value.isActive)
        safeSet(key.profilePicture, value.profilePicture)
    },
    load: () => {
        set(read())
    },
    remove: () => {
        safeDelete(key.id)
        safeDelete(key.username)
        safeDelete(key.name)
        safeDelete(key.description)
        safeDelete(key.richDescription)
        safeDelete(key.verified)
        safeDelete(key.active)
        safeDelete(key.profilePicture)

        set({
            id: "",
            username: "",
            name: "",
            description: "",
            richDescription: "",
            isVerified: false,
            isActive: false,
            profilePicture: "",
        })
    },
}))

import create from "zustand"
import api from "@/services/Api"
import { storage, storageKeys } from "@/store"
import { UserDataType } from "./types"
const storageKey = storageKeys().user

export interface UserState {
    id: string
    name: string
    username: string
    description: string
    verifyed: boolean
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    setId: (value: string) => void
    setName: (value: string) => void
    setUsername: (value: string) => void
    setDescription: (value: string) => void
    setVerifyed: (value: boolean) => void
    setProfilePicture: (value: { small_resolution: string; tiny_resolution: string }) => void
    set: (value: UserDataType) => void
    get: (id: number) => Promise<UserState>
    load: () => void
    remove: () => void
}

export const useUserStore = create<UserState>((set) => ({
    id: storage.getString(storageKey.id) || "",
    name: storage.getString(storageKey.name) || "",
    username: storage.getString(storageKey.username) || "",
    description: storage.getString(storageKey.description) || "",
    verifyed: storage.getBoolean(storageKey.verifyed) || false,
    profile_picture: {
        small_resolution: storage.getString(storageKey.profile_picture.small) || "",
        tiny_resolution: storage.getString(storageKey.profile_picture.tiny) || "",
    },

    setId: (value: string) => {
        storage.set(storageKey.id, value)
        set({ id: value })
    },
    setName: (value: string) => {
        storage.set(storageKey.name, value)
        set({ name: value })
    },
    setUsername: (value: string) => {
        storage.set(storageKey.username, value)
        set({ username: value })
    },
    setDescription: (value: string) => {
        storage.set(storageKey.description, value)
        set({ description: value })
    },
    setVerifyed: (value: boolean) => {
        storage.set(storageKey.verifyed, value)
        set({ verifyed: value })
    },
    setProfilePicture: (value: { small_resolution: string; tiny_resolution: string }) => {
        storage.set(storageKey.profile_picture.small, value.small_resolution)
        storage.set(storageKey.profile_picture.tiny, value.tiny_resolution)
        set({ profile_picture: value })
    },
    get: async (id: number) => {
        try {
            const response = await api
                .post(
                    `/user/session/data/pk/${id}`,
                    { user_id: id.toString() },
                    {
                        headers: {
                            Authorization: storage.getString(storageKeys().account.jwt.token),
                        },
                    }
                )
                .then(function (response) {
                    const user = response.data
                    set({
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        description: user.description,
                        verifyed: user.verifyed,
                        profile_picture: user.profile_picture,
                    })
                    if (user.id) storage.set(storageKey.id, user.id)
                    if (user.name) storage.set(storageKey.name, user.name)
                    if (user.username) storage.set(storageKey.username, user.username)
                    if (user.description) storage.set(storageKey.description, user.description)
                    if (user.verifyed) storage.set(storageKey.verifyed, user.verifyed)
                    if (user.profile_picture.small_resolution)
                        storage.set(
                            storageKey.profile_picture.small,
                            user.profile_picture.small_resolution
                        )
                    if (user.profile_picture.tiny_resolution)
                        storage.set(
                            storageKey.profile_picture.tiny,
                            user.profile_picture.tiny_resolution
                        )
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
            return response
        } catch (err) {
            console.error(err)
        }
    },
    set: (value: UserDataType) => {
        set({
            id: value.id,
            name: value.name,
            username: value.username,
            description: value.description,
            verifyed: value.verifyed,
            profile_picture: value.profile_picture,
        })
        if (value.id) storage.set(storageKey.id, value.id)
        if (value.name) storage.set(storageKey.name, value.name)
        if (value.username) storage.set(storageKey.username, value.username)
        if (value.description) storage.set(storageKey.description, value.description)
        if (value.verifyed) storage.set(storageKey.verifyed, value.verifyed)
        if (value.profile_picture.small_resolution)
            storage.set(storageKey.profile_picture.small, value.profile_picture.small_resolution)
        if (value.profile_picture.tiny_resolution)
            storage.set(storageKey.profile_picture.tiny, value.profile_picture.tiny_resolution)
    },
    load: () => {
        set({
            id: storage.getString(storageKey.id) || "",
            name: storage.getString(storageKey.name) || "",
            username: storage.getString(storageKey.username) || "",
            description: storage.getString(storageKey.description) || "",
            verifyed: storage.getBoolean(storageKey.verifyed) || false,
            profile_picture: {
                small_resolution: storage.getString(storageKey.profile_picture.small) || "",
                tiny_resolution: storage.getString(storageKey.profile_picture.tiny) || "",
            },
        })
    },
    remove: () => {
        storage.delete(storageKey.id)
        storage.delete(storageKey.name)
        storage.delete(storageKey.username)
        storage.delete(storageKey.description)
        storage.delete(storageKey.verifyed)
        storage.delete(storageKey.profile_picture.small)
        storage.delete(storageKey.profile_picture.tiny)

        set({
            id: "",
            name: "",
            username: "",
            description: "",
            verifyed: false,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
        })
    },
}))

import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"

const storageKey = storageKeys().user

export class persistedUserClass {
    public id: Number
    public username: String
    public verifyed: Boolean
    public profile_picture: {
        small_resolution: String
        tiny_resolution: String
    }

    constructor({
        id,
        username,
        verifyed,
        profile_picture
    }: userReciveDataProps) {
        this.id = id
        this.username = username
        this.verifyed = verifyed
        this.profile_picture = profile_picture
    }

    public setId(value: number) {
        this.id = value
        storage.set(storageKey.id, value)
    }
    public setUsername(value: string) {
        this.username = value
        storage.set(storageKey.username, value)
    }
    public setVerifyed(value: boolean) {
        this.verifyed = value
        storage.set(storageKey.verifyed, value)
    }
    public setProfilePicture(value: {
        small_resolution: String
        tiny_resolution: String
    } ) {
        this.profile_picture = value
        storage.set(storageKey.id, JSON.stringify(value))
    }

    public storeUser(value: userReciveDataProps) {
        this.setId(value.id)
        this.setUsername(value.username)
        this.setVerifyed(value.verifyed)
        this.setProfilePicture(value.profile_picture)
    }

    public loadUserFromStorage() {
        const id = storage.getNumber(storageKey.id)
        const username = storage.getString(storageKey.username)
        const verifyed = storage.getBoolean(storageKey.verifyed)
        const profile_picture = storage.getString(storageKey.profile_picture)
        if(id) this.id = id
        if(username) this.username = username
        if(verifyed) this.verifyed = verifyed
        if(profile_picture) this.profile_picture = JSON.parse(profile_picture)
    }

    public removeUserFromStorage() {
        storage.delete(storageKey.id)
        storage.delete(storageKey.username)
        storage.delete(storageKey.verifyed)
        storage.delete(storageKey.profile_picture)
    }
}
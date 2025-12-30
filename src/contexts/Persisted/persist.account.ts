import { create } from "zustand"
import { storage, storageKeys, safeDelete, safeSet } from "@/store"
import { AccountDataType, AccountMoment } from "./types"

const key = storageKeys().account

export interface AccountState extends AccountDataType {
    coordinates: {
        latitude: number
        longitude: number
    }
    moments: AccountMoment[]
    totalMoments?: number
    setMoments: (value: AccountMoment[]) => void
    setTotalMoments: (value: number) => void
    setCoordinates: (value: { latitude: number; longitude: number }) => void
    set: (value: AccountDataType) => void
    load: () => void
    remove: () => void
}

const read = (): AccountDataType & {
    coordinates: { latitude: number; longitude: number }
    moments: AccountMoment[]
    totalMoments?: number
} => {
    let moments: AccountMoment[] = []

    const momentsJson = storage.getString(key.moments) || null
    const totalMoments = storage.getNumber(key.totalMoments) || 0
    const terms = {
        agreed: storage.getBoolean(key.terms?.agreed) || false,
        version: storage.getString(key.terms?.version) || "",
        agreedAt: storage.getString(key.terms?.agreedAt) || "",
    }
    if (momentsJson) {
        try {
            moments = JSON.parse(momentsJson)
        } catch (error) {
            console.error(error)
            moments = []
        }
    }

    return {
        jwtToken: storage.getString(key.jwt.token) || "",
        jwtExpiration: storage.getString(key.jwt.expiration) || "",
        refreshToken: storage.getString(key.jwt.refreshToken) || undefined,
        blocked: storage.getBoolean(key.blocked) || false,
        accessLevel: storage.getString(key.accessLevel) || "",
        verified: storage.getBoolean(key.verified) || false,
        deleted: storage.getBoolean(key.deleted) || false,
        coordinates: {
            latitude: storage.getNumber(key.coordinates.latitude) || 0,
            longitude: storage.getNumber(key.coordinates.longitude) || 0,
        },
        moments,
        totalMoments,
        terms,
    }
}

export const useAccountStore = create<AccountState>((set) => ({
    ...read(),
    set: (value: AccountDataType) => {
        safeSet(key.jwt.token, value.jwtToken)
        safeSet(key.jwt.expiration, value.jwtExpiration)
        safeSet(key.jwt.refreshToken, value.refreshToken)
        safeSet(key.blocked, value.blocked)
        safeSet(key.accessLevel, value.accessLevel || "")
        safeSet(key.verified, value.verified || false)
        safeSet(key.deleted, value.deleted || false)
        safeSet(key.terms.agreed, value.terms ? value.terms.agreed : false)
        safeSet(key.terms.version, value.terms ? value.terms.version : "")
        safeSet(key.terms.agreedAt, value.terms ? value.terms.agreedAt : "")

        set((state) => ({
            ...state,
            ...value,
        }))
    },
    setMoments: (value: AccountMoment[]) => {
        storage.set(key.moments, JSON.stringify(value))
        set((state) => ({
            ...state,
            moments: value,
        }))
    },
    setTotalMoments: (value: number) => {
        storage.set(key.totalMoments, value)
        set((state) => ({
            ...state,
            totalMoments: value,
        }))
    },
    setCoordinates: (value: { latitude: number; longitude: number }) => {
        storage.set(key.coordinates.latitude, value.latitude)
        storage.set(key.coordinates.longitude, value.longitude)
        set((state) => ({
            ...state,
            coordinates: { ...value },
        }))
    },
    load: () => {
        set(read())
    },
    remove: () => {
        safeDelete(key.jwt.token)
        safeDelete(key.jwt.expiration)
        safeDelete(key.jwt.refreshToken)
        safeDelete(key.blocked)
        safeDelete(key.coordinates.latitude)
        safeDelete(key.coordinates.longitude)
        safeDelete(key.moments)
        safeDelete(key.accessLevel)
        safeDelete(key.verified)
        safeDelete(key.deleted)
        if (key.terms) {
            safeDelete(key.terms.agreed)
            safeDelete(key.terms.version)
            safeDelete(key.terms.agreedAt)
        }

        set({
            jwtToken: "",
            jwtExpiration: "",
            refreshToken: undefined,
            blocked: false,
            accessLevel: "USER",
            verified: false,
            deleted: false,
            moments: [],
            coordinates: { latitude: 0, longitude: 0 },
            terms: { agreed: false, version: "", agreedAt: "" },
        })
    },
}))

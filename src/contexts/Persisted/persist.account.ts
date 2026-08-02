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
    hiddenMoments: string[]
    // Ids dos momentos curtidos por esta conta. Fonte única do estado do botão
    // de like, para ele continuar marcado ao navegar entre feed, perfil e
    // detalhe do momento — e sobreviver ao fechamento do app.
    likedMoments: string[]
    // Ids de notificações já lidas. O backend só expõe "marcar todas como
    // lidas", então este conjunto local é o que preserva a leitura por item
    // entre aberturas do app.
    readNotifications: string[]
    totalMoments?: number
    setMoments: (value: AccountMoment[]) => void
    setTotalMoments: (value: number) => void
    setHiddenMoments: (value: string[]) => void
    addHiddenMoment: (id: string) => void
    removeHiddenMoment: (id: string) => void
    setLikedMoments: (value: string[]) => void
    addLikedMoment: (id: string) => void
    removeLikedMoment: (id: string) => void
    addReadNotifications: (ids: string[]) => void
    setCoordinates: (value: { latitude: number; longitude: number }) => void
    set: (value: AccountDataType) => void
    load: () => void
    remove: () => void
}

const parseIdList = (json: string | null): string[] => {
    if (!json) return []
    try {
        const parsed = JSON.parse(json)
        return Array.isArray(parsed) ? Array.from(new Set(parsed.map((v: any) => String(v)))) : []
    } catch (error) {
        console.error(error)
        return []
    }
}

const read = (): AccountDataType & {
    coordinates: { latitude: number; longitude: number }
    moments: AccountMoment[]
    hiddenMoments: string[]
    likedMoments: string[]
    readNotifications: string[]
    totalMoments?: number
} => {
    let moments: AccountMoment[] = []
    let hiddenMoments: string[] = []

    const momentsJson = storage.getString(key.moments) || null
    const hiddenJson = storage.getString(key.hiddenMoments) || null
    const likedMoments = parseIdList(storage.getString(key.likedMoments) || null)
    const readNotifications = parseIdList(storage.getString(key.readNotifications) || null)
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
    if (hiddenJson) {
        try {
            const parsed = JSON.parse(hiddenJson)
            hiddenMoments = Array.isArray(parsed)
                ? Array.from(new Set(parsed.map((v: any) => String(v))))
                : []
        } catch (error) {
            console.error(error)
            hiddenMoments = []
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
        hiddenMoments,
        likedMoments,
        readNotifications,
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
    setHiddenMoments: (value: string[]) => {
        const normalized = Array.isArray(value)
            ? Array.from(new Set(value.map((v: any) => String(v))))
            : []
        storage.set(key.hiddenMoments, JSON.stringify(normalized))
        set((state) => ({
            ...state,
            hiddenMoments: normalized,
        }))
    },
    addHiddenMoment: (id: string) => {
        set((state) => {
            const sid = String(id)
            const base = Array.isArray(state.hiddenMoments) ? state.hiddenMoments : []
            const normalized = Array.from(new Set(base.map((v: any) => String(v))))
            if (!normalized.includes(sid)) normalized.push(sid)
            storage.set(key.hiddenMoments, JSON.stringify(normalized))
            return { ...state, hiddenMoments: normalized }
        })
    },
    removeHiddenMoment: (id: string) => {
        set((state) => {
            const sid = String(id)
            const base = Array.isArray(state.hiddenMoments) ? state.hiddenMoments : []
            const next = base.map((m: any) => String(m)).filter((m) => m !== sid)
            storage.set(key.hiddenMoments, JSON.stringify(next))
            return { ...state, hiddenMoments: next }
        })
    },
    setLikedMoments: (value: string[]) => {
        const normalized = Array.isArray(value)
            ? Array.from(new Set(value.map((v: any) => String(v))))
            : []
        storage.set(key.likedMoments, JSON.stringify(normalized))
        set((state) => ({
            ...state,
            likedMoments: normalized,
        }))
    },
    addLikedMoment: (id: string) => {
        set((state) => {
            const sid = String(id)
            const base = Array.isArray(state.likedMoments) ? state.likedMoments : []
            const normalized = Array.from(new Set(base.map((v: any) => String(v))))
            if (normalized.includes(sid)) return state
            normalized.push(sid)
            storage.set(key.likedMoments, JSON.stringify(normalized))
            return { ...state, likedMoments: normalized }
        })
    },
    removeLikedMoment: (id: string) => {
        set((state) => {
            const sid = String(id)
            const base = Array.isArray(state.likedMoments) ? state.likedMoments : []
            const next = base.map((v: any) => String(v)).filter((v) => v !== sid)
            if (next.length === base.length) return state
            storage.set(key.likedMoments, JSON.stringify(next))
            return { ...state, likedMoments: next }
        })
    },
    addReadNotifications: (ids: string[]) => {
        set((state) => {
            const base = Array.isArray(state.readNotifications) ? state.readNotifications : []
            const merged = Array.from(new Set([...base, ...ids.map((v) => String(v))]))
            if (merged.length === base.length) return state
            storage.set(key.readNotifications, JSON.stringify(merged))
            return { ...state, readNotifications: merged }
        })
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
        safeDelete(key.hiddenMoments)
        safeDelete(key.likedMoments)
        safeDelete(key.readNotifications)
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
            hiddenMoments: [],
            likedMoments: [],
            readNotifications: [],
            coordinates: { latitude: 0, longitude: 0 },
            terms: { agreed: false, version: "", agreedAt: "" },
        })
    },
}))

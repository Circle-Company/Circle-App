import create from "zustand"
import { storage, storageKeys } from "../../store"
import { HistoryDataStorageType } from "./types"
const storageKey = storageKeys().history

export interface HistoryState extends HistoryDataStorageType {
    set: (value: HistoryDataStorageType) => void
    load: () => void
    remove: () => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
    search: storage.getString(storageKey.search)
        ? JSON.parse(String(storage.getString(storageKey.search)))
        : [],
    set: (value: HistoryDataStorageType) => {
        set({
            search: value.search,
        })
        storage.set(storageKey.search, JSON.stringify(value.search))
    },
    load: () => {
        set({
            search: storage.getString(storageKey.search)
                ? JSON.parse(String(storage.getString(storageKey.search)))
                : [],
        })
    },
    remove: () => {
        storage.delete(storageKey.search)

        set({
            search: [],
        })
    },
}))

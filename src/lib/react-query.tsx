import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { focusManager, QueryClient } from "@tanstack/react-query"
import {
    PersistQueryClientProvider,
    PersistQueryClientProviderProps,
} from "@tanstack/react-query-persist-client"
import React, { useState } from "react"
import { AppState, AppStateStatus } from "react-native"
import { MMKV } from "react-native-mmkv"
import PersistedContext from "../contexts/Persisted"

// Keys que serão persistidas
export const labelersDetailedInfoQueryKeyRoot = "labelers-detailed-info"
const STORED_CACHE_QUERY_KEY_ROOTS = [labelersDetailedInfoQueryKeyRoot]

// Foco React Query baseado no estado do App
focusManager.setEventListener((onFocus) => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
        onFocus(status === "active")
    })
    return () => subscription.remove()
})

// Criação do QueryClient
const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                structuralSharing: false,
                retry: false,
            },
        },
    })

// Opções de desidratação
const dehydrateOptions: PersistQueryClientProviderProps["persistOptions"]["dehydrateOptions"] = {
    shouldDehydrateMutation: () => false,
    shouldDehydrateQuery: (query) => {
        return STORED_CACHE_QUERY_KEY_ROOTS.includes(String(query.queryKey[0]))
    },
}

// Instância do MMKV
const mmkv = new MMKV()

// Wrapper para MMKV compatível com AsyncStorage
const mmkvAsyncStorage = {
    getItem: async (key: string) => {
        const value = mmkv.getString(key)
        return value ?? null
    },
    setItem: async (key: string, value: string) => {
        mmkv.set(key, value)
    },
    removeItem: async (key: string) => {
        mmkv.delete(key)
    },
}

// QueryProvider
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const { session } = React.useContext(PersistedContext)
    const userId = session?.user?.id ?? "logged-out"

    return (
        <QueryProviderInner
            // força recriar cache ao trocar de usuário
            key={userId}
            userId={userId}
        >
            {children}
        </QueryProviderInner>
    )
}

function QueryProviderInner({
    children,
    userId,
}: {
    children: React.ReactNode
    userId: string | number
}) {
    const [queryClient] = useState(() => createQueryClient())

    const [persistOptions] = useState(() => {
        const asyncPersister = createAsyncStoragePersister({
            storage: mmkvAsyncStorage,
            key: `queryClient-${userId}`,
        })
        return {
            persister: asyncPersister,
            dehydrateOptions,
        }
    })

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            {children}
        </PersistQueryClientProvider>
    )
}

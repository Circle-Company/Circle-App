import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { focusManager, QueryClient } from "@tanstack/react-query"
import {
    PersistQueryClientProvider,
    PersistQueryClientProviderProps,
} from "@tanstack/react-query-persist-client"
import React, { useState } from "react"
import { AppState, AppStateStatus } from "react-native"
import { BASE_KEY, storage, type ScopedKey } from "../store"
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

// Instância do MMKV (compartilhada via src/store/index.ts)
const mmkv = storage

/**
 * Wrapper para MMKV compatível com AsyncStorage.
 *
 * As chaves são `ScopedKey`: quem chama é o persister do React Query, e a chave que ele usa
 * é montada logo abaixo, sob o prefixo do app. O cast interno existe porque a interface do
 * persister declara `string` — é aqui que a garantia entra, não do lado dele.
 */
const mmkvAsyncStorage = {
    getItem: async (key: string) => {
        const value = mmkv.getString(key as ScopedKey)
        return value ?? null
    },
    setItem: async (key: string, value: string) => {
        mmkv.set(key as ScopedKey, value)
    },
    removeItem: async (key: string) => {
        mmkv.remove(key as ScopedKey)
    },
}

// QueryProvider
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const { session } = React.useContext(PersistedContext)
    const userId = session?.account?.userId ?? "logged-out"

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
            /*
             * A chave era `queryClient-${userId}`, **sem o prefixo `@circle:`**. Como todas
             * as limpezas varrem por prefixo (`clearSessionDataPreservingTutorial`,
             * `clearUserScopedData`), o cache persistido do React Query — que contém dado de
             * servidor do usuário — nunca era apagado no logout e ficava no aparelho para
             * sempre. É a mesma falha que o `migrateUnprefixedProfilePicture` existe para
             * reparar, e foi o tipo `ScopedKey` que a trouxe à tona.
             *
             * Trocar a chave custa um cold start com o cache vazio na primeira abertura após
             * a atualização; o que ficou gravado na chave antiga não é mais lido.
             */
            key: `${BASE_KEY}queryClient:${userId}`,
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

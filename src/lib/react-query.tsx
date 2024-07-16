import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { focusManager, QueryClient } from "@tanstack/react-query"
import {
    PersistQueryClientProvider,
    PersistQueryClientProviderProps,
} from "@tanstack/react-query-persist-client"
import React, { useRef, useState } from "react"
import { AppState, AppStateStatus } from "react-native"
import PersistedContext from "../contexts/Persisted"
// any query keys in this array will be persisted to AsyncStorage
export const labelersDetailedInfoQueryKeyRoot = "labelers-detailed-info"
const STORED_CACHE_QUERY_KEY_ROOTS = [labelersDetailedInfoQueryKeyRoot]

focusManager.setEventListener((onFocus) => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
        focusManager.setFocused(status === "active")
    })

    return () => subscription.remove()
})

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                // NOTE
                // refetchOnWindowFocus breaks some UIs (like feeds)
                // so we only selectively want to enable this
                // -prf
                refetchOnWindowFocus: false,
                // Structural sharing between responses makes it impossible to rely on
                // "first seen" timestamps on objects to determine if they're fresh.
                // Disable this optimization so that we can rely on "first seen" timestamps.
                structuralSharing: false,
                // We don't want to retry queries by default, because in most cases we
                // want to fail early and show a response to the user. There are
                // exceptions, and those can be made on a per-query basis. For others, we
                // should give users controls to retry.
                retry: false,
            },
        },
    })

const dehydrateOptions: PersistQueryClientProviderProps["persistOptions"]["dehydrateOptions"] = {
    shouldDehydrateMutation: (_: any) => false,
    shouldDehydrateQuery: (query) => {
        return STORED_CACHE_QUERY_KEY_ROOTS.includes(String(query.queryKey[0]))
    },
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const { session } = React.useContext(PersistedContext)
    return (
        <QueryProviderInner
            // Enforce we never reuse cache between users.
            // These two props MUST stay in sync.
            key={session.user.id}
            userId={session.user.id}
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
    userId: number | undefined
}) {
    const initialDid = useRef(userId)
    if (userId !== initialDid.current) {
        throw Error("Something is very wrong. Expected did to be stable due to key above.")
    }
    // We create the query client here so that it's scoped to a specific DID.
    // Do not move the query client creation outside of this component.
    const [queryClient, _setQueryClient] = useState(() => createQueryClient())
    const [persistOptions, _setPersistOptions] = useState(() => {
        const asyncPersister = createAsyncStoragePersister({
            storage: AsyncStorage,
            key: "queryClient-" + (userId ?? "logged-out"),
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

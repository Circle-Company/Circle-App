import React from "react"
import { useAccountQuery, useAccountMomentsQuery } from "@/queries/account"
import PersistedContext, { PersistedContextProps } from "./Persisted"
import { accountProps, momentsProps } from "@/api/account/account.types"

type AccountProviderProps = { children: React.ReactNode }
type pagination = { page: number; limit: number }

export type AccountContextsData = {
    isLoadingAccount: boolean
    isLoadingMoments: boolean
    setIsLoadingAccount: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoadingMoments: React.Dispatch<React.SetStateAction<boolean>>
    account: accountProps["account"]
    moments: momentsProps["moments"]
    getAccount: () => Promise<accountProps["account"]>
    getMoments: ({ page, limit }: pagination) => Promise<momentsProps["moments"]>
}

const AccountContext = React.createContext<AccountContextsData>({} as AccountContextsData)

export function Provider({ children }: AccountProviderProps) {
    const { session } = React.useContext(PersistedContext)

    const [isLoadingAccount, setIsLoadingAccount] = React.useState(false)
    const [isLoadingMoments, setIsLoadingMoments] = React.useState(false)
    const [moments, setMoments] = React.useState<momentsProps["moments"]>(
        [] as momentsProps["moments"],
    )
    const [account, setAccount] = React.useState<accountProps["account"]>(
        {} as accountProps["account"],
    )

    function transformAccountData(
        session: PersistedContextProps["session"],
    ): accountProps["account"] {
        const user = session.user
        const metrics = session.metrics
        return {
            id: user.id,
            username: user.username,
            name: user.name ? user.name : "",
            description: user.description ? user.description : "",
            profilePicture: user.profilePicture ? String(user.profilePicture) : "",
            status: {
                verified: user.isVerified,
            },
            metrics: {
                totalFollowers: Number(metrics.totalFollowers ?? 0),
                totalFollowing: Number(metrics.totalFollowing ?? 0),
                totalLikesReceived: Number(metrics.totalLikesReceived ?? 0),
                totalViewsReceived: Number(metrics.totalViewsReceived ?? 0),
                followerGrowthRate30d: Number(metrics.followerGrowthRate30d ?? 0),
                engagementGrowthRate30d: Number(metrics.engagementGrowthRate30d ?? 0),
                interactionsGrowthRate30d: Number(metrics.interactionsGrowthRate30d ?? 0),
            },
        }
    }

    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(20)

    // React Query hooks
    const {
        data: accountData,
        isLoading: accountLoading,
        isFetching: accountFetching,
        refetch: refetchAccount,
    } = useAccountQuery(session.account.jwtToken, {
        enabled: !!session.account.jwtToken,
        refetchOnMount: true,
    })

    const {
        data: momentsData,
        isLoading: momentsLoading,
        isFetching: momentsFetching,
        refetch: refetchMoments,
    } = useAccountMomentsQuery(session.account.jwtToken, currentPage, pageSize, {
        enabled: !!session.account.jwtToken,
        refetchOnMount: true,
    })

    // Prime local state from persisted session for instant UI feedback
    React.useEffect(() => {
        const accountDataFormated = transformAccountData(session)
        setAccount(accountDataFormated)
        setMoments(session.account.moments)
    }, [])

    // Sync account data from query
    React.useEffect(() => {
        if (accountData) setAccount(accountData as accountProps["account"])
    }, [accountData])

    // Sync moments data from query (append when paginating)
    React.useEffect(() => {
        if (momentsData) {
            if (currentPage === 1) {
                setMoments(momentsData.moments as momentsProps["moments"])
            } else {
                setMoments((prev) => [
                    ...prev,
                    ...((momentsData.moments as momentsProps["moments"]) || []),
                ])
            }
        }
    }, [momentsData, currentPage])

    // Reflect loading states from React Query
    React.useEffect(() => {
        setIsLoadingAccount(accountLoading || accountFetching)
    }, [accountLoading, accountFetching])

    React.useEffect(() => {
        setIsLoadingMoments(momentsLoading || momentsFetching)
    }, [momentsLoading, momentsFetching])

    // Exposed getters using React Query refetch (keeps local state in sync)
    async function getAccount(): Promise<accountProps["account"]> {
        const res = await refetchAccount()
        const acc = (res.data ?? accountData ?? account) as accountProps["account"]
        setAccount(acc)
        return acc
    }

    async function getMoments({ page, limit }: pagination): Promise<momentsProps["moments"]> {
        setPageSize(limit)
        setCurrentPage(page)
        const res = await refetchMoments()
        const list = (res.data?.moments ?? momentsData?.moments ?? []) as momentsProps["moments"]
        if (page === 1) setMoments(list)
        else setMoments((prev) => [...prev, ...list])
        return list
    }

    const contextValue: AccountContextsData = {
        isLoadingAccount,
        isLoadingMoments,
        setIsLoadingAccount,
        setIsLoadingMoments,
        account,
        moments,
        getAccount,
        getMoments,
    }

    return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>
}
export default AccountContext

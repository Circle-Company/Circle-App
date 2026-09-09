import { AccountMoment, AccountBlock } from "@/queries"

export type accountProps = {
    success: boolean
    account: {
        id: string
        username: string
        name: string
        profilePicture: string
        status: {
            verified: boolean
        }
        metrics: {
            totalFollowers: number
            totalFollowing: number
            totalLikesReceived: number
            totalViewsReceived: number
            followerGrowthRate30d: number
            engagementGrowthRate30d: number
            interactionsGrowthRate30d: number
        }
    }
    error?: string
}

export type accountBlocksProps = {
    success: boolean
    blocks: AccountBlock[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    error?: string
}

export type momentsProps = {
    success: boolean
    /**
     * Estava tipado como `Array<AccountMomentsResponse>` — um array de **envelopes**, cada
     * um com `{ moments, pagination }` dentro. `AccountMomentsResponse` descreve a resposta
     * inteira, não um item dela. O erro obrigava um `as` em todo lugar que lia a lista, e
     * era o `as` que escondia a inconsistência.
     */
    moments: AccountMoment[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    error?: string
}

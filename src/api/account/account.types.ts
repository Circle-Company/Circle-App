import { AccountM}

export type accountProps = {
    success: boolean
    account: {
        id: string
        username: string
        name: string
        description: string
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

export type momentsProps = {
    success: boolean
    moments: Array<accountMomentProps>
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    error?: string
}

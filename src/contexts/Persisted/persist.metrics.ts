import { create } from "zustand"
import { storage, storageKeys, safeDelete, safeSet } from "@/store"
import { MetricsDataType } from "./types"

const key = storageKeys().statistics

export interface MetricsState extends MetricsDataType {
    setTotalFollowers: (value: number) => void
    setTotalFollowing: (value: number) => void
    setTotalLikesReceived: (value: number) => void
    setTotalViewsReceived: (value: number) => void
    set: (value: MetricsDataType) => void
    load: () => void
    remove: () => void
}

export const useMetricsStore = create<MetricsState>((set) => ({
    totalFollowers: storage.getNumber(key.totalFollowers) || 0,
    totalFollowing: storage.getNumber(key.totalFollowing) || 0,
    totalLikesReceived: storage.getNumber(key.totalLikes) || 0,
    totalViewsReceived: storage.getNumber(key.totalViews) || 0,
    followerGrowthRate30d: storage.getNumber(key.followerGrowthRate30d) || 0,
    engagementGrowthRate30d: storage.getNumber(key.engagementGrowthRate30d) || 0,
    interactionsGrowthRate30d: storage.getNumber(key.interactionsGrowthRate30d) || 0,

    setTotalFollowers: (value: number) => {
        safeSet(key.totalFollowers, value)
        set({ totalFollowers: value })
    },
    setTotalFollowing: (value: number) => {
        safeSet(key.totalFollowing, value)
        set({ totalFollowing: value })
    },
    setTotalLikesReceived: (value: number) => {
        safeSet(key.totalLikes, value)
        set({ totalLikesReceived: value })
    },
    setTotalViewsReceived: (value: number) => {
        safeSet(key.totalViews, value)
        set({ totalViewsReceived: value })
    },
    set: (value: MetricsDataType) => {
        set({
            totalFollowers: Number(value.totalFollowers ?? 0),
            totalFollowing: Number(value.totalFollowing ?? 0),
            totalLikesReceived: Number(value.totalLikesReceived ?? 0),
            totalViewsReceived: Number(value.totalViewsReceived ?? 0),
            followerGrowthRate30d: Number(value.followerGrowthRate30d ?? 0),
            engagementGrowthRate30d: Number(value.engagementGrowthRate30d ?? 0),
            interactionsGrowthRate30d: Number(value.interactionsGrowthRate30d ?? 0),
        })
        safeSet(key.totalFollowers, Number(value.totalFollowers ?? 0))
        safeSet(key.totalFollowing, Number(value.totalFollowing ?? 0))
        safeSet(key.totalLikes, Number(value.totalLikesReceived ?? 0))
        safeSet(key.totalViews, Number(value.totalViewsReceived ?? 0))
        safeSet(key.followerGrowthRate30d, Number(value.followerGrowthRate30d ?? 0))
        safeSet(key.engagementGrowthRate30d, Number(value.engagementGrowthRate30d ?? 0))
        safeSet(key.interactionsGrowthRate30d, Number(value.interactionsGrowthRate30d ?? 0))
    },
    load: () => {
        set({
            totalFollowers: storage.getNumber(key.totalFollowers) || 0,
            totalFollowing: storage.getNumber(key.totalFollowing) || 0,
            totalLikesReceived: storage.getNumber(key.totalLikes) || 0,
            totalViewsReceived: storage.getNumber(key.totalViews) || 0,
            followerGrowthRate30d: storage.getNumber(key.followerGrowthRate30d) || 0,
            engagementGrowthRate30d: storage.getNumber(key.engagementGrowthRate30d) || 0,
            interactionsGrowthRate30d: storage.getNumber(key.interactionsGrowthRate30d) || 0,
        })
    },
    remove: () => {
        safeDelete(key.totalFollowers)
        safeDelete(key.totalFollowing)
        safeDelete(key.totalLikes)
        safeDelete(key.totalViews)
        safeDelete(key.followerGrowthRate30d)
        safeDelete(key.engagementGrowthRate30d)
        safeDelete(key.interactionsGrowthRate30d)
        set({
            totalFollowers: 0,
            totalFollowing: 0,
            totalLikesReceived: 0,
            totalViewsReceived: 0,
            followerGrowthRate30d: 0,
            engagementGrowthRate30d: 0,
            interactionsGrowthRate30d: 0,
        })
    },
}))

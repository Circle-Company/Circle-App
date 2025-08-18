import { create } from "zustand"
import api from "../../services/Api"
import { storage, storageKeys } from "../../store"
import { StatisticsDataType } from "./types"
const storageKey = storageKeys().statistics

export interface StatisticsState extends StatisticsDataType {
    setTotalFollowersNum: (value: number) => void
    setTotalLikesNum: (value: number) => void
    setTotalViewsNum: (value: number) => void
    set: (value: StatisticsDataType) => void
    get: (user_id: string) => Promise<StatisticsState>
    load: () => void
    remove: () => void
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
    total_followers_num: storage.getNumber(storageKey.total_followers) || 0,
    total_likes_num: storage.getNumber(storageKey.total_likes) || 0,
    total_views_num: storage.getNumber(storageKey.total_views) || 0,

    setTotalFollowersNum: (value: number) => {
        storage.set(storageKey.total_followers, value)
        set({ total_followers_num: value })
    },
    setTotalLikesNum: (value: number) => {
        storage.set(storageKey.total_likes, value)
        set({ total_likes_num: value })
    },
    setTotalViewsNum: (value: number) => {
        storage.set(storageKey.total_views, value)
        set({ total_views_num: value })
    },
    get: async (user_id: string) => {
        try {
            console.log("JWT", storage.getString(storageKeys().account.jwt.token))
            const response = await api
                .post(
                    `/user/session/statistics/pk/${user_id}`,
                    { user_id },
                    {
                        headers: {
                            Authorization: storage.getString(storageKeys().account.jwt.token),
                        },
                    },
                )
                .then(function (response) {
                    const statistics = response.data
                    set({
                        total_followers_num: statistics.total_followers_num,
                        total_likes_num: statistics.total_likes_num,
                        total_views_num: statistics.total_views_num,
                    })
                    if (statistics.total_followers_num)
                        storage.set(storageKey.total_followers, statistics.total_followers_num)
                    if (statistics.total_likes_num)
                        storage.set(storageKey.total_likes, statistics.total_likes_num)
                    if (statistics.total_views_num)
                        storage.set(storageKey.total_views, statistics.total_views_num)
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
            return response
        } catch (err) {
            console.error(err)
        }
    },
    set: (value: StatisticsDataType) => {
        set({
            total_followers_num: value.total_followers_num,
            total_likes_num: value.total_likes_num,
            total_views_num: value.total_views_num,
        })
        storage.set(storageKey.total_followers, value.total_followers_num)
        storage.set(storageKey.total_likes, value.total_likes_num)
        storage.set(storageKey.total_views, value.total_views_num)
    },
    load: () => {
        set({
            total_followers_num: storage.getNumber(storageKey.total_followers) || 0,
            total_likes_num: storage.getNumber(storageKey.total_likes) || 0,
            total_views_num: storage.getNumber(storageKey.total_views) || 0,
        })
    },
    remove: () => {
        storage.delete(storageKey.total_followers)
        storage.delete(storageKey.total_likes)
        storage.delete(storageKey.total_views)
        set({
            total_followers_num: 0,
            total_likes_num: 0,
            total_views_num: 0,
        })
    },
}))

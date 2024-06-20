import create from 'zustand';
import { StatisticsDataType } from './types';
import { storage } from '../../store'
import { storageKeys } from './storageKeys'
import api from '../../services/api';
const storageKey = storageKeys().statistics

export interface StatisticsState extends StatisticsDataType {
    setTotalFollowersNum: (value: number) => void;
    setTotalLikesNum: (value: number) => void;
    setTotalViewsNum: (value: number) => void;
    setStatistics: (value: StatisticsDataType) => void
    getStatistics: (user_id: number) => Promise<StatisticsState>
    loadStatisticsFromStorage: () => void;
    removeStatisticsFromStorage: () => void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
    total_followers_num: storage.getNumber(storageKey.total_followers) || 0,
    total_likes_num: storage.getNumber(storageKey.total_likes) || 0,
    total_views_num: storage.getNumber(storageKey.total_views) || 0,

    setTotalFollowersNum: (value: number) => {
        storage.set(storageKey.total_followers, value);
        set({ total_followers_num: value });
    },
    setTotalLikesNum: (value: number) => {
        storage.set(storageKey.total_likes, value);
        set({ total_likes_num: value });
    },
    setTotalViewsNum: (value: number) => {
        storage.set(storageKey.total_views, value);
        set({ total_views_num: value });
    },
    getStatistics: async (user_id: number) => {
        try{
            const response = await api.post(`/user/session/statistics/pk/${user_id}`, { user_id })
            .then(function (response) {
                const statistics = response.data
                set({
                    total_followers_num: statistics.total_followers_num,
                    total_likes_num: statistics.total_likes_num,
                    total_views_num: statistics.total_views_num
                })
                if(statistics.total_followers_num) storage.set(storageKey.total_followers, statistics.total_followers_num)
                if(statistics.total_likes_num) storage.set(storageKey.total_likes, statistics.total_likes_num)
                if(statistics.total_views_num) storage.set(storageKey.total_views, statistics.total_views_num);
                return response.data
             })
            .catch(function (error) { console.log(error)})
            return response
        } catch(err) {
            console.error(err)
        } 
    },
    setStatistics: (value: StatisticsDataType) => {
        set({
            total_followers_num: value.total_followers_num,
            total_likes_num: value.total_likes_num,
            total_views_num: value.total_views_num
        })
        storage.set(storageKey.total_followers, value.total_followers_num)
        storage.set(storageKey.total_likes, value.total_likes_num)
        storage.set(storageKey.total_views, value.total_views_num)
    },
    loadStatisticsFromStorage: () => {
        set({
            total_followers_num: storage.getNumber(storageKey.total_followers) || 0,
            total_likes_num: storage.getNumber(storageKey.total_likes) || 0,
            total_views_num: storage.getNumber(storageKey.total_views) || 0
        });
    },
    removeStatisticsFromStorage: () => {
        storage.delete(storageKey.total_followers);
        storage.delete(storageKey.total_likes);
        storage.delete(storageKey.total_views);
        set({
            total_followers_num: 0,
            total_likes_num: 0,
            total_views_num: 0
        });
    },
}));
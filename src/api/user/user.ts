import api from "@/api"
import { storage, storageKeys } from "@/store"
import { UserDataByPkProps, UserFollowProps, UserUnfollowProps } from "./user.types"

async function follow({ userId, followedUserId }: UserFollowProps): Promise<void> {
    await api.post(
        "/user/follow",
        { user_id: userId, followed_user_id: followedUserId },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

async function unfollow({ userId, followedUserId }: UserUnfollowProps): Promise<void> {
    await api.post(
        "/user/unfollow",
        {
            user_id: userId,
            followed_user_id: followedUserId,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

async function getByPk({ userId, findedUserPk }: UserDataByPkProps) {
    return await api.post(
        `/user/profile/data/pk/${findedUserPk}`,
        {
            user_id: userId,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

export const routes = {
    follow,
    unfollow,
    getByPk,
}

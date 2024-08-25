import { ProfileData } from "@/contexts/profile"
import api from "../.."
import { UserDataByPkProps, UserFollowProps, UserUnfollowProps } from "./types"

async function follow({ userId, followedUserId }: UserFollowProps): Promise<void> {
    await api.post("/user/follow", {
        user_id: userId,
        followed_user_id: followedUserId,
    })
}

async function unfollow({ userId, followedUserId }: UserUnfollowProps): Promise<void> {
    await api.post("/user/unfollow", {
        user_id: userId,
        followed_user_id: followedUserId,
    })
}

async function getByPk({ userId, findedUserPk }: UserDataByPkProps): Promise<ProfileData> {
    const response = await api.post(`/user/profile/data/pk/${findedUserPk}`, {
        user_id: userId,
    })
    return response.data
}

export const routes = {
    follow,
    unfollow,
    getByPk,
}

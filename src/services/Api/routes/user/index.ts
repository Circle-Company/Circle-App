import api from "../.."
import { UserFollowProps, UserUnfollowProps } from "./types"

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

export const routes = {
    follow,
    unfollow,
}

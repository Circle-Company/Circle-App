import api from "../.."
import { PostLikeProps, PostUnlikeProps } from "./types"

async function like({ userId, momentId }: PostLikeProps): Promise<void> {
    await api.post("/moment/like", {
        user_id: userId,
        moment_id: momentId,
    })
}

async function deleteLike({ userId, momentId }: PostUnlikeProps): Promise<void> {
    await api.post("/moment/unlike", {
        user_id: userId,
        moment_id: momentId,
    })
}

export const routes = {
    like,
    deleteLike,
}

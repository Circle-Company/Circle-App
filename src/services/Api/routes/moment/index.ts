import api from "../.."
import { PostLikeProps, PostStatisticsPreviewProps, PostUnlikeProps } from "./types"

async function like({ userId, momentId }: PostLikeProps): Promise<void> {
    await api.post("/moment/like", {
        user_id: userId,
        moment_id: momentId,
    })
}

async function unlike({ userId, momentId }: PostUnlikeProps): Promise<void> {
    await api.post("/moment/unlike", {
        user_id: userId,
        moment_id: momentId,
    })
}

async function statisticsPreview({ momentId }: PostStatisticsPreviewProps) {
    return await api.post("/moment/get-statistics/view", {
        moment_id: momentId,
    })
}

export const routes = {
    like,
    unlike,
    statisticsPreview,
}

// feedApi.ts
import { MomentProps } from "@/contexts/Feed/types"
import api from "@/services/Api"

type BackendMoment = {
    id: string
    user: {
        id: string
        username: string
        profilePicture: string | null
    }
    media: string
    thumbnail: string
    duration: number
    size: string
    hasAudio: boolean
    ageRestriction: boolean
    contentWarning: boolean
    metrics?: {
        totalViews: number
        totalLikes: number
        totalComments: number
    }
    publishedAt: string
}

type FeedResponse = {
    success: boolean
    moments: BackendMoment[]
    total: number
}

export class Fetcher {
    constructor(private readonly jwtToken: string) {}

    private transformMoment(moment: BackendMoment): MomentProps {
        const metrics = moment.metrics ?? {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
        }

        const profilePicture = moment.user.profilePicture ?? ""

        return {
            id: moment.id,
            user: {
                id: moment.user.id,
                username: moment.user.username,
                verifyed: false,
                profile_picture: {
                    small_resolution: profilePicture,
                    tiny_resolution: profilePicture,
                },
                isFollowing: false,
            },
            description: "",
            content_type: "VIDEO",
            midia: {
                content_type: "VIDEO",
                nhd_thumbnail: moment.thumbnail,
                fullhd_resolution: moment.media,
                nhd_resolution: moment.media,
            },
            comments_count: metrics.totalComments ?? 0,
            likes_count: metrics.totalLikes ?? 0,
            isLiked: false,
            deleted: false,
            created_at: moment.publishedAt,
            lastComment: undefined,
            media: moment.media,
            thumbnail: moment.thumbnail,
            duration: moment.duration,
            size: moment.size,
            hasAudio: moment.hasAudio,
            ageRestriction: moment.ageRestriction,
            contentWarning: moment.contentWarning,
            metrics: {
                totalViews: metrics.totalViews ?? 0,
                totalLikes: metrics.totalLikes ?? 0,
                totalComments: metrics.totalComments ?? 0,
            },
            publishedAt: moment.publishedAt,
        }
    }

    async fetchChunk(): Promise<MomentProps[]> {
        try {
            const response = await api.get<FeedResponse>("/feed", {
                headers: { Authorization: `Bearer ${this.jwtToken}` },
            })

            const data = response.data

            data.moments.map((moment) => {
                moment.media = moment.media.replace(
                    "http://10.15.0.235:3000",
                    "http://192.168.15.17:3000",
                )
                moment.thumbnail = moment.thumbnail.replace(
                    "http://10.15.0.235:3000",
                    "http://192.168.15.17:3000",
                )
            })

            if (!data?.success || !Array.isArray(data.moments)) {
                console.warn("🔍 Feed response in unexpected format:", data)
                return []
            }

            return data.moments.map((moment) => this.transformMoment(moment))
        } catch (error) {
            console.error("🔍 Error fetching feed:", error)
            return []
        }
    }

    // stub para buscar itens antigos (infinite scroll)
    async fetchOlderChunks(cursor?: unknown): Promise<MomentProps[]> {
        // Implementar conforme seu backend
        // ex: return (await api.get('/moments/feed/older', { params: { cursor } })).data || []
        return []
    }
}

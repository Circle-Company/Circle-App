// feedApi.ts
import config from "@/config"
import { MomentProps, TopComment } from "@/contexts/Feed/types"

import api from "@/services/Api"

type BackendTopComment = {
    id: string
    content?: string
    richContent?: string
    user: {
        id: string
        username: string
        profilePicture?: string | null
        verified?: boolean
        you_follow?: boolean
    }
    sentiment?: string
    likesCount: number
    createdAt?: string
    created_at?: string
}

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
    topComment?: BackendTopComment
    publishedAt: string
}

type FeedResponse = {
    success: boolean
    moments: BackendMoment[]
    total: number
}

export class Fetcher {
    constructor(private readonly jwtToken: string) {}

    private transformTopComment(topComment?: BackendTopComment): TopComment | undefined {
        if (!topComment) return undefined

        const transformed: TopComment = {
            id: topComment.id,
            content: topComment.content,
            richContent: topComment.richContent,
            user: {
                id: String(topComment.user.id),
                username: topComment.user.username,
                profilePicture: topComment.user.profilePicture ?? undefined,
                verified: topComment.user.verified ?? false,
                isFollowing: topComment.user.you_follow ?? false,
            },
            sentiment: topComment.sentiment,
            likesCount: topComment.likesCount ?? 0,
            createdAt: topComment.createdAt || topComment.created_at,
        }

        console.log("🔍 Transformando topComment:", {
            original: topComment,
            transformed,
        })

        return transformed
    }

    private transformMoment(moment: BackendMoment): MomentProps {
        const metrics = moment.metrics ?? {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
        }

        const profilePicture = moment.user.profilePicture ?? ""

        const transformed: MomentProps = {
            id: moment.id,
            user: {
                id: moment.user.id,
                username: moment.user.username,
                verified: false,
                profilePicture: profilePicture,
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
            lastComment: this.transformTopComment(moment.topComment),
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
            topComment: this.transformTopComment(moment.topComment),
        }

        if (moment.topComment) {
            console.log("🔍 Transformando momento:", {
                momentId: moment.id,
                hasTopComment: !!moment.topComment,
                originalTopComment: moment.topComment,
                transformedTopComment: transformed.topComment,
            })
        }

        return transformed
    }

    async fetchChunk(): Promise<MomentProps[]> {
        try {
            const response = await api.get<FeedResponse>("/feed", {
                headers: { Authorization: `Bearer ${this.jwtToken}` },
            })

            const data = response.data

            // Log da resposta bruta do backend
            console.log("🔍 Resposta bruta do backend:", {
                success: data?.success,
                total: data?.total,
                momentsCount: data?.moments?.length,
                firstMoment: data?.moments?.[0]
                    ? {
                          id: data.moments[0].id,
                          hasTopComment: !!data.moments[0].topComment,
                          topComment: data.moments[0].topComment,
                      }
                    : null,
            })

            data.moments.map((moment) => {
                const oldBases = ["http://10.15.0.235:3000", "http://10.168.15.17:3000"]
                const newBase = "http://" + config.ENDPOINT
                for (const base of oldBases) {
                    if (moment.media.startsWith(base)) {
                        moment.media = newBase + moment.media.slice(base.length)
                        break
                    }
                }
                moment.thumbnail = moment.thumbnail.replace("http://10.15.0.235:3000", newBase)
            })

            if (!data?.success || !Array.isArray(data.moments)) {
                console.warn("🔍 Feed response in unexpected format:", data)
                return []
            }

            const transformedMoments = data.moments.map((moment) => this.transformMoment(moment))

            // Log dos momentos transformados
            console.log("🔍 Momentos transformados:", {
                count: transformedMoments.length,
                firstMoment: transformedMoments[0]
                    ? {
                          id: transformedMoments[0].id,
                          hasTopComment: !!transformedMoments[0].topComment,
                          topComment: transformedMoments[0].topComment,
                      }
                    : null,
            })

            return transformedMoments
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

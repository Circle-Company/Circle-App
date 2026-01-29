import api from "@/api"
import config from "@/config"
import { Moment, FeedResponse } from "@/contexts/Feed/types"

export class Fetcher {
    constructor(private readonly jwtToken: string) {}

    async fetchChunk(): Promise<Moment[]> {
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

            if (!config.PRODUCTION) {
                data.moments.map((moment) => {
                    // Reescrita direta do host legado para IP atual quando detectado
                    moment.media = moment.media.replace(
                        "http://172.31.80.1:3000",
                        "http://10.168.15.17:3000",
                    )
                    moment.thumbnail = moment.thumbnail.replace(
                        "http://172.31.80.1:3000",
                        "http://10.168.15.17:3000",
                    )

                    const oldBases = [
                        "http://10.15.0.235:3000",
                        "http://10.168.15.17:3000",
                        "http://172.31.80.1:3000",
                    ]
                    const newBase = config.ENDPOINT

                    // Normalização do media para o ENDPOINT atual
                    for (const base of oldBases) {
                        if (moment.media.startsWith(base)) {
                            moment.media = newBase + moment.media.slice(base.length)
                            break
                        }
                    }

                    // Normalização do thumbnail para o ENDPOINT atual
                    for (const base of oldBases) {
                        if (moment.thumbnail.startsWith(base)) {
                            moment.thumbnail = newBase + moment.thumbnail.slice(base.length)
                            break
                        }
                    }
                })
            }

            if (!data?.success || !Array.isArray(data.moments)) {
                console.warn("🔍 Feed response in unexpected format:", data)
                return []
            }

            return data.moments
        } catch (error) {
            console.error("🔍 Error fetching feed:", error)
            return []
        }
    }
}

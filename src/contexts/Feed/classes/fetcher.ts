// feedApi.ts
import { MomentProps, InteractionProps } from "@/contexts/Feed/types"
import api from "@/services/Api"
import { useContext } from "react"
import PersistedContext from "@/contexts/Persisted"

export class Fetcher {
    private jwtToken: string

    constructor() {
        const { session } = useContext(PersistedContext)
        this.jwtToken = session.account.jwtToken
    }

    async fetchChunk(period: number, interactions: InteractionProps[]): Promise<MomentProps[]> {
        const response = await api.post(
            "/moments/feed",
            { period, length: interactions.length, data: interactions },
            { headers: { Authorization: this.jwtToken } },
        )
        return response.data || []
    }

    // stub para buscar itens antigos (infinite scroll)
    async fetchOlderChunks(cursor?: unknown): Promise<MomentProps[]> {
        // Implementar conforme seu backend
        // ex: return (await api.get('/moments/feed/older', { params: { cursor } })).data || []
        return []
    }
}

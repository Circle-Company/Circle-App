// feedOrchestrator.ts
import { MomentProps, InteractionProps } from "@/contexts/Feed/types"
import { Fetcher } from "@/contexts/Feed/classes/fetcher"
import { DebounceGate } from "@/contexts/Feed/classes/debounceGate"
import { mapper } from "@/contexts/Feed/helpers/mapper"
import { ChunkManager } from "@/contexts/Feed/classes/chunkManager"
import { CacheManager } from "@/contexts/Feed/classes/cacheManager"

export type FeedResponse = {
    newFeed: MomentProps[]
    addedChunk: number[] // ids added or full new set on RESET
}

export type FeedOrchestratorOptions = {
    jwtToken: string
    debounceTime?: number
}

export class FeedOrchestrator {
    private fetcher: Fetcher
    private debounceGate: DebounceGate
    private chunkManager: ChunkManager
    private cacheManager: CacheManager

    constructor() {
        this.fetcher = new Fetcher()
        this.debounceGate = new DebounceGate()
        this.chunkManager = new ChunkManager()
        this.cacheManager = new CacheManager()
    }

    /**
     * Orquestra a lógica principal do feed.
     */
    public async fetch(
        period: number,
        interactions: InteractionProps[],
        currentFeed: MomentProps[],
        isReloading = false,
    ): Promise<FeedResponse> {
        if (!this.debounceGate.canProceed()) {
            return { newFeed: currentFeed, addedChunk: [] }
        }
        this.debounceGate.mark()

        const moments = await this.fetcher.fetchChunk(period, interactions)
        const newChunkIds = moments.map((m) => m.id)
        const currentPostIds = currentFeed.map((m) => m.id)
        const uniqueNewIds = newChunkIds.filter((id) => !currentPostIds.includes(id))

        if (period === 0) {
            this.chunkManager.apply("RESET")
            await this.cacheManager.apply("CLEAR")
        }
        // caso reload -> substitui tudo
        if (isReloading) {
            const { updatedList } = this.chunkManager.apply("RESET", newChunkIds)
            await this.cacheManager.apply("CLEAR")
            this.preload(updatedList, moments)
            const newFeed = mapper(updatedList, moments, currentFeed)
            return { newFeed, addedChunk: updatedList }
        }

        // primeiro carregamento (period === 0) ou feed vazio
        if (period === 0 || currentFeed.length === 0) {
            if (uniqueNewIds.length === 0) return { newFeed: currentFeed, addedChunk: [] }
            const { updatedList } = this.chunkManager.apply("ADD", uniqueNewIds)
            this.preload(uniqueNewIds, moments)
            const newFeed = mapper(updatedList, moments, currentFeed)
            return { newFeed, addedChunk: uniqueNewIds }
        }

        // caso geral: adiciona se houver novos moments
        if (uniqueNewIds.length > 0) {
            const { updatedList } = this.chunkManager.apply("ADD", uniqueNewIds)
            this.preload(uniqueNewIds, moments)
            const newFeed = mapper(updatedList, moments, currentFeed)
            return { newFeed, addedChunk: uniqueNewIds }
        }

        // nada mudou
        return { newFeed: currentFeed, addedChunk: [] }
    }

    public async remove(id: number, currentFeed: MomentProps[]): Promise<FeedResponse> {
        const { updatedList } = this.chunkManager.apply("REMOVE", [id])

        try {
            await this.cacheManager.apply("REMOVE", id)
        } catch (err) {
            console.warn("Erro ao remover do video cache:", err)
        }

        const newFeed = currentFeed.filter((m) => updatedList.includes(m.id))
        return { newFeed, addedChunk: [] }
    }

    public preload(ids: number[], moments: MomentProps[]) {
        for (const id of ids) {
            const m = moments.find((mm) => mm.id === id)
            const url = (m as any)?.videoUrl
            if (!url) continue
            this.cacheManager.preload({ id, url }).catch((e) => {
                console.warn("video preload failed", e)
            })
        }
    }

    /**
     * Fazer preload de um único vídeo
     */
    public async preloadSingle(id: number, url: string): Promise<string | null> {
        try {
            return await this.cacheManager.preload({ id, url })
        } catch (error) {
            console.warn(`Erro ao fazer preload do vídeo ${id}:`, error)
            return null
        }
    }

    /**
     * Obter vídeo do cache se disponível
     */
    public async getCached(id: number): Promise<string | null> {
        try {
            // Verificar se existe no cache
            if (this.cacheManager.has(id)) {
                return this.cacheManager.get(id) || null
            }
            return null
        } catch (error) {
            console.warn(`Erro ao buscar vídeo ${id} do cache:`, error)
            return null
        }
    }

    /**
     * Verificar se vídeo está em cache
     */
    public isVideoCached(id: number): boolean {
        return this.cacheManager.has(id)
    }
}

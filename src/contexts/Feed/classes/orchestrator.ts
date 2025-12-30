// feedOrchestrator.ts
import { Moment } from "@/contexts/Feed/types"

import { CacheManager } from "@/contexts/Feed/classes/cacheManager"
import { ChunkManager } from "@/contexts/Feed/classes/chunkManager"
import { DebounceGate } from "@/contexts/Feed/classes/debounceGate"
import { Fetcher } from "@/contexts/Feed/classes/fetcher"
import { mapper } from "@/contexts/Feed/helpers/mapper"

export type FeedResponse = {
    newFeed: Moment[]
    addedChunk: string[] // ids added or full new set on RESET
}

export class FeedOrchestrator {
    private fetcher: Fetcher
    private debounceGate: DebounceGate
    public chunkManager: ChunkManager
    public cacheManager: CacheManager

    constructor(jwtToken: string, maxCacheSize: number = 50) {
        this.fetcher = new Fetcher(jwtToken)
        this.debounceGate = new DebounceGate()
        this.chunkManager = new ChunkManager()
        this.cacheManager = new CacheManager(maxCacheSize)
    }

    /**
     * Orquestra a lógica principal do feed.
     */
    public async fetch(currentFeed: Moment[], isReloading = false): Promise<FeedResponse> {
        console.log("🔍 Fetch feed function called...")
        if (!this.debounceGate.canProceed()) {
            return { newFeed: currentFeed, addedChunk: [] }
        }
        this.debounceGate.mark()

        const moments = await this.fetcher.fetchChunk()
        const newChunkIds = moments.map((m) => m.id)
        const currentPostIds = currentFeed.map((m) => m.id)
        const uniqueNewIds = newChunkIds.filter((id) => !currentPostIds.includes(id))

        // caso reload -> substitui tudo
        if (isReloading) {
            const { updatedList } = this.chunkManager.apply("RESET", newChunkIds)
            await this.cacheManager.apply("CLEAR")
            this.preload(updatedList, moments)
            const newFeed = mapper(updatedList, moments, currentFeed)
            return { newFeed, addedChunk: updatedList }
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

    public async remove(id: string, currentFeed: Moment[]): Promise<FeedResponse> {
        const { updatedList } = this.chunkManager.apply("REMOVE", [id])

        try {
            await this.cacheManager.apply("REMOVE", id)
        } catch (err) {
            console.warn("Erro ao remover do video cache:", err)
        }

        const newFeed = currentFeed.filter((m) => updatedList.includes(m.id))
        return { newFeed, addedChunk: [] }
    }

    public preload(ids: string[], moments: Moment[]) {
        for (const id of ids) {
            const m = moments.find((mm) => mm.id === id)
            const url = m?.media
            if (!url) continue
            this.cacheManager.preload({ id, url }).catch((e) => {
                console.warn("video preload failed", e)
            })
        }
    }

    /**
     * Fazer preload de um único vídeo
     */
    public async preloadSingle(id: string, url: string): Promise<string | null> {
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
    public async getCached(id: string): Promise<string | null> {
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
    public isVideoCached(id: string): boolean {
        return this.cacheManager.has(id)
    }
}

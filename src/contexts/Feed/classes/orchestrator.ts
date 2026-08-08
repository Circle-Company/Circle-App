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
        const dedupNewChunkIds = Array.from(new Set(newChunkIds))
        const currentPostIds = currentFeed.map((m) => m.id)
        const uniqueNewIds = Array.from(
            new Set(dedupNewChunkIds.filter((id) => !currentPostIds.includes(id))),
        )

        // caso reload -> substitui tudo
        if (isReloading) {
            const { updatedList } = this.chunkManager.apply("RESET", dedupNewChunkIds)
            // NÃO limpa o cache aqui. O CacheManager já expira por TTL (1h) e
            // faz eviction LRU por tamanho; apagar tudo a cada refresh jogava
            // fora justamente os arquivos que o perfil e a tela cheia
            // reaproveitariam, forçando novo download do mesmo vídeo.
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
     * Consulta síncrona: caminho local se houver entrada dentro do TTL, senão
     * `undefined`. Existe para o player já nascer apontando para o arquivo
     * local no primeiro render — trocar a `uri` depois reinicia o player.
     */
    public getCachedSync(id: string): string | undefined {
        return this.cacheManager.get(id)
    }

    /**
     * Porta única de resolução de vídeo, para telas dentro e fora do feed
     * (perfil, conta, tela cheia). Devolve o arquivo local quando há entrada
     * válida; caso contrário devolve a URL remota e agenda o download, de modo
     * que a próxima exibição do mesmo momento seja instantânea.
     */
    public async resolveVideo(id: string, url: string): Promise<string> {
        const cached = this.cacheManager.get(id)
        if (cached) return cached

        try {
            return await this.cacheManager.preload({ id, url })
        } catch (error) {
            console.warn(`Erro ao resolver vídeo ${id}:`, error)
            return url
        }
    }

    /**
     * Prefetch dos vizinhos guiado pelo ChunkManager: thumbnails com prioridade
     * (os 2 primeiros em "high") e vídeos em "low", para não competir com o
     * download do momento em foco. Devolve as thumbnails dos vizinhos para
     * quem quiser prefetchá-las também na camada de imagem.
     */
    public prefetchAround(id: string, moments: Moment[], range: number = 3): string[] {
        const neighbors = this.chunkManager.getNeighborIds(id, range)
        if (neighbors.all.length === 0) return []

        const thumbnailUrls: string[] = []
        const thumbnailItems: Array<{ id: string; url: string }> = []
        const videoItems: Array<{ id: string; url: string }> = []

        for (const neighborId of neighbors.all) {
            const moment = moments.find((m) => String(m.id) === neighborId)
            if (!moment) continue
            if (moment.thumbnail) {
                thumbnailUrls.push(moment.thumbnail)
                thumbnailItems.push({ id: neighborId, url: moment.thumbnail })
            }
            if (moment.media) videoItems.push({ id: neighborId, url: moment.media })
        }

        if (thumbnailItems.length > 0) {
            this.cacheManager.preloadThumbnailsBatch(thumbnailItems.slice(0, 2), "high")
            const rest = thumbnailItems.slice(2)
            if (rest.length > 0) this.cacheManager.preloadThumbnailsBatch(rest, "low")
        }

        if (videoItems.length > 0) {
            this.cacheManager.preloadVideosBatch(videoItems, "low")
        }

        return thumbnailUrls
    }

    /**
     * Prefetch da thumbnail do momento em foco, com prioridade máxima.
     */
    public prefetchThumbnail(id: string, url: string) {
        this.cacheManager
            .preloadThumbnail({ id, url, priority: "high" })
            .catch((e) => console.warn("thumbnail preload failed", e))
    }

    /**
     * Verificar se vídeo está em cache
     */
    public isVideoCached(id: string): boolean {
        return this.cacheManager.has(id)
    }
}

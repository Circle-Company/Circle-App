import * as FileSystem from "expo-file-system/legacy"
import { Image } from "react-native"

const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}videos`
const THUMBNAIL_CACHE_DIR = `${FileSystem.cacheDirectory}thumbnails`

type CacheEntry = {
    id: string
    localPath: string
    originalUrl: string
}

type DownloadPriority = "high" | "medium" | "low"

type DownloadTask = {
    id: string
    url: string
    type: "video" | "thumbnail"
    priority: DownloadPriority
    localPath: string
}

export class CacheManager {
    private videoCache: Map<string, CacheEntry> = new Map()
    private thumbnailCache: Map<string, CacheEntry> = new Map()
    private accessQueue: string[] = [] // mantém ordem de uso para vídeos
    private thumbnailAccessQueue: string[] = [] // mantém ordem de uso para thumbnails
    private maxCacheSize: number
    private maxThumbnailCacheSize: number
    private downloadQueue: DownloadTask[] = []
    private activeDownloads: Set<string> = new Set()
    private maxConcurrentDownloads: number = 3
    private isProcessingQueue: boolean = false

    // Cache em memória de thumbnails prefetchadas
    private prefetchedThumbnails: Set<string> = new Set()

    constructor(maxCacheSize: number = 50, maxThumbnailCacheSize: number = 200) {
        this.maxCacheSize = maxCacheSize
        this.maxThumbnailCacheSize = maxThumbnailCacheSize
        this.init()
    }

    private async init() {
        try {
            const videoInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR)
            if (!videoInfo.exists) {
                await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true })
            }

            const thumbnailInfo = await FileSystem.getInfoAsync(THUMBNAIL_CACHE_DIR)
            if (!thumbnailInfo.exists) {
                await FileSystem.makeDirectoryAsync(THUMBNAIL_CACHE_DIR, { intermediates: true })
            }

            // Carregar cache existente na inicialização
            await this.loadExistingCache()
        } catch (err) {
            console.warn("Erro ao criar diretórios de cache:", err)
        }
    }

    /**
     * Carrega arquivos existentes no cache do disco
     */
    private async loadExistingCache() {
        try {
            // Carregar vídeos existentes
            const videoFiles = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR)
            for (const name of videoFiles) {
                if (name.endsWith(".mp4")) {
                    const id = name.replace(".mp4", "")
                    const localPath = `${VIDEO_CACHE_DIR}/${name}`
                    this.videoCache.set(id, { id, localPath, originalUrl: "" })
                    this.accessQueue.push(id)
                }
            }

            // Carregar thumbnails existentes
            const thumbnailFiles = await FileSystem.readDirectoryAsync(THUMBNAIL_CACHE_DIR)
            for (const name of thumbnailFiles) {
                if (name.endsWith(".jpg") || name.endsWith(".png")) {
                    const id = name.replace(/\.(jpg|png)$/, "")
                    const localPath = `${THUMBNAIL_CACHE_DIR}/${name}`
                    this.thumbnailCache.set(id, { id, localPath, originalUrl: "" })
                    this.thumbnailAccessQueue.push(id)
                }
            }

            console.log(
                `Cache carregado: ${this.videoCache.size} vídeos, ${this.thumbnailCache.size} thumbnails`,
            )
        } catch (err) {
            console.warn("Erro ao carregar cache existente:", err)
        }
    }

    private markAsUsed(id: string, type: "video" | "thumbnail" = "video") {
        if (type === "video") {
            const index = this.accessQueue.indexOf(id)
            if (index !== -1) {
                this.accessQueue.splice(index, 1)
            }
            this.accessQueue.push(id)
        } else {
            const index = this.thumbnailAccessQueue.indexOf(id)
            if (index !== -1) {
                this.thumbnailAccessQueue.splice(index, 1)
            }
            this.thumbnailAccessQueue.push(id)
        }
    }

    private async evictIfNeeded(type: "video" | "thumbnail" = "video") {
        const cache = type === "video" ? this.videoCache : this.thumbnailCache
        const queue = type === "video" ? this.accessQueue : this.thumbnailAccessQueue
        const maxSize = type === "video" ? this.maxCacheSize : this.maxThumbnailCacheSize

        while (cache.size >= maxSize) {
            const oldestId = queue.shift()
            if (oldestId !== undefined) {
                const entry = cache.get(oldestId)
                if (entry) {
                    try {
                        await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
                    } catch (err) {
                        console.warn(`Erro ao remover ${type} [${oldestId}]:`, err)
                    }
                    cache.delete(oldestId)
                }
            }
        }
    }

    /**
     * Adiciona task à fila de downloads com priorização
     */
    private addToDownloadQueue(task: DownloadTask) {
        // Evitar duplicatas
        const exists = this.downloadQueue.some((t) => t.id === task.id && t.type === task.type)
        if (exists || this.activeDownloads.has(`${task.type}-${task.id}`)) {
            return
        }

        // Inserir na posição correta baseado na prioridade
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        let insertIndex = this.downloadQueue.findIndex(
            (t) => priorityOrder[t.priority] > priorityOrder[task.priority],
        )

        if (insertIndex === -1) {
            this.downloadQueue.push(task)
        } else {
            this.downloadQueue.splice(insertIndex, 0, task)
        }

        this.processDownloadQueue()
    }

    /**
     * Processa a fila de downloads respeitando o limite de downloads simultâneos
     */
    private async processDownloadQueue() {
        if (this.isProcessingQueue) return
        this.isProcessingQueue = true

        while (
            this.downloadQueue.length > 0 &&
            this.activeDownloads.size < this.maxConcurrentDownloads
        ) {
            const task = this.downloadQueue.shift()
            if (!task) break

            const taskKey = `${task.type}-${task.id}`
            this.activeDownloads.add(taskKey)

            // Download assíncrono
            this.executeDownload(task)
                .then(() => {
                    this.activeDownloads.delete(taskKey)
                    this.processDownloadQueue()
                })
                .catch((err) => {
                    console.warn(`Erro no download [${task.id}]:`, err)
                    this.activeDownloads.delete(taskKey)
                    this.processDownloadQueue()
                })
        }

        this.isProcessingQueue = false
    }

    /**
     * Executa o download de um arquivo
     */
    private async executeDownload(task: DownloadTask): Promise<void> {
        const cache = task.type === "video" ? this.videoCache : this.thumbnailCache

        // Verificar se já existe
        if (cache.has(task.id)) {
            return
        }

        const fileInfo = await FileSystem.getInfoAsync(task.localPath)
        if (fileInfo.exists) {
            const finalPath = task.localPath
            cache.set(task.id, { id: task.id, localPath: finalPath, originalUrl: task.url })
            this.markAsUsed(task.id, task.type)
            return
        }

        await this.evictIfNeeded(task.type)

        try {
            await FileSystem.downloadAsync(task.url, task.localPath)

            const finalPath = task.localPath
            cache.set(task.id, { id: task.id, localPath: finalPath, originalUrl: task.url })
            this.markAsUsed(task.id, task.type)

            console.log(`${task.type} [${task.id}] baixado com sucesso`)
        } catch (err) {
            console.warn(`Erro ao baixar ${task.type} [${task.id}]:`, err)
            throw err
        }
    }

    /**
     * Pré-carrega um vídeo (método principal)
     */
    public async preload({ id, url }: { id: string; url: string }): Promise<string> {
        if (this.videoCache.has(id)) {
            this.markAsUsed(id, "video")
            return this.videoCache.get(id)!.localPath
        }

        const localPath = `${VIDEO_CACHE_DIR}/${id}.mp4`
        const fileInfo = await FileSystem.getInfoAsync(localPath)

        if (fileInfo.exists) {
            const finalPath = localPath
            this.videoCache.set(id, { id, localPath: finalPath, originalUrl: url })
            this.markAsUsed(id, "video")
            return finalPath
        }

        // Retorna URL remota imediatamente e adiciona à fila para download
        this.addToDownloadQueue({
            id,
            url,
            type: "video",
            priority: "high",
            localPath,
        })

        return url
    }

    /**
     * Pré-carrega uma thumbnail
     */
    public async preloadThumbnail({
        id,
        url,
        priority = "medium",
    }: {
        id: string
        url: string
        priority?: DownloadPriority
    }): Promise<string> {
        if (this.thumbnailCache.has(id)) {
            this.markAsUsed(id, "thumbnail")
            return this.thumbnailCache.get(id)!.localPath
        }

        const extension = url.includes(".png") ? "png" : "jpg"
        const localPath = `${THUMBNAIL_CACHE_DIR}/${id}.${extension}`
        const fileInfo = await FileSystem.getInfoAsync(localPath)

        if (fileInfo.exists) {
            const finalPath = localPath
            this.thumbnailCache.set(id, { id, localPath: finalPath, originalUrl: url })
            this.markAsUsed(id, "thumbnail")
            return finalPath
        }

        // Adiciona à fila de download
        this.addToDownloadQueue({
            id,
            url,
            type: "thumbnail",
            priority,
            localPath,
        })

        // Usa Image.prefetch para cache nativo do React Native
        if (!this.prefetchedThumbnails.has(id)) {
            Image.prefetch(url).then(() => {
                this.prefetchedThumbnails.add(id)
            })
        }

        return url
    }

    /**
     * Pré-carrega múltiplas thumbnails em lote
     */
    public async preloadThumbnailsBatch(
        items: Array<{ id: string; url: string }>,
        priority: DownloadPriority = "low",
    ): Promise<void> {
        const promises = items.map((item) =>
            this.preloadThumbnail({ id: item.id, url: item.url, priority }),
        )
        await Promise.allSettled(promises)
    }

    /**
     * Pré-carrega múltiplos vídeos em lote
     */
    public async preloadVideosBatch(
        items: Array<{ id: string; url: string }>,
        priority: DownloadPriority = "medium",
    ): Promise<void> {
        for (const item of items) {
            const localPath = `${VIDEO_CACHE_DIR}/${item.id}.mp4`
            this.addToDownloadQueue({
                id: item.id,
                url: item.url,
                type: "video",
                priority,
                localPath,
            })
        }
    }

    public get(id: string): string | undefined {
        const entry = this.videoCache.get(id)
        if (entry) this.markAsUsed(id, "video")
        return entry?.localPath
    }

    public getThumbnail(id: string): string | undefined {
        const entry = this.thumbnailCache.get(id)
        if (entry) this.markAsUsed(id, "thumbnail")
        return entry?.localPath
    }

    public has(id: string): boolean {
        return this.videoCache.has(id)
    }

    public hasThumbnail(id: string): boolean {
        return this.thumbnailCache.has(id)
    }

    public async remove(id: string) {
        const entry = this.videoCache.get(id)
        if (!entry) return

        try {
            await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
        } catch (err) {
            console.warn(`Erro ao remover vídeo [${id}]:`, err)
        }

        this.videoCache.delete(id)
        const index = this.accessQueue.indexOf(id)
        if (index !== -1) this.accessQueue.splice(index, 1)
    }

    public async removeThumbnail(id: string) {
        const entry = this.thumbnailCache.get(id)
        if (!entry) return

        try {
            await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
        } catch (err) {
            console.warn(`Erro ao remover thumbnail [${id}]:`, err)
        }

        this.thumbnailCache.delete(id)
        this.prefetchedThumbnails.delete(id)
        const index = this.thumbnailAccessQueue.indexOf(id)
        if (index !== -1) this.thumbnailAccessQueue.splice(index, 1)
    }

    public clear() {
        this.videoCache.forEach(async (entry) => {
            try {
                await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
            } catch (error) {
                console.log(error)
            }
        })
        this.videoCache.clear()
        this.accessQueue = []

        this.thumbnailCache.forEach(async (entry) => {
            try {
                await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
            } catch (error) {
                console.log(error)
            }
        })
        this.thumbnailCache.clear()
        this.thumbnailAccessQueue = []
        this.prefetchedThumbnails.clear()
    }

    /**
     * Método apply para controle de cache similar ao ChunkManager
     */
    public async apply(command: "CLEAR" | "REMOVE", payload?: string | string[]): Promise<void> {
        switch (command) {
            case "CLEAR":
                await this.clearCache()
                break
            case "REMOVE":
                if (typeof payload === "string") {
                    await this.remove(payload)
                    await this.removeThumbnail(payload)
                } else if (Array.isArray(payload)) {
                    for (const id of payload) {
                        await this.remove(id)
                        await this.removeThumbnail(id)
                    }
                }
                break
        }
    }

    private async clearCache() {
        const videoEntries = Array.from(this.videoCache.values())
        for (const entry of videoEntries) {
            try {
                await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
            } catch (error) {
                console.warn(`Erro ao limpar cache do vídeo [${entry.id}]:`, error)
            }
        }
        this.videoCache.clear()
        this.accessQueue = []

        const thumbnailEntries = Array.from(this.thumbnailCache.values())
        for (const entry of thumbnailEntries) {
            try {
                await FileSystem.deleteAsync(entry.localPath, { idempotent: true })
            } catch (error) {
                console.warn(`Erro ao limpar cache da thumbnail [${entry.id}]:`, error)
            }
        }
        this.thumbnailCache.clear()
        this.thumbnailAccessQueue = []
        this.prefetchedThumbnails.clear()
    }

    /**
     * Retorna estatísticas do cache
     */
    public getStats() {
        return {
            videos: {
                cached: this.videoCache.size,
                max: this.maxCacheSize,
            },
            thumbnails: {
                cached: this.thumbnailCache.size,
                prefetched: this.prefetchedThumbnails.size,
                max: this.maxThumbnailCacheSize,
            },
            downloads: {
                queued: this.downloadQueue.length,
                active: this.activeDownloads.size,
            },
        }
    }

    /**
     * Cancela downloads pendentes de baixa prioridade
     */
    public cancelLowPriorityDownloads() {
        this.downloadQueue = this.downloadQueue.filter((task) => task.priority !== "low")
    }
}

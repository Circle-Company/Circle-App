import RNFS from "react-native-fs"
import { calculeCacheMaxSize } from "@/contexts/Feed/helpers/calculeCacheMaxSize"

const VIDEO_CACHE_DIR = `${RNFS.CachesDirectoryPath}/videos`

type CacheEntry = {
    id: number
    localPath: string
    originalUrl: string
}

export class CacheManager {
    private cache: Map<number, CacheEntry> = new Map()
    private accessQueue: number[] = [] // mantém ordem de uso
    private maxCacheSize: number

    constructor() {
        this.maxCacheSize = calculeCacheMaxSize()
        this.init()
    }

    private async init() {
        try {
            const exists = await RNFS.exists(VIDEO_CACHE_DIR)
            if (!exists) {
                await RNFS.mkdir(VIDEO_CACHE_DIR)
            }
        } catch (err) {
            console.warn("Erro ao criar diretório de cache de vídeo:", err)
        }
    }

    private markAsUsed(id: number) {
        const index = this.accessQueue.indexOf(id)
        if (index !== -1) {
            this.accessQueue.splice(index, 1)
        }
        this.accessQueue.push(id)
    }

    private async evictIfNeeded() {
        while (this.cache.size >= this.maxCacheSize) {
            const oldestId = this.accessQueue.shift()
            if (oldestId !== undefined) {
                const entry = this.cache.get(oldestId)
                if (entry) {
                    try {
                        await RNFS.unlink(entry.localPath.replace("file://", ""))
                    } catch (err) {
                        console.warn(`Erro ao remover vídeo [${oldestId}]:`, err)
                    }
                    this.cache.delete(oldestId)
                }
            }
        }
    }

    public async preload({ id, url }: { id: number; url: string }): Promise<string> {
        if (this.cache.has(id)) {
            this.markAsUsed(id)
            return this.cache.get(id)!.localPath
        }

        const localPath = `${VIDEO_CACHE_DIR}/${id}.mp4`
        const fileExists = await RNFS.exists(localPath)

        await this.evictIfNeeded()

        if (!fileExists) {
            try {
                await RNFS.downloadFile({
                    fromUrl: url,
                    toFile: localPath,
                }).promise
            } catch (err) {
                console.warn(`Erro ao baixar vídeo [${id}]:`, err)
                return url // fallback
            }
        }

        const finalPath = `file://${localPath}`
        this.cache.set(id, { id, localPath: finalPath, originalUrl: url })
        this.markAsUsed(id)

        return finalPath
    }

    public get(id: number): string | undefined {
        const entry = this.cache.get(id)
        if (entry) this.markAsUsed(id)
        return entry?.localPath
    }

    public has(id: number): boolean {
        return this.cache.has(id)
    }

    public async remove(id: number) {
        const entry = this.cache.get(id)
        if (!entry) return

        try {
            await RNFS.unlink(entry.localPath.replace("file://", ""))
        } catch (err) {
            console.warn(`Erro ao remover vídeo [${id}]:`, err)
        }

        this.cache.delete(id)
        const index = this.accessQueue.indexOf(id)
        if (index !== -1) this.accessQueue.splice(index, 1)
    }

    public clear() {
        this.cache.forEach(async (entry) => {
            try {
                await RNFS.unlink(entry.localPath.replace("file://", ""))
            } catch (error) {
                console.log(error)
            }
        })
        this.cache.clear()
        this.accessQueue = []
    }

    /**
     * Método apply para controle de cache similar ao ChunkManager
     */
    public async apply(command: "CLEAR" | "REMOVE", payload?: number | number[]): Promise<void> {
        switch (command) {
            case "CLEAR":
                await this.clearCache()
                break
            case "REMOVE":
                if (typeof payload === "number") {
                    await this.remove(payload)
                } else if (Array.isArray(payload)) {
                    for (const id of payload) {
                        await this.remove(id)
                    }
                }
                break
        }
    }

    private async clearCache() {
        const entries = Array.from(this.cache.values())
        for (const entry of entries) {
            try {
                await RNFS.unlink(entry.localPath.replace("file://", ""))
            } catch (error) {
                console.warn(`Erro ao limpar cache do vídeo [${entry.id}]:`, error)
            }
        }
        this.cache.clear()
        this.accessQueue = []
    }
}

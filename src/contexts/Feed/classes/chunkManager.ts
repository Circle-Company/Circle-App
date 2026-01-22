import { calculeChunksMaxSize } from "@/contexts/Feed/helpers/calculeChunksMaxSize"

export class ChunkManager {
    private readonly maxListSize: number
    private currentFeed: string[] = []
    private history: string[][] = []
    private lastScrollDirection: "up" | "down" | null = null
    private prefetchRange: number = 5 // número de itens para prefetch em cada direção

    constructor() {
        this.maxListSize = calculeChunksMaxSize()
    }

    private limitListSize(list: string[]): { updated: string[]; removedItems: string[] } {
        // Dedup antes de limitar o tamanho para evitar IDs duplicados
        const deduped = Array.from(new Set(list))

        if (deduped.length <= this.maxListSize) {
            return { updated: deduped, removedItems: [] }
        }
        const excess = deduped.length - this.maxListSize
        const removedItems = deduped.slice(0, excess)
        const updated = deduped.slice(-this.maxListSize)
        return { updated, removedItems }
    }

    public apply(command: "ADD" | "RESET" | "REMOVE" | "APPEND_OLD", payload?: string[]) {
        this.saveState()

        let updated: string[] = []
        let removedItems: string[] = []

        switch (command) {
            case "RESET":
                removedItems = [...this.currentFeed]
                // Dedup no reset para evitar chaves duplicadas no feed
                updated = Array.from(new Set(payload || []))
                break
            case "ADD":
                if (!payload) throw new Error("Payload é obrigatório para comando ADD")
                ;({ updated, removedItems } = this.limitListSize([...this.currentFeed, ...payload]))
                break

            case "APPEND_OLD":
                if (!payload) throw new Error("Payload é obrigatório para comando APPEND_OLD")
                ;({ updated, removedItems } = this.limitListSize([...payload, ...this.currentFeed]))
                break

            case "REMOVE":
                if (!payload) throw new Error("Payload é obrigatório para comando REMOVE")
                updated = this.currentFeed.filter((id) => !payload.includes(id))
                removedItems = payload
                break
        }

        this.currentFeed = updated
        return { updatedList: updated, removedItems }
    }

    private saveState() {
        this.history.push([...this.currentFeed])
    }

    public rollback() {
        this.currentFeed = this.history.pop() ?? this.currentFeed
        return this.currentFeed
    }

    /**
     * Obtém IDs vizinhos de um item específico para prefetch
     * @param currentId ID do item atual
     * @param range Número de itens antes e depois para retornar
     */
    public getNeighborIds(
        currentId: string,
        range: number = this.prefetchRange,
    ): {
        previous: string[]
        next: string[]
        all: string[]
    } {
        const currentIndex = this.currentFeed.indexOf(currentId)

        if (currentIndex === -1) {
            return { previous: [], next: [], all: [] }
        }

        const startIndex = Math.max(0, currentIndex - range)
        const endIndex = Math.min(this.currentFeed.length, currentIndex + range + 1)

        // Dedupe vizinhos e garanta que o currentId não entre por engano
        const prevSlice = this.currentFeed.slice(startIndex, currentIndex)
        const nextSlice = this.currentFeed.slice(currentIndex + 1, endIndex)

        const previous = Array.from(new Set(prevSlice)).filter((id) => id !== currentId)
        const next = Array.from(new Set(nextSlice)).filter((id) => id !== currentId)
        const all = Array.from(new Set([...previous, ...next]))

        return { previous, next, all }
    }

    /**
     * Prediz os próximos itens baseado na direção de scroll
     * @param currentId ID do item atual
     * @param scrollDirection Direção do scroll
     */
    public predictNextItems(
        currentId: string,
        scrollDirection: "up" | "down" | null = null,
    ): string[] {
        const direction = scrollDirection || this.lastScrollDirection || "down"
        this.lastScrollDirection = direction

        const currentIndex = this.currentFeed.indexOf(currentId)
        if (currentIndex === -1) return []

        if (direction === "down") {
            // Scrolling para baixo - pega os próximos itens
            const endIndex = Math.min(
                this.currentFeed.length,
                currentIndex + this.prefetchRange * 2,
            )
            return this.currentFeed.slice(currentIndex + 1, endIndex)
        } else {
            // Scrolling para cima - pega os itens anteriores
            const startIndex = Math.max(0, currentIndex - this.prefetchRange * 2)
            return this.currentFeed.slice(startIndex, currentIndex).reverse()
        }
    }

    /**
     * Obtém todos os IDs do feed atual
     */
    public getAllIds(): string[] {
        return [...this.currentFeed]
    }

    /**
     * Obtém a posição de um ID no feed
     */
    public getPosition(id: string): number {
        return this.currentFeed.indexOf(id)
    }

    /**
     * Verifica se um ID existe no feed
     */
    public hasId(id: string): boolean {
        return this.currentFeed.includes(id)
    }

    /**
     * Obtém o primeiro conjunto de IDs para prefetch inicial
     * @param count Número de itens para retornar
     */
    public getInitialPrefetchIds(count: number = this.prefetchRange * 2): string[] {
        return this.currentFeed.slice(0, count)
    }

    /**
     * Atualiza o range de prefetch
     */
    public setPrefetchRange(range: number) {
        this.prefetchRange = range
    }

    /**
     * Retorna estatísticas do chunk manager
     */
    public getStats() {
        return {
            totalItems: this.currentFeed.length,
            maxSize: this.maxListSize,
            historySize: this.history.length,
            lastScrollDirection: this.lastScrollDirection,
            prefetchRange: this.prefetchRange,
        }
    }
}

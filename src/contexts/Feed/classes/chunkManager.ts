import { calculeChunksMaxSize } from "@/contexts/Feed/helpers/calculeChunksMaxSize"

export class ChunkManager {
    private readonly maxListSize: number
    private currentFeed: number[] = []
    private history: number[][] = []

    constructor() {
        this.maxListSize = calculeChunksMaxSize()
    }

    private limitListSize(list: number[]): { updated: number[]; removedItems: number[] } {
        if (list.length <= this.maxListSize) {
            return { updated: list, removedItems: [] }
        }
        const excess = list.length - this.maxListSize
        const removedItems = list.slice(0, excess)
        const updated = list.slice(-this.maxListSize)
        return { updated, removedItems }
    }

    public apply(command: "ADD" | "RESET" | "REMOVE" | "APPEND_OLD", payload?: number[]) {
        this.saveState()

        let updated: number[] = []
        let removedItems: number[] = []

        switch (command) {
            case "RESET":
                removedItems = [...this.currentFeed]
                updated = payload || []
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
}

type ChunksManangerProps = {
    period: number
    reloading: boolean
    previousList: number[]
    newList: number[]
}

export function ChunksManager({ previousList, newList, period, reloading }: ChunksManangerProps) {
    let addChunkOnList: boolean = false
    let resetFeedList: boolean = false
    if (reloading) {
        addChunkOnList = true
        resetFeedList = true
    }
    if (period == 0) addChunkOnList = true
    if (previousList.length <= 0) {
        addChunkOnList = true
        resetFeedList = false
        if (newList.length <= 0) {
            addChunkOnList = false
            resetFeedList = false
        }
    } else {
        previousList.map((item) => {
            newList.map((newItem) => {
                if (item == newItem) {
                    addChunkOnList = true
                    resetFeedList = false
                } else {
                    addChunkOnList = true
                    resetFeedList = false
                }
            })
        })
    }

    return {
        addChunkOnList,
        resetFeedList,
    }
}

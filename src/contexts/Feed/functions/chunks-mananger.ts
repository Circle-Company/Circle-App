type ChunksManagerProps = {
    period: number
    reloading: boolean
    previousList: number[]
    newList: number[]
    maxItems: number // Maximum allowed items in the list
}

/**
 * Ensures the list does not exceed the maximum allowed size.
 * Removes the oldest items if the list exceeds the limit.
 * @param list Current list of chunks
 * @param maxItems Maximum allowed items
 * @returns Trimmed list
 */
function limitListSize(list: number[], maxItems: number): number[] {
    return list.slice(-maxItems) // Keep only the most recent items
}

export function ChunksManager({
    previousList,
    newList,
    period,
    reloading,
    maxItems,
}: ChunksManagerProps) {
    // Flags for control
    let addChunkOnList = false
    let resetFeedList = false

    // Create a new set to avoid duplicates
    const uniquePreviousSet = new Set(previousList)
    const uniqueNewItems = newList.filter((item) => !uniquePreviousSet.has(item))

    // Reload logic: replace the list entirely
    if (reloading) {
        resetFeedList = true
        addChunkOnList = true
        return {
            addChunkOnList,
            resetFeedList,
            updatedList: limitListSize([...uniqueNewItems], maxItems),
        }
    }

    // First load logic: always add chunks
    if (period === 0) {
        addChunkOnList = true
        return {
            addChunkOnList,
            resetFeedList,
            updatedList: limitListSize([...uniquePreviousSet, ...uniqueNewItems], maxItems),
        }
    }

    // If the previous list is empty, add the new items directly
    if (uniquePreviousSet.size === 0) {
        addChunkOnList = uniqueNewItems.length > 0
        return {
            addChunkOnList,
            resetFeedList,
            updatedList: limitListSize([...uniqueNewItems], maxItems),
        }
    }

    // Add unique new items to the existing list
    if (uniqueNewItems.length > 0) {
        addChunkOnList = true
    }

    // Combine the previous list with unique new items
    const updatedList = limitListSize([...uniquePreviousSet, ...uniqueNewItems], maxItems)

    return {
        addChunkOnList,
        resetFeedList,
        updatedList,
    }
}
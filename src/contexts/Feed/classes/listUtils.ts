export class ListUtils {
    /**
     * Deduplicate items based on primitive equality.
     * @param baseList Reference list (items already stored)
     * @param newList New incoming items
     * @returns Array with only unique new items
     */
    static getUniqueNewItems(baseList: number[], newList: number[]): number[] {
        const baseSet = new Set(baseList)
        return newList.filter((item) => !baseSet.has(item))
    }

    /**
     * Limit the list size keeping the most recent items.
     * @param list Current list
     * @param maxItems Maximum size allowed
     * @returns Trimmed list
     */
    static limitListSize(list: number[], maxItems: number): number[] {
        return list.slice(-maxItems)
    }
}

/**
 * A reusable hook to append items uniquely by id (or any key) without duplicates.
 * Designed for Moments lists to intercept API responses and prevent adding
 * the same moment twice by its id.
 *
 * Usage:
 * const {
 *   items,
 *   appendUnique,
 *   appendOneUnique,
 *   resetUnique,
 *   removeById,
 *   hasId,
 *   clear,
 * } = useUniqueAppend<Moment>({ keySelector: m => String(m.id) })
 *
 * // After fetching:
 * appendUnique(response.data.moments)
 *
 * Notes:
 * - By default, duplicates are ignored (not replaced).
 * - Items without a valid key are skipped.
 */

import { useCallback, useEffect, useRef, useState } from "react"

type KeyLike = string | number

export type KeySelector<T> = (item: T) => KeyLike | null | undefined

export interface UseUniqueAppendOptions<T> {
    /**
     * Function to extract the unique key from an item (defaults to item.id).
     */
    keySelector?: KeySelector<T>
    /**
     * Initial list of items (will be deduplicated on mount).
     */
    initial?: T[]
    /**
     * Called with the list of skipped items (duplicates or invalid key) after an append.
     */
    onDeduped?: (skipped: T[]) => void
    /**
     * If true, replace the existing item when a duplicate key is received.
     * Default: false (duplicates are ignored).
     */
    replaceOnDuplicate?: boolean
}

export interface UseUniqueAppendResult<T> {
    /**
     * Current list of items.
     */
    items: T[]
    /**
     * Append many items uniquely. Returns counts of added/skipped.
     */
    appendUnique: (incoming: T[] | readonly T[]) => { added: number; skipped: number }
    /**
     * Append a single item uniquely. Returns true if added, false if skipped/replaced.
     */
    appendOneUnique: (item: T) => boolean
    /**
     * Replace the entire list with a new set, deduplicated.
     */
    resetUnique: (next: T[] | readonly T[]) => void
    /**
     * Remove an item by id/key. Returns true if removed.
     */
    removeById: (id: KeyLike) => boolean
    /**
     * Check if an id/key is already present.
     */
    hasId: (id: KeyLike) => boolean
    /**
     * Clear the list and internal key index.
     */
    clear: () => void
    /**
     * Current number of items.
     */
    size: number
}

/**
 * Default key selector: String(item?.id)
 */
function defaultKeySelector(item: any): KeyLike | null | undefined {
    // Try known fields in order
    const id =
        (item as any)?.id ??
        (item as any)?.momentId ??
        (item as any)?.uuid ??
        (item as any)?.key ??
        undefined
    return id ?? null
}

export function useUniqueAppend<T = any>(
    options?: UseUniqueAppendOptions<T>,
): UseUniqueAppendResult<T> {
    const keySelectorRef = useRef<KeySelector<T>>(
        options?.keySelector ?? (defaultKeySelector as KeySelector<T>),
    )
    // Keep keySelector updated without breaking stable callbacks
    useEffect(() => {
        keySelectorRef.current = options?.keySelector ?? (defaultKeySelector as KeySelector<T>)
    }, [options?.keySelector])

    const replaceOnDuplicateRef = useRef<boolean>(!!options?.replaceOnDuplicate)
    useEffect(() => {
        replaceOnDuplicateRef.current = !!options?.replaceOnDuplicate
    }, [options?.replaceOnDuplicate])

    const onDedupedRef = useRef<UseUniqueAppendOptions<T>["onDeduped"]>(options?.onDeduped)
    useEffect(() => {
        onDedupedRef.current = options?.onDeduped
    }, [options?.onDeduped])

    const [items, setItems] = useState<T[]>(() => Array.from(options?.initial ?? []))
    const keysRef = useRef<Set<string>>(new Set())

    // Initialize key index from initial items
    useEffect(() => {
        const s = new Set<string>()
        for (const it of items) {
            const k = keySelectorRef.current(it)
            if (k !== null && k !== undefined) s.add(String(k))
        }
        keysRef.current = s
        // only on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const hasId = useCallback((id: KeyLike) => {
        return keysRef.current.has(String(id))
    }, [])

    const removeById = useCallback((id: KeyLike) => {
        const key = String(id)
        if (!keysRef.current.has(key)) return false
        setItems((prev) => {
            const idx = prev.findIndex((it) => String(keySelectorRef.current(it) ?? "") === key)
            if (idx === -1) return prev
            const next = prev.slice()
            next.splice(idx, 1)
            // rebuild keys set safely
            const s = new Set<string>()
            for (const it of next) {
                const k = keySelectorRef.current(it)
                if (k !== null && k !== undefined) s.add(String(k))
            }
            keysRef.current = s
            return next
        })
        return true
    }, [])

    const appendOneUnique = useCallback((item: T) => {
        const k = keySelectorRef.current(item)
        if (k === null || k === undefined) {
            // Skip items without valid key
            onDedupedRef.current?.([item])
            return false
        }
        const key = String(k)

        // Replace existing if allowed
        if (keysRef.current.has(key)) {
            if (replaceOnDuplicateRef.current) {
                setItems((prev) => {
                    const idx = prev.findIndex(
                        (it) => String(keySelectorRef.current(it) ?? "") === key,
                    )
                    if (idx === -1) return prev
                    const next = prev.slice()
                    next[idx] = item
                    return next
                })
                return false
            }
            // Ignore duplicate
            onDedupedRef.current?.([item])
            return false
        }

        // Append new
        setItems((prev) => {
            keysRef.current.add(key)
            return [...prev, item]
        })
        return true
    }, [])

    const appendUnique = useCallback((incoming: T[] | readonly T[]) => {
        if (!incoming || incoming.length === 0) return { added: 0, skipped: 0 }

        const skipped: T[] = []
        let added = 0

        setItems((prev) => {
            const next = prev.slice()
            for (const it of incoming) {
                const id = keySelectorRef.current(it)
                if (id === null || id === undefined) {
                    skipped.push(it)
                    continue
                }
                const key = String(id)
                if (keysRef.current.has(key)) {
                    if (replaceOnDuplicateRef.current) {
                        const idx = next.findIndex(
                            (x) => String(keySelectorRef.current(x) ?? "") === key,
                        )
                        if (idx !== -1) next[idx] = it
                    } else {
                        skipped.push(it)
                    }
                    continue
                }
                keysRef.current.add(key)
                next.push(it)
                added++
            }
            return next
        })

        if (skipped.length) onDedupedRef.current?.(skipped)
        return { added, skipped: skipped.length }
    }, [])

    const resetUnique = useCallback((next: T[] | readonly T[]) => {
        const out: T[] = []
        const keys = new Set<string>()
        for (const it of next) {
            const k = keySelectorRef.current(it)
            if (k === null || k === undefined) continue
            const key = String(k)
            if (keys.has(key)) continue
            keys.add(key)
            out.push(it)
        }
        keysRef.current = keys
        setItems(out)
    }, [])

    const clear = useCallback(() => {
        keysRef.current = new Set()
        setItems([])
    }, [])

    return {
        items,
        appendUnique,
        appendOneUnique,
        resetUnique,
        removeById,
        hasId,
        clear,
        size: items.length,
    }
}

export default useUniqueAppend

import React, { createContext, useContext } from "react"
import { MemoryReciveDataProps } from "./memory-types"

const MemoryContext = createContext<{ memory: MemoryReciveDataProps} | null>(null)

export function useMemoryContext() {
    const context = useContext(MemoryContext)
    if(!context) {
        throw new Error("Memory.* component must be rendered as child of Memory component")
    }
    return context
}

export default MemoryContext
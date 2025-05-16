import React from "react"
import { MemoryMainRootProps } from "../../memory-types"
import MemoryContext from "../../memory-context"

export default function main_root({ children, data }: MemoryMainRootProps) {
    return <MemoryContext.Provider value={{ memories: data }}>{children}</MemoryContext.Provider>
}

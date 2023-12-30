import React from "react"
import { View, Text } from "react-native"
import { MemoryMainRootProps } from "../../memory-types"
import MemoryContext from "../../memory-context"
import sizes from "../../../../layout/constants/sizes"

export default function main_root ({children, data}: MemoryMainRootProps) {
    return (
        <MemoryContext.Provider value={{memories: data}}>
            {children}  
        </MemoryContext.Provider>

    )
}
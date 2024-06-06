import React from "react"
import { MemoryReciveDataProps } from "../components/Memory/Memory-types"
type MemoryProviderProps = {
    children: React.ReactNode
}

export type TagProps = {
    title: string
} 

export type MemoryContextsData = {
    memory: MemoryReciveDataProps
    memoryMoments: any 
    setMemory: React.Dispatch<React.SetStateAction<MemoryReciveDataProps | undefined>>
    setMemoryMoments: React.Dispatch<React.SetStateAction<any>>
}

const MemoryContext = React.createContext<MemoryContextsData>({} as MemoryContextsData)

export function MemoryProvider({children}: MemoryProviderProps) {
    const [memory, setMemory] = React.useState<MemoryReciveDataProps>()
    const [memoryMoments, setMemoryMoments] = React.useState<any>()

    const contextValue: any = {
        memory,
        memoryMoments,
        setMemory,
        setMemoryMoments
    }

    return (
        <MemoryContext.Provider value={contextValue}>
            {children}
        </MemoryContext.Provider>
    )
}
export default MemoryContext
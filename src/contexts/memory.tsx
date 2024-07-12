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
    allMemoriesUserId: number
    setMemory: React.Dispatch<React.SetStateAction<MemoryReciveDataProps | undefined>>
    setMemoryMoments: React.Dispatch<React.SetStateAction<any>>
    setAllMemoriesUserId: React.Dispatch<React.SetStateAction<number>>
}

const MemoryContext = React.createContext<MemoryContextsData>({} as MemoryContextsData)

export function Provider({children}: MemoryProviderProps) {
    const [memory, setMemory] = React.useState<MemoryReciveDataProps>()
    const [memoryMoments, setMemoryMoments] = React.useState<any>()
    const [allMemoriesUserId, setAllMemoriesUserId] = React.useState<number>()

    const contextValue: any = {
        memory,
        memoryMoments,
        allMemoriesUserId,
        setAllMemoriesUserId,
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
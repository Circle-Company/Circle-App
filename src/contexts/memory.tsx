import React from "react"
import { MemoryMomentObjectProps, MemoryReciveDataProps } from "../components/Memory/Memory-types"
import { userReciveDataProps } from "../components/user_show/user_show-types"
type MemoryProviderProps = {
    children: React.ReactNode
}

export type TagProps = {
    title: string
}

export type MemoryContextsData = {
    memory: MemoryReciveDataProps
    memoryMoments: Array<MemoryMomentObjectProps>
    allMemoriesUser: userReciveDataProps
    setMemory: React.Dispatch<React.SetStateAction<MemoryReciveDataProps | undefined>>
    setMemoryMoments: React.Dispatch<React.SetStateAction<any>>
    setAllMemoriesUser: React.Dispatch<React.SetStateAction<userReciveDataProps>>
}

const MemoryContext = React.createContext<MemoryContextsData>({} as MemoryContextsData)

export function Provider({ children }: MemoryProviderProps) {
    const [memory, setMemory] = React.useState<MemoryReciveDataProps>()
    const [memoryMoments, setMemoryMoments] = React.useState<any>({} as userReciveDataProps)
    const [allMemoriesUser, setAllMemoriesUser] = React.useState<userReciveDataProps>(
        {} as userReciveDataProps
    )

    const contextValue: any = {
        memory,
        memoryMoments,
        allMemoriesUser,
        setAllMemoriesUser,
        setMemory,
        setMemoryMoments,
    }

    return <MemoryContext.Provider value={contextValue}>{children}</MemoryContext.Provider>
}
export default MemoryContext

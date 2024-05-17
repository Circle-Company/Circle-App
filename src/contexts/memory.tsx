import React from "react"
import api from "../services/api"
import AuthContext from "./auth"
import {useNavigation} from '@react-navigation/native'
import { MemoryReciveDataProps } from "../components/Memory/Memory-types"
import { CommentObject, CommentsReciveDataProps } from "../components/comment/comments-types"

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

    const { user } = React.useContext(AuthContext)
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
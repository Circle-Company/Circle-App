import React, { createContext, useContext } from "react"
import { CommentsReciveDataProps} from "./comments-types"

const CommentsContext = createContext<{ comment: CommentsReciveDataProps} | null>(null)

export function useCommentsContext() {
    const context = useContext(CommentsContext)
    if(!context) {
        throw new Error("Comment.* component must be rendered as child of Comment component")
    }
    return context
}

export default CommentsContext
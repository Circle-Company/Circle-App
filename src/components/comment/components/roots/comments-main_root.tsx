import React from "react"
import { CommentsMainRootProps } from "../../comments-types"
import CommentContext from "../../comments-context"

export default function main_root ({children, data}: CommentsMainRootProps) {
    return <CommentContext.Provider value={{comment: data}}>{children}</CommentContext.Provider>
}
import React from "react"
import CommentContext from "../../comments-context"
import { CommentsMainRootProps } from "../../comments-types"

export default function main_root({ children, data, preview = true }: CommentsMainRootProps) {
    return (
        <CommentContext.Provider value={{ comment: data, preview }}>
            {children}
        </CommentContext.Provider>
    )
}

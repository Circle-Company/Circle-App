import React from "react"

export type CommentObject = {
    id: string
    content: string
    richContent?: string
    user: {
        id: string
        username: string
        profilePicture: string
        verified?: boolean
    }
    sentiment: string
    createdAt: string
}

export type CommentsReciveDataProps = Array<CommentObject>

export type CommentsMainRootProps = {
    data: CommentsReciveDataProps
    preview?: boolean
    children: React.ReactNode
}
export type CommentsContainerProps = {
    children: React.ReactNode
    focused?: boolean
}
export type CommentsTopRootProps = {
    children: React.ReactNode
}
export type CommentsTopLeftRootProps = {
    children: React.ReactNode
}
export type CommentsTopRightRootProps = {
    children: React.ReactNode
}
export type CommentsCenterRootProps = {
    children: React.ReactNode
}
export type CommentsRenderCommentProps = {
    comment: CommentObject
    preview: boolean
    index: number
}
export type CommentsHeaderLeftProps = {
    children: React.ReactNode
}
export type CommentsInputProps = {
    color?: string
    autoFocus: boolean
    momentId: string
    onSent?: () => void
}
export type CommentsListCommentsProps = {
    comment: CommentObject[]
    hideZeroMessage?: boolean
}

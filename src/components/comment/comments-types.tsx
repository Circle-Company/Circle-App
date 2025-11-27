import React from "react"

export type CommentObject = {
    id: string
    user: {
        id: string
        username: string
        profilePicture?: string
        verified?: boolean
    }
    content: string
    richContent?: string
    totalLikes: number
    isLiked: boolean
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
    placeholder?: string
    backgroundColor?: string
    color?: string
    preview?: boolean
    autoFocus: boolean
}
export type CommentsListCommentsProps = {
    comment: CommentObject[]
    hideZeroMessage?: boolean
}

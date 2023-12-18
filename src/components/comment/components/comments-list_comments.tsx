import React from "react"
import { View, Text } from "react-native"
import { CommentsListCommentsProps } from "../comments-types"
import { useCommentsContext } from "../comments-context"
import RenderComment from "./comments-render_comment"

export default function list_comments ({}: CommentsListCommentsProps) {
    const {comment} = useCommentsContext()
    
    return (
        <>
            {comment.comments_data.map((comment, index) => {
                return (
                    <RenderComment
                        key={comment.id}
                        comment={comment}
                        index={index}
                    />
                )
            })}
        </>
    )
}
import { Comments } from "@/components/comment"
import MomentContext from "@/components/moment/context"
import React from "react"

export default function RenderCommentFull() {
    const { data, options } = React.useContext(MomentContext)
    const comments = Array.isArray(data.comments) ? data.comments : []
    return (
        <Comments.MainRoot data={comments} preview={false}>
            <Comments.Container focused={options.isFocused}>
                <Comments.CenterRoot>
                    <Comments.ListComments comment={comments} />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}

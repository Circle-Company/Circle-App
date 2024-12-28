import React from "react"
import { Comments } from "../../../components/comment"
import MomentContext from "../../../components/moment/context"

export default function render_comment_full() {
    const { momentData, momentOptions } = React.useContext(MomentContext)
    return (
        <Comments.MainRoot data={momentData.comments} preview={false}>
            <Comments.Container focused={momentOptions.isFocused}>
                <Comments.CenterRoot>
                    <Comments.ListComments />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}

import Reanimated, { FadeInUp } from "react-native-reanimated"

import React from "react"
import { FlatList } from "react-native"
import sizes from "../../../constants/sizes"
import { CommentObject } from "../comments-types"
import RenderComment from "./comments-render_comment"
import ZeroComments from "./comments-zero_comments"
import { View } from "react-native"

function PreviewCommentsList({ comment }: { comment: CommentObject[] }) {
    if (comment?.length === 0) {
        return <ZeroComments />
    } else {
        return (
            <View style={{ width: sizes.moment.standart.width, alignSelf: "center" }}>
                <Reanimated.View
                    style={{ width: "95%", alignSelf: "center" }}
                    entering={FadeInUp.duration(100)}
                >
                    <RenderComment preview={true} comment={comment[0]} index={0} />
                </Reanimated.View>
            </View>
        )
    }
}

export default PreviewCommentsList

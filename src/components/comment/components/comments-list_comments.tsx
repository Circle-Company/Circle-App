import Reanimated, { FadeInUp } from "react-native-reanimated"

import React from "react"
import { FlatList } from "react-native"
import sizes from "../../../layout/constants/sizes"
import { CommentObject } from "../comments-types"
import RenderComment from "./comments-render_comment"
import ZeroComments from "./comments-zero_comments"

function PreviewCommentsList({ comment }: { comment: CommentObject[] }) {
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            scrollEnabled={false}
            data={comment}
            keyExtractor={(item: CommentObject, index: number) => String(item.id || index)}
            renderItem={({ item, index }) => (
                <Reanimated.View
                    style={{ width: "95%", alignSelf: "center" }}
                    entering={FadeInUp.duration(100 * (index + 1))}
                >
                    <RenderComment preview={true} comment={item} index={index} />
                </Reanimated.View>
            )}
            ListFooterComponent={() => {
                if (comment?.length === 0) {
                    return <ZeroComments />
                }
                return null
            }}
            style={{ width: sizes.moment.standart.width, alignSelf: "center" }}
        />
    )
}

export default PreviewCommentsList

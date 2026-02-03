import Reanimated, { FadeInUp } from "react-native-reanimated"
import sizes from "@/constants/sizes"
import { CommentObject } from "../comments-types"
import RenderComment from "./comments-render_comment"

import { View } from "react-native"

function PreviewCommentsList({ comment }: { comment: CommentObject[] }) {
    if (comment?.length === 0) {
        return null
    } else {
        return (
            <View
                style={{
                    width: "100%",
                    paddingHorizontal: sizes.paddings["1sm"],
                    alignItems: "stretch",
                }}
            >
                <Reanimated.View style={{ width: "100%" }} entering={FadeInUp.duration(100)}>
                    <RenderComment preview={true} comment={comment[0]} index={0} />
                </Reanimated.View>
            </View>
        )
    }
}

export default PreviewCommentsList

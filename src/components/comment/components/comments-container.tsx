import React from "react"
import { View } from "react-native"
import { CommentsContainerProps } from "../comments-types"
import MomentContext from "../../moment/context"

export default function container({ children, focused }: CommentsContainerProps) {
    const { momentSize } = React.useContext(MomentContext)

    const container: any = {
        width: momentSize.width,
    }

    if (focused) return <View style={container}>{children}</View>
    else return null
}

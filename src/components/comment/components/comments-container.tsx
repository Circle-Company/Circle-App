import React from "react"
import { View } from "react-native"
import MomentContext from "../../moment/context"
import { CommentsContainerProps } from "../comments-types"

export default function Container({ children, focused }: CommentsContainerProps) {
    const { momentSize } = React.useContext(MomentContext)

    const container: any = {
        width: momentSize.width,
    }

    if (focused) return <View style={container}>{children}</View>
    else return null
}

import React from "react"
import { View } from "react-native"
import { CommentsContainerProps } from "../comments-types"
import MomentContext from "../../moment/context"
import sizes from "../../../layout/constants/sizes"

export default function container ({children, focused}: CommentsContainerProps) {
    const { momentSize } = React.useContext(MomentContext)
    
    const container:any = {
        width: momentSize.width
    }

    if(focused) return <View style={container}>{children}</View>
    else return null
}
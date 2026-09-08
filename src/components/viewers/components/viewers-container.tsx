import React from "react"
import { View } from "react-native"
import MomentContext from "../../moment/context"
import { ViewersContainerProps } from "../viewers-types"

export default function Container({ children, focused = true }: ViewersContainerProps) {
    const { size } = React.useContext(MomentContext)

    // Mesma largura do card, como o bloco de comentários — o painel nasce
    // debaixo do moment e tem que alinhar com ele.
    const container: any = {
        width: size.width,
    }

    if (focused) return <View style={container}>{children}</View>
    else return null
}

import React from "react"
import { View, Text, Pressable } from "react-native"

import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentUsernameProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import { truncated } from "../../../algorithms/processText"

export default function description ({
}: MomentUsernameProps) {
    const { moment } = useMomentContext()

    const container:any = {
        margin: Sizes.margins["1sm"],
    }
    const description_style:any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        textShadowColor: '#00000070',
        textShadowOffset: { width: 0.3, height: 0.7 },
        textShadowRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
    
    return (
        <View style={container}>
            <Text style={description_style}>{truncated({text:String(moment.description), size: 69})}
            </Text>  
        </View>
    )
}
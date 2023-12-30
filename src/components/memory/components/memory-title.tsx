import React from "react"
import { View, Text } from "react-native"
import { MemoryHeaderLeftProps } from "../memory-types"
import sizes from "../../../layout/constants/sizes"
import { useMomentContext } from "../../moment/moment-context"
import { truncated } from "../../../algorithms/processText"
import { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"

type MemoryDescriptionProps = {
}

export default function title ({}: MemoryDescriptionProps) {
    const {moment} = useMomentContext()

    const container:any = {
        zIndex: 4,
        alignitems: 'flex-start',
        justifyContent: 'center',
    }
    const text_style: any = {
        lineHeight: 13,
        fontSize: fonts.size.body*0.9,
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
            <Text style={text_style}>{truncated({text: String(moment.description), size: 41})}</Text>
        </View>
    )
}
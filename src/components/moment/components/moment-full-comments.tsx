import React from "react"
import { View, Text } from "react-native"
import fonts from "../../../layout/constants/fonts"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import Icon from '../../../assets/icons/svgs/text_bubble.svg'
import { formatNumberWithDots } from "../../../algorithms/numberConversor"

type MomentFullCommentsProps = {
    color?: string,
    comments: number
}

export default function comments ({
    comments,
    color = String(ColorTheme().text),
}: MomentFullCommentsProps) {

    const container:any = {
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    }
    const number_style:any = {
        fontSize: fonts.size.body*0.8,
        fontFamily: fonts.family.Semibold,
        color
    }
    if(comments == 0) return null
    else return (
        <View style={container}>
        <Icon fill={color} width={14} height={14} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
        <Text style={number_style}>{formatNumberWithDots(comments)}</Text>  
        </View>
    )
}
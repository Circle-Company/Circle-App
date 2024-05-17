import React from "react"
import { View, Text } from "react-native"
import fonts from "../../layout/constants/fonts"
import ColorTheme from "../../layout/constants/colors"
import { timeDifferenceConverter } from '../../algorithms/dateConversor'
import sizes from "../../layout/constants/sizes"
import ClockIcon from '../../assets/icons/svgs/clock.svg'

type DateProps = {
    date: string,
    color?: string,
    backgroundColor?: string,
    scale?: number
}
export default function RenderDate ({
    date,
    color = String(ColorTheme().text),
    backgroundColor,
    scale = 1
}: DateProps) {

    const container:any = {
        height: (sizes.sizes["2md"]*0.7) * scale,
        borderRadius: ((sizes.sizes["2md"]*0.7)/2) * scale,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizes.paddings["1sm"] * scale,
        backgroundColor,
        flexDirection: 'row'
    }
    const description_style:any = {
        fontSize: (fonts.size.body*0.75) * scale,
        fontFamily: fonts.family.Semibold,
        color
    }
    
    return (
        <View style={container}>
            <ClockIcon fill={color} width={12 * scale} height={12 * scale} style={{marginRight: (sizes.margins["1sm"]*1.4) * scale}}/>
            <Text style={description_style}>{date}</Text>  
        </View>
    )
}
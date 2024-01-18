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
    backgroundColor?: string
}
export default function RenderDate ({
    date,
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: DateProps) {

    const container:any = {
        height: sizes.sizes["2md"]*0.9,
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizes.paddings["2sm"],
        backgroundColor,
        flexDirection: 'row'
    }
    const description_style:any = {
        fontSize: fonts.size.body*0.8,
        fontFamily: fonts.family.Semibold,
        color
    }
    
    return (
        <View style={container}>
            <ClockIcon fill={color} width={16} height={16} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
            <Text style={description_style}>{date}</Text>  
        </View>
    )
}
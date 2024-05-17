import React from "react"
import { View, Text } from "react-native"
import fonts from "../../../layout/constants/fonts"
import ColorTheme from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import { timeDifferenceConverter } from '../../../algorithms/dateConversor'
import sizes from "../../../layout/constants/sizes"
import ClockIcon from '../../../assets/icons/svgs/clock.svg'
import MomentContext from "../context"

export default function date ({
    color = String(ColorTheme().text),
    paddingHorizontal = sizes.paddings["2sm"],
    backgroundColor
}: MomentDateProps) {
    const { momentData } = React.useContext(MomentContext) ;

    const container:any = {
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal,
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
        <ClockIcon fill={color} width={14} height={14} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
        <Text style={description_style}>{timeDifferenceConverter({date: String(momentData.created_at), small: false})}</Text>  
        </View>
    )
}
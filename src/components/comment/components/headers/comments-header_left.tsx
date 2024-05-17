import React from "react"
import { View, Text } from "react-native"
import { CommentsHeaderLeftProps } from "../../comments-types"
import Trend from '../../../../assets/icons/svgs/trend.svg'
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"

export default function header_left ({}: CommentsHeaderLeftProps) {
    
    const container:any = {
        paddingLeft: sizes.paddings["1sm"]*0.7,
        flexDirection: 'row',
        width: 120,
        borderRadius: 20,
        paddingVertical: 4,
    }
    const text: any ={
        marginLeft: sizes.margins["1sm"]*1.4,
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text
    }

    return (
        <View style={container}>
            <Trend
                style={{top: 1}}
                fill={String(ColorTheme().text)}
                width={15}
                height={15}
            />
            <Text style={text}>Most Relevant</Text>
        </View>
    )           
    

}
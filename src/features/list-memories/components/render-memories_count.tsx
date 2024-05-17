import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { View } from "react-native"
import { Text } from "../../../components/Themed"
import MemoryIcon from '../../../assets/icons/svgs/memories.svg'
import React from "react"

type RenderMemoriesCountProps = {
    count: number,
    backgroundColor?: string,
    color?: string,
    icon?: React.ReactNode
}

export default function RenderMemoriesCount ({
    count,
    backgroundColor,
    color = String(ColorTheme().text),
    icon = <MemoryIcon fill={color} width={11} height={11} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
}: RenderMemoriesCountProps) {
    const container:any = {
        height: sizes.sizes["2md"]*0.7,
        borderRadius: (sizes.sizes["2md"]*0.7)/2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizes.paddings["1sm"],
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
            {icon}
            <Text style={description_style}>{count}</Text>  
        </View>
    )
}
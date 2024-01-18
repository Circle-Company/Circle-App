import React from "react"
import { View, Pressable, useColorScheme} from "react-native"
import { Text } from "../../../components/Themed"

import sizes from "../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import RankingIcon from '../../../assets/icons/svgs/star.svg'


type RenderRankingCardProps = {
    text: string,
    backgroundColor?: string,
    color?: string
}

export default function RenderRankingHeader ({
    text,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    color = String(ColorTheme().text)
}: RenderRankingCardProps) {

    const isDarkMode = useColorScheme() === 'dark'

    const container:any = {
        height: sizes.sizes["2md"]*0.7,
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
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
            <RankingIcon fill={color} width={12} height={12} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
            <Text style={description_style}>{text}</Text>  
        </View>
    )
}
import React from "react"
import sizes from "../../../layout/constants/sizes"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import Icon from '../../../assets/icons/svgs/binoculars_outline.svg'
import { Text, View} from "../../Themed"

export default function not_typing() {

    const container: any = {
        width: sizes.screens.width,
        height: sizes.screens.height - sizes.bottomTab.height,
        alignItems: 'center',
        justifyContent: 'center',
    }

    const text_style: any = {
        fontSize: fonts.size.headline,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary
    }
    return (
        <View style={container}>
            <Icon
                fill={String(ColorTheme().primary)}
                width={60}
                height={60}
            />         
            <Text style={text_style}>Search for your friends</Text>     
        </View>
    )
}
import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { ProfileNameProps } from "../profile-types"
import ShareIcon from '../../../assets/icons/svgs/arrow_shape_right.svg'
import ButtonStandart from "../../buttons/button-standart"
import { useProfileContext } from "../profile-context"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"

export default function name ({
    color = String(ColorTheme().text),
}: ProfileNameProps) {

    const { user } = useProfileContext()

    const container: any = {
        marginHorizontal: sizes.margins["1sm"],
        flexDirection: 'row',
        alignitems: 'center',
        justifyContent: 'center'
    }

    const text_style: any = {
        fontSize: fonts.size.title3,
        fontFamily: fonts.family.Bold,
        color
    }
    return (
        <View style={container}>
            <Text style={text_style}>{user.name}</Text>
        </View>
        
    )
}
import React from "react"
import { View, useColorScheme} from "react-native"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import { colors } from "../../../layout/constants/colors"
import { ProfileDescriptionProps } from "../profile-types"
import { useProfileContext } from "../profile-context"
import ColorTheme from "../../../layout/constants/colors"

export default function description ({
}: ProfileDescriptionProps) {

    const {user} = useProfileContext()
    const isDarkMode = useColorScheme() === 'dark'

    const container:any = {
        width: sizes.screens.width,
        marginTop: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        minHeight: sizes.sizes["1lg"],
        borderTopWidth: sizes.borders['1md'],
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
        backgroundColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_01,
    }
    const description_style:any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

    if(!user.description){
        return null
    }
    
    return (
        <View style={container}>
            <Text style={description_style}>{user.description}</Text>  
        </View>
    )
}
import React from "react"
import { View } from "react-native"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import { colors } from "../../../layout/constants/colors"
import { ProfileDescriptionProps } from "../profile-types"
import { useProfileContext } from "../profile-context"

export default function description ({
}: ProfileDescriptionProps) {

    const {user} = useProfileContext()

    const container:any = {
        margin: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["2sm"]
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
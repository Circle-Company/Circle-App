import React from "react"
import { View, useColorScheme, Image} from "react-native"
import FastImage from "react-native-fast-image"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { UserProfilePictureProps } from "../user_show-types"
import { useUserShowContext } from "../user_show-context"

export default function profile_picture ({
    displayOnMoment = true,
    pictureDimensions
}: UserProfilePictureProps) {

    const { user } = useUserShowContext()

    const isDarkMode = useColorScheme() === "dark"
    const outlineSize: Number = Number(Number(pictureDimensions.width)/8)// /6
    const container: any = {
        marginHorizontal: sizes.paddings["1sm"]/2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: + Number([Number(pictureDimensions.width) + Number(outlineSize)]) /2,
        backgroundColor: displayOnMoment? ColorTheme().blur_display_color: isDarkMode? colors.gray.grey_06: colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
    }

    return (
        <View style={container}>
            <FastImage
                source={{ uri: String(user.profile_picture.small_resolution) || '' }}
                style={{
                    width: Number(pictureDimensions.width),
                    height: Number(pictureDimensions.height),
                    borderRadius: Number(pictureDimensions.width)/2,
                    position: 'absolute',
                    top: Number(outlineSize)/2,
                    left: Number(outlineSize)/2
                }}
            />
        </View>
    )
}
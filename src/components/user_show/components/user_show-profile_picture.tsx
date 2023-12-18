import React from "react"
import { View, useColorScheme, Image} from "react-native"
import FastImage from "react-native-fast-image"
import { BlurView } from "@react-native-community/blur"
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
    const out_container:any = {
        overflow: "hidden",
        marginHorizontal: sizes.paddings["1sm"]/2,
        borderRadius: + Number([Number(pictureDimensions.width) + Number(outlineSize)]) /2,
    }
    const blur_container: any = {
        backgroundColor: displayOnMoment? ColorTheme().blur_display_color: isDarkMode? colors.gray.grey_06: colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
    }

    return (
        <View style={out_container}>
            <BlurView
                overlayColor={String(colors.transparent.black_00)}
                blurAmount={sizes.blur.blurAmount}
                style={blur_container}
            />
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
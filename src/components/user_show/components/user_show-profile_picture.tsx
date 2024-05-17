import React from "react"
import { View, useColorScheme, Image, Pressable, Text} from "react-native"
import FastImage from "react-native-fast-image"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { UserProfilePictureProps } from "../user_show-types"
import { useUserShowContext } from "../user_show-context"
import { UserShowActions } from "../user_show-actions"
import { useNavigation } from "@react-navigation/native"
import ViewProfileContext from "../../../contexts/viewProfile"
import Animated, { FadeIn } from "react-native-reanimated"

export default function profile_picture ({
    displayOnMoment = true,
    disableAnalytics = false,
    pictureDimensions
}: UserProfilePictureProps) {

    const { user, view_profile} = useUserShowContext()
    const {setProfile} = React.useContext(ViewProfileContext)
    const navigation = useNavigation()

    const isDarkMode = useColorScheme() === "dark"
    const outlineSize: Number = Number(Number(pictureDimensions.width)/(displayOnMoment? 8 : 14))// /6
    const container: any = {
        marginHorizontal: sizes.paddings["1sm"]/2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: + Number([Number(pictureDimensions.width) + Number(outlineSize)]) /2,
        backgroundColor: displayOnMoment? ColorTheme().blur_display_color: isDarkMode? colors.gray.grey_07: colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
        overflow: 'hidden'
    }

    const [profilePicture, setProfilePicture] = React.useState<string>('')
    async function onProfilePictureAction() {
        if(disableAnalytics == false){
            UserShowActions.ProfilePicturePressed({user_id: Number(user.id), action: view_profile, user})
            await setProfile(user.id)
            navigation.navigate('ProfileNavigator')
        }
    }

    React.useEffect(() => {
            if(user.profile_picture?.small_resolution == undefined){
                setProfilePicture(String(user.profile_picture?.tiny_resolution))
            } else {
                setProfilePicture(String(user.profile_picture?.small_resolution))
            }                
    
    }, [])

        return (
            <Animated.View entering={FadeIn.duration(200)}>
            <Pressable onPress={onProfilePictureAction} style={container}>
                <FastImage
                    source={{ uri: String(profilePicture) || '' }}
                    style={{
                        width: Number(pictureDimensions.width),
                        height: Number(pictureDimensions.height),
                        borderRadius: Number(pictureDimensions.width)/2,
                        position: 'absolute',
                        top: Number(outlineSize)/2,
                        left: Number(outlineSize)/2
                    }}
                />
            </Pressable>                
            </Animated.View>

        )        



}
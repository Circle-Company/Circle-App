import React from "react"
import { Animated, Pressable, View, useColorScheme } from "react-native"
import FastImage from "react-native-fast-image"
import Icon from "../../../assets/icons/svgs/@2.svg"
import { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { useProfileContext } from "../profile-context"
import { ProfilePictureProps } from "../profile-types"

export default function picture({ fromProfile = false }: ProfilePictureProps) {
    const { user } = useProfileContext()
    const isDarkMode = useColorScheme() === "dark"
    const [profilePicture, setProfilePicture] = React.useState<string>("")

    const pictureDimensions = {
        width: 100,
        height: 100,
        padding: 10,
        borderRadius: 133 / 2,
    }
    const outlineSize: Number = Number(Number(pictureDimensions.width) / 20)

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: sizes.margins["1sm"],
        borderRadius: +Number([Number(pictureDimensions.width) + Number(outlineSize)]) / 2,
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
    }

    const iconContainer: any = {
        alignSelf: "center",
        justifyContent: "center",
    }

    async function onProfilePictureAction() {}

    var animatedScale = React.useRef(new Animated.Value(0)).current
    var animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 5,
            speed: 80,
            useNativeDriver: true,
        }).start()
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 1,
            delay: 50,
            useNativeDriver: true,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    React.useEffect(() => {
        const { tiny_resolution, small_resolution } = user?.profile_picture || {}

        if (fromProfile) {
            setProfilePicture(small_resolution || tiny_resolution || "")
        } else {
            setProfilePicture(tiny_resolution || small_resolution || "")
        }
    }, [fromProfile, user])

    const animatedContainer: any = {
        transform: [{ scale: animatedScale }],
        opacity: animatedOpacity,
    }

    return (
        <Animated.View style={animatedContainer}>
            <Pressable onPress={onProfilePictureAction} style={[container]}>
                <FastImage
                    source={{ uri: profilePicture }}
                    style={{
                        width: Number(pictureDimensions.width),
                        height: Number(pictureDimensions.height),
                        borderRadius: Number(pictureDimensions.width) / 2,
                        position: "absolute",
                        top: Number(outlineSize) / 2,
                        left: Number(outlineSize) / 2,
                    }}
                />
                {!user?.profile_picture?.tiny_resolution &&
                    !user?.profile_picture?.small_resolution && (
                        <View style={iconContainer}>
                            <Icon
                                width={pictureDimensions.width * 0.5}
                                height={pictureDimensions.height * 0.5}
                                fill={
                                    isDarkMode ? colors.gray.grey_04 + 90 : colors.gray.grey_04 + 50
                                }
                            />
                        </View>
                    )}
            </Pressable>
        </Animated.View>
    )
}

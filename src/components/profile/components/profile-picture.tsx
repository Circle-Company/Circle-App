import AtIcon from "@/assets/icons/svgs/@2.svg"
import LockIcon from "@/assets/icons/svgs/lock.svg"
import { Image } from "expo-image"
import React from "react"
import { Animated, Pressable, View, useColorScheme } from "react-native"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import { useProfileContext } from "../profile-context"
import { ProfilePictureProps } from "../profile-types"

export default function Picture({ fromProfile = false, hasOutline = true }: ProfilePictureProps) {
    const { user } = useProfileContext()
    const isDarkMode = useColorScheme() === "dark"
    const [profilePicture, setProfilePicture] = React.useState<string>("")

    const pictureDimensions = {
        width: 150,
        height: 150,
        borderRadius: 150 / 2,
    }
    const outlineSize: number = hasOutline ? Number(Number(pictureDimensions.width) / 20) : 0

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: sizes.margins["1sm"],
        marginBottom:
            user.interactions.isBlockedBy == false || user.interactions.isBlocking == false
                ? sizes.margins["1md"]
                : 0,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
        backgroundColor: colors.gray.grey_08,
        borderRadius: (Number(pictureDimensions.width) + Number(outlineSize)) / 2,
    }

    const iconContainer: any = {
        alignSelf: "center",
        justifyContent: "center",
    }

    async function onProfilePictureAction() {}

    const animatedScale = React.useRef(new Animated.Value(0)).current
    const animatedOpacity = React.useRef(new Animated.Value(0.2)).current

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
        setProfilePicture(user.profilePicture ? user.profilePicture : "")
    }, [fromProfile, user])

    const animatedContainer: any = {
        transform: [{ scale: animatedScale }],

        opacity: animatedOpacity,
    }

    const hasBlock = user.interactions.isBlocking || user.interactions.isBlockedBy

    if (hasBlock)
        return (
            <Animated.View style={animatedContainer}>
                <View
                    style={{
                        ...container,
                    }}
                >
                    <Image
                        priority={"normal"}
                        recyclingKey={profilePicture}
                        source={{ uri: profilePicture }}
                        blurRadius={150}
                        style={{
                            opacity: 0.4,
                            width: Number(pictureDimensions.width),
                            height: Number(pictureDimensions.height),
                            borderRadius: Number(pictureDimensions.width) / 2,
                            position: "absolute",
                            top: Number(outlineSize) / 2,
                            left: Number(outlineSize) / 2,
                        }}
                    />
                    <View style={iconContainer}>
                        <LockIcon
                            width={pictureDimensions.width * 0.35}
                            height={pictureDimensions.height * 0.35}
                            fill={
                                !user?.profilePicture
                                    ? colors.gray.grey_04 + 90
                                    : colors.gray.grey_03 + 90
                            }
                        />
                    </View>
                </View>
            </Animated.View>
        )
    else
        return (
            <Animated.View style={animatedContainer}>
                <Pressable onPress={onProfilePictureAction} style={container}>
                    <Image
                        priority={"normal"}
                        cachePolicy={"memory"}
                        recyclingKey={profilePicture}
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
                    {!user?.profilePicture && (
                        <View style={iconContainer}>
                            <AtIcon
                                width={pictureDimensions.width * 0.5}
                                height={pictureDimensions.height * 0.5}
                                fill={colors.gray.grey_04 + 90}
                            />
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        )
}

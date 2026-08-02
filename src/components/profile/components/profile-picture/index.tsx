import AtIcon from "@/assets/icons/svgs/@2.svg"
import LockIcon from "@/assets/icons/svgs/lock.svg"
import { Image } from "expo-image"
import React from "react"
import { Animated, Pressable, View } from "react-native"
import { useRouter } from "expo-router"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import PersistedContext from "@/contexts/Persisted"
import { useProfileContext } from "../../profile-context"
import { ProfilePictureProps } from "../../profile-types"
import { isIPad11 } from "@/lib/platform/detection"
import { ProfilePictureAdd } from "./add"
import { ProfilePictureEditButton } from "./edit-button"

export default function Picture({ fromProfile = false, hasOutline = true }: ProfilePictureProps) {
    const { user } = useProfileContext()
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)

    const sessionId = session?.user?.id != null ? String(session.user.id) : ""
    const sessionUsername = (session?.user?.username ?? "").toLowerCase()
    const viewedId = user?.id != null ? String(user.id) : ""
    const viewedUsername = (user?.username ?? "").toLowerCase()
    const isOwnAccount =
        (sessionId !== "" && sessionId === viewedId) ||
        (sessionUsername !== "" && sessionUsername === viewedUsername)
    const showPlaceholder = !user?.profilePicture
    const [profilePicture, setProfilePicture] = React.useState<string>("")

    const pictureDimensions = {
        width: isIPad11 ? 170 : 200,
        height: isIPad11 ? 170 : 200,
        borderRadius: 200 / 2,
    }
    const outlineSize: number = hasOutline ? Number(pictureDimensions.width) / 20 : 0

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: sizes.margins["1sm"],
        marginBottom:
            user.interactions.isBlockedBy == false || user.interactions.isBlocking == false
                ? sizes.margins["1md"]
                : 0,
        width: Number(pictureDimensions.width) + outlineSize,
        height: Number(pictureDimensions.height) + outlineSize,
        backgroundColor: colors.gray.grey_08,
        borderRadius: (Number(pictureDimensions.width) + outlineSize) / 2,
    }

    const iconContainer: any = {
        alignSelf: "center",
        justifyContent: "center",
    }

    function goToProfilePictureSettings() {
        if (isOwnAccount) router.push("/settings/profile-picture")
    }

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
                <View style={{ ...container }}>
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
                            top: outlineSize / 2,
                            left: outlineSize / 2,
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

    if (isOwnAccount && showPlaceholder)
        return (
            <Animated.View style={animatedContainer}>
                <View
                    style={{
                        marginHorizontal: sizes.margins["1sm"],
                        marginBottom: sizes.margins["1md"],
                    }}
                >
                    <ProfilePictureAdd
                        size={pictureDimensions.width}
                        onPress={goToProfilePictureSettings}
                    />
                </View>
            </Animated.View>
        )

    const editBadgeSize = pictureDimensions.width * 0.22
    return (
        <Animated.View style={animatedContainer}>
            <View style={container}>
                <Pressable
                    onPress={goToProfilePictureSettings}
                    style={{
                        width: Number(pictureDimensions.width),
                        height: Number(pictureDimensions.height),
                        borderRadius: Number(pictureDimensions.width) / 2,
                        position: "absolute",
                        top: outlineSize / 2,
                        left: outlineSize / 2,
                        overflow: "hidden",
                    }}
                >
                    <Image
                        priority={"normal"}
                        cachePolicy={"memory"}
                        recyclingKey={profilePicture}
                        source={{ uri: profilePicture }}
                        style={{
                            width: Number(pictureDimensions.width),
                            height: Number(pictureDimensions.height),
                            borderRadius: Number(pictureDimensions.width) / 2,
                        }}
                    />
                    {showPlaceholder && (
                        <View style={iconContainer}>
                            <AtIcon
                                width={pictureDimensions.width * 0.5}
                                height={pictureDimensions.height * 0.5}
                                fill={colors.gray.grey_04 + 90}
                            />
                        </View>
                    )}
                </Pressable>
                {isOwnAccount && !showPlaceholder && (
                    <ProfilePictureEditButton
                        size={editBadgeSize}
                        onPress={goToProfilePictureSettings}
                    />
                )}
            </View>
        </Animated.View>
    )
}

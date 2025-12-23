import { Animated, Pressable, useColorScheme } from "react-native"

import { useRouter } from "expo-router"
import React from "react"
import { colors } from "../../../../constants/colors"
import sizes from "../../../../constants/sizes"
import ViewProfileContext from "../../../../contexts/viewProfile"
import IndividualNotificationContext from "../../notification-individual_context"
import { NotificationProps } from "../../notification-types"

type NotificationContainerProps = {
    children: React.ReactNode
    notification: NotificationProps
}
export default function ContainerMain({ children, notification }: NotificationContainerProps) {
    const bounciness = 12
    const animationScale = 0.9

    const { userProfile } = React.useContext(ViewProfileContext)
    const isDarkMode = useColorScheme() === "dark"

    const router = useRouter()

    const animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [animatedScale])
    const HandleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const HandlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true,
        }).start()
    }

    async function handlePress() {
        if (notification.type === "FOLLOW-USER" || notification.type === "VIEW-USER") {
            await userProfile(notification.sender_user.id)
            router.push(`/profile/${notification.sender_user.id}`)
        } else if (notification.type === "LIKE-MOMENT") {
        }
    }
    const container: any = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        marginHorizontal: sizes.margins["2sm"],
        minHeight: sizes.headers.height * 0.9,
        maxHeight: sizes.headers.height * 1.8,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"],
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
    }

    return (
        <IndividualNotificationContext.Provider value={{ notification: notification }}>
            <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                <Pressable
                    style={container}
                    onPressIn={HandlePressIn}
                    onPressOut={HandleButtonAnimation}
                    onPress={handlePress}
                >
                    {children}
                </Pressable>
            </Animated.View>
        </IndividualNotificationContext.Provider>
    )
}

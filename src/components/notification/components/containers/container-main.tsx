import ViewProfileContext from "@/contexts/viewProfile"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Animated, Pressable } from "react-native"
import sizes from "../../../../layout/constants/sizes"
import IndividualNotificationContext from "../../notification-individual_context"
import { NotificationProps } from "../../notification-types"

type NotificationContainerProps = {
    children: React.ReactNode
    notification: NotificationProps
}
export default function container_main({ children, notification }: NotificationContainerProps) {
    var bounciness = 12
    var animationScale = 0.9

    const { setProfile } = React.useContext(ViewProfileContext)

    const navigation: any = useNavigation()

    var animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
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
        if (notification.type == "FOLLOW-USER" || notification.type == "VIEW-USER") {
            await setProfile(notification.sender_user.id)
            navigation.navigate("ProfileNavigator")
        } else if (notification.type == "LIKE-MOMENT") {
        }
    }
    const container: any = {
        width: sizes.screens.width,
        minHeight: sizes.headers.height * 0.9,
        maxHeight: sizes.headers.height * 1.8,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
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

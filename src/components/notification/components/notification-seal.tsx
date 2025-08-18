import Bolt from "@/assets/icons/svgs/bolt.svg"
import Eye from "@/assets/icons/svgs/eye.svg"
import Heart from "@/assets/icons/svgs/heart.svg"
import User from "@/assets/icons/svgs/person.svg"
import React from "react"
import { View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"

export default function NotificationSeal() {
    const isDarkMode = useColorScheme() === "dark"
    const { notification } = useIndividualNotificationContext()
    const container: any = {
        position: "absolute",
        bottom: 0,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.7,
        alignItems: "center",
        borderColor: ColorTheme().background,
        justifyContent: "center",
    }

    if (notification.type === "FOLLOW-USER") {
        return (
            <View style={[container, { backgroundColor: String(ColorTheme().user) }]}>
                <User width={10} height={10} fill={colors.gray.white.toString()} />
            </View>
        )
    } else if (notification.type === "VIEW-USER") {
        return (
            <View style={[container, { backgroundColor: String(ColorTheme().view) }]}>
                <Eye width={10} height={10} fill={colors.gray.white.toString()} />
            </View>
        )
    } else if (notification.type === "LIKE-MOMENT") {
        return (
            <View style={[container, { backgroundColor: String(ColorTheme().like) }]}>
                <Heart width={10} height={10} fill={colors.gray.white.toString()} />
            </View>
        )
    } else if (notification.type === "ADD-TO-MEMORY" || notification.type === "NEW-MEMORY") {
        return (
            <View
                style={[
                    container,
                    {
                        backgroundColor: isDarkMode
                            ? colors.gray.white.toString()
                            : colors.gray.black.toString(),
                    },
                ]}
            >
                <Bolt
                    width={10}
                    height={10}
                    fill={isDarkMode ? colors.gray.black.toString() : colors.gray.white.toString()}
                />
            </View>
        )
    }
}

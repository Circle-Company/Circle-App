import React from "react"
import { Animated, View, ViewStyle, TextStyle, Linking } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Platform } from "react-native"
import ArrowIcon from "@/assets/icons/svgs/chevron_right.svg"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"
import { t } from "i18next"
import { NotificationBadge } from "./notification.badge"
import { NotificationType } from "@/contexts/push.notification"
import { Pressable } from "react-native"

export function NotificationPermissionNotProvidedCard() {
    const animatedOpacity = React.useRef(new Animated.Value(0)).current
    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 30,
            useNativeDriver: true,
            delay: 90,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        paddingVertical: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingRight: sizes.paddings["1sm"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: colors.gray.grey_09,
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        paddingVertical: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingRight: sizes.paddings["1sm"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    }

    const titleStyle: TextStyle = {
        fontSize: fonts.size.title3,
        fontFamily: fonts.family.ExtraBold,
        textAlign: "left",
    }

    const descriptionStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "left",
    }

    function handlePress() {
        Linking.openSettings()
    }

    if (shouldUseGlass)
        return (
            <GlassContainer>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "99"}
                >
                    <Pressable
                        style={{
                            flexDirection: "row",
                            paddingLeft: sizes.paddings["1md"],
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={handlePress}
                    >
                        <View style={{ width: 60, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 55 }}>🔔</Text>
                            <View
                                style={{
                                    position: "absolute",
                                    top: -2,
                                    right: -10,
                                }}
                            >
                                <NotificationBadge type={NotificationType.MomentLiked} />
                            </View>
                        </View>
                        <View
                            style={{
                                alignItems: "flex-start",
                                marginLeft: sizes.margins["1md"],
                                flex: 1,
                            }}
                        >
                            <Text style={titleStyle}>{t("Enable Notifications")}</Text>
                            <Text style={descriptionStyle}>
                                {t("Know when someone is interacting with you.")}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: 50,
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: sizes.margins["1sm"],
                            }}
                        >
                            <ArrowIcon fill={colors.gray.grey_06} width={22} height={22} />
                        </View>
                    </Pressable>
                </GlassView>
            </GlassContainer>
        )
    else
        return (
            <Animated.View style={[container, { opacity: animatedOpacity }]}>
                <Pressable
                    style={{
                        flexDirection: "row",
                        paddingLeft: sizes.paddings["1md"],
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={handlePress}
                >
                    <View style={{ width: 60, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 55 }}>🔔</Text>
                        <View
                            style={{
                                position: "absolute",
                                top: -2,
                                right: -10,
                            }}
                        >
                            <NotificationBadge type={NotificationType.MomentLiked} />
                        </View>
                    </View>
                    <View
                        style={{
                            alignItems: "flex-start",
                            marginLeft: sizes.margins["1md"],
                            flex: 1,
                        }}
                    >
                        <Text style={titleStyle}>{t("Enable Notifications")}</Text>
                        <Text style={descriptionStyle}>
                            {t("Know when someone is interacting with you.")}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: 50,
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: sizes.margins["1sm"],
                        }}
                    >
                        <ArrowIcon fill={colors.gray.grey_06} width={22} height={22} />
                    </View>
                </Pressable>
            </Animated.View>
        )
}

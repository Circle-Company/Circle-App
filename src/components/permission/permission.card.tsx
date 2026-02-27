import React from "react"
import { Animated, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Platform } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

type PermissionCardProps = {
    title: string
    icon: React.ReactNode
}

export default function PermissionCard({ title, icon }: PermissionCardProps) {
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
        fontSize: fonts.size.title2 * 1.1,
        fontFamily: fonts.family.ExtraBold,
        textAlign: "left",
    }

    if (shouldUseGlass)
        return (
            <GlassContainer>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={false}
                    tintColor={colors.gray.grey_09 + "99"}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            paddingLeft: sizes.paddings["1md"],
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <View style={{ width: 65, alignItems: "center", justifyContent: "center" }}>
                            {icon}
                        </View>
                        <View
                            style={{
                                alignItems: "flex-start",
                                marginLeft: sizes.margins["1md"],
                                flex: 1,
                            }}
                        >
                            <Text style={titleStyle}>{title}</Text>
                        </View>
                    </View>
                </GlassView>
            </GlassContainer>
        )
    else
        return (
            <Animated.View style={[container, { opacity: animatedOpacity }]}>
                <View
                    style={{
                        flexDirection: "row",
                        paddingHorizontal: sizes.paddings["1md"],
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <View style={{ width: 56, alignItems: "center", justifyContent: "center" }}>
                        {icon}
                    </View>
                    <View
                        style={{
                            alignItems: "flex-start",
                            marginLeft: sizes.margins["1md"],
                            flex: 1,
                        }}
                    >
                        <Text style={titleStyle}>{title}</Text>
                    </View>
                </View>
            </Animated.View>
        )
}

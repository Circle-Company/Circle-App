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
    description: string
    hint?: string
    okText?: string
}

export default function PermissionCard({
    title,
    description,
    hint,
    okText,
    icon,
}: PermissionCardProps) {
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
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        paddingVertical: sizes.paddings["1lg"],
        borderRadius: sizes.borderRadius["1lg"] * 2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const titleStyle: TextStyle = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
        marginTop: sizes.margins["2sm"],
        textAlign: "center",
        color: colors.gray.white,
    }

    const descriptionStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
        color: colors.gray.grey_04,
    }

    const hintStyle: TextStyle = {
        marginTop: sizes.margins["1md"],
        color: colors.yellow.yellow_03,
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        textAlign: "center",
    }

    const okTextStyle: TextStyle = {
        marginTop: sizes.margins["1sm"],
        color: colors.green.green_05,
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        textAlign: "center",
    }

    if (shouldUseGlass)
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    colorScheme="dark"
                    style={glassContainer}
                    glassEffectStyle="clear"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "90"}
                >
                    {icon}
                    <Text style={titleStyle}>{title}</Text>
                    <Text style={descriptionStyle}>{description}</Text>
                    {hint ? <Text style={hintStyle}>{hint}</Text> : null}
                    {!hint && okText ? <Text style={okTextStyle}>{okText}</Text> : null}
                </GlassView>
            </GlassContainer>
        )
    else
        return (
            <Animated.View style={[container, { opacity: animatedOpacity }]}>
                {icon}
                <Text style={titleStyle}>{title}</Text>
                <Text style={descriptionStyle}>{description}</Text>
                {hint ? <Text style={hintStyle}>{hint}</Text> : null}
                {!hint && okText ? <Text style={okTextStyle}>{okText}</Text> : null}
            </Animated.View>
        )
}

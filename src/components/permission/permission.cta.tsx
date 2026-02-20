import React from "react"
import { Pressable, StyleSheet, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import ButtonStandart from "@/components/buttons/button-standart"

export type PermissionCTAProps = {
    onAllow: () => void | Promise<void>
    onSkip: () => void | Promise<void>
    onOpenSettings?: () => void | Promise<void>
    disabledAllow?: boolean
    allowLabel?: string
    skipLabel?: string
    style?: ViewStyle
}

export default function PermissionCTA({
    onAllow,
    onSkip,
    onOpenSettings,
    disabledAllow,
    allowLabel = "Allow",
    skipLabel = "Not now",
    style,
}: PermissionCTAProps) {
    return (
        <View style={[styles.ctaContent, style]}>
            {disabledAllow == false && (
                <ButtonStandart
                    action={disabledAllow ? undefined : onAllow}
                    backgroundColor={disabledAllow ? colors.gray.grey_07 : colors.purple.purple_04}
                    margins={false}
                    height={54}
                    width={sizes.screens.width * 0.8}
                >
                    <Text
                        style={[
                            styles.primaryBtnText,
                            disabledAllow && { color: colors.gray.grey_05 },
                        ]}
                    >
                        {allowLabel}
                    </Text>
                </ButtonStandart>
            )}

            <Pressable
                onPress={onSkip}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressedLight]}
            >
                <Text style={styles.secondaryBtnText}>{skipLabel}</Text>
            </Pressable>

            {onOpenSettings ? (
                <Pressable
                    onPress={onOpenSettings}
                    style={({ pressed }) => [styles.linkBtn, pressed && styles.pressedLight]}
                >
                    <Text style={styles.linkBtnText}>Open Settings</Text>
                </Pressable>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    ctaContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.margins["1sm"],
    } as ViewStyle,

    primaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.3,
        fontFamily: fonts.family["Black"],
    } as TextStyle,

    secondaryBtn: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    } as ViewStyle,

    secondaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.05,
        fontFamily: fonts.family["Black"],
    } as TextStyle,

    linkBtn: {
        paddingVertical: 8,
    } as ViewStyle,

    linkBtnText: {
        color: colors.purple.purple_00,
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family["Bold-Italic"],
        textDecorationLine: "underline",
    } as TextStyle,

    pressedLight: { opacity: 0.7 } as ViewStyle,
})

import React from "react"
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"

import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

import { AnimatedCheck } from "./AnimatedCheck"

export type CancelShareCardStatus = "cancellable" | "sharing" | "success"

interface Props {
    status: CancelShareCardStatus
    onCancel: () => void
}

/**
 * Full-screen "Sharing…" / "Shared" overlay. Same visual language as
 * `src/features/moments/feed/render-tutorial-dialog.tsx`.
 *
 *  - `cancellable`: user is still inside the undo window. Spinner + Cancel
 *    button; whole card intent is "you can back out".
 *  - `sharing`: the real network request is in flight. Cancel stays and
 *    aborts compression + axios via the parent's AbortController.
 *  - `success`: share finished. Spinner is replaced by an animated
 *    checkmark and the copy shifts to a "Shared" tone. The parent
 *    auto-dismisses the card a moment later.
 */
export function CancelShareCard({ status, onCancel }: Props): React.ReactElement {
    const { t } = React.useContext(LanguageContext)
    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const isSuccess = status === "success"
    // Cancel button is available throughout the whole flow — only hidden
    // once the share actually succeeds and the check is on screen.
    const showCancel = !isSuccess

    const title = isSuccess ? t("Shared") : `${t("Sharing")}`

    const Content = (
        <View style={styles.contentColumn}>
            {!isSuccess && <Text style={styles.cameraEmoji}>📷</Text>}
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.iconSlot}>
                {isSuccess ? (
                    <AnimatedCheck size={72} />
                ) : (
                    <ActivityIndicator size="small" color={colors.gray.white} />
                )}
            </View>
            {showCancel && (
                <View style={styles.actions}>
                    <ButtonStandart
                        action={onCancel}
                        backgroundColor={colors.gray.white}
                        margins={false}
                        animationScale={0.92}
                    >
                        <Text style={styles.primaryBtnText}>{t("Cancel")}</Text>
                    </ButtonStandart>
                </View>
            )}
        </View>
    )

    if (useGlass) {
        return (
            <View style={styles.backdrop} pointerEvents="box-none">
                <GlassContainer spacing={10}>
                    <GlassView
                        style={styles.glassContainer}
                        colorScheme="dark"
                        glassEffectStyle="regular"
                        isInteractive={true}
                        tintColor={colors.gray.grey_09 + "50"}
                    >
                        {Content}
                    </GlassView>
                </GlassContainer>
            </View>
        )
    }

    return (
        <BlurView intensity={50} style={styles.backdrop} pointerEvents="box-none" tint="dark">
            <View style={styles.container}>{Content}</View>
        </BlurView>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        position: "absolute",
        top: -80,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0)",
        zIndex: 20,
    },
    container: {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingVertical: sizes.paddings["1md"] * 1.1,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    glassContainer: {
        width: sizes.screens.width - sizes.paddings["2md"] * 2,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingTop: sizes.paddings["1xl"],
        paddingBottom: sizes.paddings["1md"] * 1.1,
        paddingHorizontal: sizes.paddings["1sm"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    contentColumn: {
        alignItems: "center",
        width: "100%",
    },
    copy: {
        marginBottom: sizes.margins["1md"],
        alignItems: "center",
        justifyContent: "center",
    },
    cameraEmoji: {
        fontSize: 64,
        lineHeight: 74,
        textAlign: "center",
        marginBottom: sizes.margins["1sm"],
    },
    title: {
        fontSize: fonts.size.headline,
        fontFamily: fonts.family.ExtraBold,
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    subTitle: {
        fontSize: fonts.size.subheadline,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    iconSlot: {
        width: 72,
        minHeight: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["1md"],
    },
    description: {
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        maxWidth: sizes.screens.width * 0.7,
        textAlign: "center",
        marginBottom: sizes.margins["1md"],
    },
    actions: {
        marginTop: 0,
        width: "100%",
        alignItems: "center",
    },
    primaryBtnText: {
        color: colors.gray.black,
        fontSize: fonts.size.body * 1.15,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
    },
})

import React from "react"
import { Platform, View, StyleSheet, ViewStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"
import ButtonStandart from "@/components/buttons/button-standart"
import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

import PersistedContext from "@/contexts/Persisted"
import { Image } from "expo-image"
import { BlurView } from "expo-blur"
import { useTutorial } from "@/contexts/tutorial"

function Illustration1() {
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: sizes.screens.width * 0.8,
                marginBottom: sizes.margins["2md"],
            }}
        >
            <Image
                style={{ width: sizes.screens.width * 0.7, height: sizes.screens.width * 0.7 }}
                contentFit="contain"
                source={require("../../../assets/images/illustrations/tutorial-feed-01.png")}
            />
        </View>
    )
}

function Illustration2() {
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: sizes.screens.width * 0.8,
                marginBottom: sizes.margins["1md"],
            }}
        >
            <Image
                style={{ width: sizes.screens.width * 0.7, height: sizes.screens.width * 0.7 }}
                contentFit="contain"
                source={require("../../../assets/images/illustrations/tutorial-feed-02.png")}
            />
        </View>
    )
}
export function TutorialDialog() {
    const { session } = React.useContext(PersistedContext)
    const { preferences } = session
    const { markFeedStepSeen, dismissTutorials, nextFeedStep } = useTutorial()
    const [step, setStep] = React.useState<0 | 1>(nextFeedStep ?? 0)
    const [hidden, setHidden] = React.useState(false)

    // hidden check moved below hooks to keep hooks order stable

    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const isLast = step === 1
    const stepsData = [
        {
            title: "Your Safety Comes First ✋",
            subTitle: "Press and hold any Moment to access safety tools and reporting options.",
            description:
                "You’re always in control. Use these tools whenever something doesn’t feel right.",
            illustration: <Illustration1 />,
        },
        {
            title: "Discover with a Swipe 👉",
            subTitle: "Swipe left to explore new Moments and keep the experience flowing.",
            description: "Swipe to explore Moments shared by people around you.",
            illustration: <Illustration2 />,
        },
    ] as {
        title: string
        subTitle: string
        description: string
        illustration: React.ReactNode
    }[]
    const { title, subTitle, description, illustration } = stepsData[step]

    const handlePrimary = () => {
        if (!isLast) {
            markFeedStepSeen(0)
            setStep(1)
            return
        }
        preferences.setMuteAudio(false)
        markFeedStepSeen(1)
        dismissTutorials()
        setHidden(true)
    }

    React.useEffect(() => {
        preferences.setMuteAudio(true)
    }, [])

    if (hidden) return null

    const Content = (
        <View style={{ alignItems: "center" }}>
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subTitle}>{subTitle}</Text>
            </View>
            <View style={styles.illustration}>{illustration}</View>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.actions}>
                <ButtonStandart
                    action={handlePrimary}
                    backgroundColor={colors.purple.purple_04}
                    margins={false}
                    height={sizes.buttons.height * 0.7}
                    width={sizes.screens.width - sizes.paddings["1md"] * 2 - 70}
                    animationScale={0.92}
                    style={{ marginBottom: sizes.margins["3sm"] }}
                >
                    <Text style={styles.primaryBtnText}>{isLast ? "Done" : "Next"}</Text>
                </ButtonStandart>
                <Text
                    style={[styles.description, { opacity: 0.8, fontSize: fonts.size.body * 0.8 }]}
                >
                    {isLast ? "2 of 2" : "1 of 2"}
                </Text>
            </View>
        </View>
    )

    if (shouldUseGlass) {
        return (
            <BlurView
                intensity={50}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingBottom: sizes.screens.height * 0.08,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
            >
                <GlassContainer spacing={10}>
                    <GlassView
                        style={styles.glassContainer}
                        colorScheme="dark"
                        glassEffectStyle="regular"
                        isInteractive={true}
                        tintColor={colors.gray.grey_09 + "99"}
                    >
                        {Content}
                    </GlassView>
                </GlassContainer>
            </BlurView>
        )
    }

    return (
        <BlurView
            intensity={50}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingBottom: sizes.screens.height * 0.08,
                alignContent: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
        >
            <View style={styles.container}>{Content}</View>
        </BlurView>
    )
}

const styles = StyleSheet.create({
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
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingTop: sizes.paddings["1xl"],
        paddingBottom: sizes.paddings["1md"] * 1.1,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    illustration: {
        width: 72,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderIllu: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: colors.gray.grey_07,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderIlluText: {
        fontSize: 28,
        color: colors.gray.white,
    },
    copy: {
        marginBottom: sizes.margins["1md"],
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family["ExtraBold"],
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    subTitle: {
        fontSize: fonts.size.subheadline,
        fontFamily: fonts.family["Semibold"],
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    description: {
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        maxWidth: sizes.screens.width * 0.7,
        textAlign: "center",
    },
    actions: {
        marginTop: sizes.margins["1md"],
        width: "100%",
        alignItems: "center",
    },
    primaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.15,
        fontFamily: fonts.family["ExtraBold"],
        fontStyle: "italic",
    },
})

export default TutorialDialog

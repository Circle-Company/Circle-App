import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { useCardIllustrationSize } from "@/features/moments/card-illustration"
import FeedContext from "@/contexts/Feed"
import React from "react"
import { router } from "expo-router"
import { AppState, AppStateStatus, Platform } from "react-native"
import { Image, ImageStyle, TextStyle, ViewStyle, View, Animated } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

// Escala reversa de re-tentativa enquanto o feed continua vazio.
const RETRY_SCHEDULE_MS = [
    30 * 1000, // 30s
    2 * 60 * 1000, // 2min
    5 * 60 * 1000, // 5min
    10 * 60 * 1000, // 10min
    30 * 60 * 1000, // 30min
    60 * 60 * 1000, // 1h
    5 * 60 * 60 * 1000, // 5h
]

// Nível atual da escala, deliberadamente em escopo de MÓDULO:
// - sobrevive a remontagens do card (trocar de aba e voltar não reinicia a
//   escala em 30s, o que castigaria o servidor);
// - morre junto com o contexto JS, ou seja, zera quando o app é fechado e
//   reaberto — exatamente o reinício pedido.
let retryStep = 0

export function EmptyList() {
    const { t } = React.useContext(LanguageContext)
    const illustrationSize = useCardIllustrationSize()
    const { reloadFeed } = React.useContext(FeedContext)

    // `reloadFeed` é recriado a cada render (`() => fetch(true)`), então não
    // pode entrar nas deps do efeito — reagendaria o timer para sempre e ele
    // nunca dispararia. A ref mantém sempre a versão mais recente.
    const reloadFeedRef = React.useRef(reloadFeed)
    reloadFeedRef.current = reloadFeed

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
        reloadFeed()
    }, [])

    // Enquanto este card estiver montado o feed está vazio; quando moments
    // chegam ele desmonta e o cleanup cancela o timer — não é preciso checar
    // o tamanho da lista aqui.
    React.useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null
        let scheduledAt = Date.now()
        let remaining = RETRY_SCHEDULE_MS[Math.min(retryStep, RETRY_SCHEDULE_MS.length - 1)]

        const clear = () => {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
        }

        const schedule = (delay: number) => {
            clear()
            remaining = delay
            scheduledAt = Date.now()
            timer = setTimeout(async () => {
                // Avança na escala antes de buscar: uma falha na requisição não
                // pode prender a re-tentativa no mesmo intervalo curto.
                retryStep = Math.min(retryStep + 1, RETRY_SCHEDULE_MS.length - 1)
                try {
                    await reloadFeedRef.current?.()
                } catch {
                    // silencioso: o próximo passo da escala tenta de novo
                }
                schedule(RETRY_SCHEDULE_MS[retryStep])
            }, delay)
        }

        // Só conta tempo com o app em primeiro plano: ao ir para o background
        // congelamos o que falta e retomamos daí quando voltar.
        const onAppStateChange = (state: AppStateStatus) => {
            if (state === "active") {
                schedule(remaining)
            } else {
                remaining = Math.max(0, remaining - (Date.now() - scheduledAt))
                clear()
            }
        }

        schedule(remaining)
        const subscription = AppState.addEventListener("change", onAppStateChange)

        return () => {
            clear()
            subscription.remove()
        }
    }, [])

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingTop: sizes.paddings["1lg"] * 1.2,
        paddingBottom: sizes.paddings["1lg"] * 1.6,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        paddingTop: sizes.paddings["1lg"],
        paddingBottom: sizes.paddings["1lg"] * 1.6,
        borderRadius: sizes.borderRadius["1lg"] * 2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        marginTop: sizes.margins["1sm"],
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }

    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        marginTop: sizes.margins["1md"],
        maxWidth: sizes.buttons.width,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonLabel: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.2,
        color: colors.gray.black,
    }

    // Ilustração provisória: por ora a mesma do card "Capture Your Day".
    const illustrationStyle: ImageStyle = {
        width: illustrationSize,
        height: illustrationSize,
        marginTop: sizes.margins["1sm"],
        marginBottom: sizes.margins["1md"],
    }

    async function handleShareMoment() {
        router.push("/(tabs)/create")
    }

    if (shouldUseGlass)
        return (
            <Animated.View style={{ opacity: animatedOpacity }}>
                <GlassContainer spacing={10}>
                    <GlassView
                        colorScheme="dark"
                        style={glassContainer}
                        colorScheme="dark"
                        glassEffectStyle="regular"
                        isInteractive={true}
                        tintColor={colors.gray.black + 40}
                    >
                        <Image
                            source={require("@/assets/images/illustrations/NewMoment-Illustration.png")}
                            style={illustrationStyle}
                            resizeMode="contain"
                        />
                        <Text style={title}>{t("Capture Your Day")} ⚡</Text>
                        <Text style={description}>
                            {t(
                                "No recommendations available right now. Why not share a special moment from your day instead?",
                            )}
                        </Text>

                        <ButtonStandart
                            style={buttonContainer}
                            margins={false}
                            action={handleShareMoment}
                        >
                            <Text style={buttonLabel}>{t("Share a Moment")}</Text>
                        </ButtonStandart>
                    </GlassView>
                </GlassContainer>
            </Animated.View>
        )
    else
        return (
            <Animated.View style={{ opacity: animatedOpacity }}>
                <View style={container}>
                    <Image
                        source={require("@/assets/images/illustrations/NewMoment-Illustration.png")}
                        style={illustrationStyle}
                        resizeMode="contain"
                    />
                    <Text style={title}>{t("Capture Your Day")} ⚡</Text>
                    <Text style={description}>
                        {t(
                            "No recommendations available right now. Why not share a special moment from your day instead?",
                        )}
                    </Text>

                    <ButtonStandart
                        style={buttonContainer}
                        margins={false}
                        action={handleShareMoment}
                    >
                        <Text style={buttonLabel}>{t("Share a Moment")}</Text>
                    </ButtonStandart>
                </View>
            </Animated.View>
        )
}

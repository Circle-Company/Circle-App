import UploadIcon from "@/assets/icons/svgs/arrow_up.svg"
import { useIsFocused } from "@react-navigation/core"
import { useRouter, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View, Text, Keyboard, Animated, Easing } from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"
import { useToast } from "@/contexts/Toast"
import sizes from "@/constants/sizes"
import { useNavigation } from "expo-router"
import { SAFE_AREA_PADDING } from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { useCameraContext } from "../context"
import CameraVideoSlider from "../components/CameraVideoSlider"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import ButtonStandart from "@/components/buttons/button-standart"
import LanguageContext from "@/contexts/language"
import { ViewStyle } from "react-native"
import { TextInput } from "react-native"
import { scale } from "happy-dom/lib/PropertySymbol.js"

export function MediaPage(): React.ReactElement {
    const navigation = useNavigation()

    React.useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: "none" },
        })

        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: undefined,
            })
        }
    }, [navigation])
    const router = useRouter()

    const params = useLocalSearchParams<{
        videoUri?: string
        duration?: string
        width?: string
        height?: string
    }>()
    const {
        description,
        setDescription,
        upload,
        uploadError,
        isUploading,
        reset,
        video,
        setTabHide,
    } = useCameraContext()

    React.useEffect(() => {
        setTabHide(true)
    }, [])
    // Get video URI from route params
    const videoUri = params?.videoUri

    // Log video path for debugging
    React.useEffect(() => {
        console.log("📹 MediaPage montado - Video URI (params):", videoUri)
        console.log("📹 Video path (context):", video?.path)
        console.log("📹 Video info completo:", video)
        if (!videoUri && !video?.path) {
            console.error("❌ ERRO: Nenhum URI de vídeo disponível!")
        }
    }, [videoUri, video])
    const isForeground = useIsForeground()
    const isScreenFocused = useIsFocused()
    const isVideoPaused = !isForeground || !isScreenFocused
    const [videoDuration, setVideoDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const { t } = React.useContext(LanguageContext)
    const toast = useToast()

    // Use videoUri from params, fallback to context
    const displayUri = videoUri || video?.path

    // Setup expo-video player
    const player = useVideoPlayer(displayUri || "", (player) => {
        player.loop = true
        player.play()
    })

    // Update play/pause based on foreground state
    React.useEffect(() => {
        if (player) {
            if (isVideoPaused) {
                player.pause()
            } else {
                player.play()
            }
        }
    }, [isVideoPaused, player])

    // Listen to player status
    React.useEffect(() => {
        if (!player) return

        const subscription = player.addListener("statusChange", (status) => {
            if (status.status === "readyToPlay") {
                setVideoDuration(status.duration as any)
            } else if (status.status === "error") {
                setVideoError("Não foi possível reproduzir o vídeo.")
            }
        })

        const timeSubscription = player.addListener("timeUpdate", (update) => {
            setCurrentTime(update.currentTime)
        })

        return () => {
            subscription.remove()
            timeSubscription.remove()
        }
    }, [player])

    // Keyboard animation (linear): scale + translateY compensation to keep top anchored (same as share.description)
    const keyboardAnim = React.useRef(new Animated.Value(0)).current
    const keyboardHeight = React.useRef(new Animated.Value(0)).current
    React.useEffect(() => {
        const willShow = Keyboard.addListener("keyboardWillShow", (e) => {
            Animated.timing(keyboardAnim, {
                toValue: 1,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates?.height ?? 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
        })
        const willHide = Keyboard.addListener("keyboardWillHide", () => {
            Animated.timing(keyboardAnim, {
                toValue: 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
        })
        // Fallback for platforms without "will*" events
        const didShow = Keyboard.addListener("keyboardDidShow", (e) => {
            Animated.timing(keyboardAnim, {
                toValue: 1,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates?.height ?? 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
        })
        const didHide = Keyboard.addListener("keyboardDidHide", () => {
            Animated.timing(keyboardAnim, {
                toValue: 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: 260,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start()
        })
        return () => {
            willShow.remove()
            willHide.remove()
            didShow.remove()
            didHide.remove()
        }
    }, [keyboardAnim, keyboardHeight])

    // Same transform used in share.description: translateY first (to keep top fixed), then scale
    const baseScale = 1
    const focusedScale = 0.8
    const containerHeight = sizes.moment.full.height * 0.8
    const translateCompensation = (containerHeight / 2) * (1 - focusedScale)

    const animatedScaleStyle = {
        transform: [
            {
                translateY: keyboardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -translateCompensation],
                }),
            },
            {
                scale: keyboardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [baseScale, focusedScale],
                }),
            },
        ],
    }

    const animatedDescriptionScale = {
        transform: [
            {
                translateY: keyboardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -translateCompensation * 0.2],
                }),
            },
            {
                scale: keyboardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [baseScale, 1 + focusedScale * 0.7],
                }),
            },
        ],
    }

    const button_text = {
        fontSize: fonts.size.body * 1.3,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.black,
    }

    const buttonsContainer: ViewStyle = {
        marginVertical: sizes.margins["1md"] * 0.6,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    }

    async function handlePress() {
        if (isUploading) return

        Keyboard.dismiss()
        const result = await upload()

        if (result.ok) {
            toast.success(t("Moment Has been uploaded with success"), {
                title: t("Moment Created"),
                icon: <UploadIcon fill={colors.green.green_05.toString()} width={15} height={15} />,
            })

            // Reset camera context
            reset()

            // Navigate to home (Moments tab)
            router.replace("/(tabs)/moments")
        } else {
            toast.error(result.error, {
                backgroundColor: colors.red.red_05.toString(),
                duration: 1000,
                position: "top",
            })
        }
    }

    const [videoError, setVideoError] = useState<string | null>(null)

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.cameraContainer, animatedScaleStyle]}>
                {!displayUri ? (
                    <View style={styles.cameraContainer}>
                        <Text style={{ color: "white", fontSize: 16 }}>
                            ❌ Nenhum vídeo encontrado
                        </Text>
                    </View>
                ) : !videoError ? (
                    <>
                        <VideoView
                            player={player}
                            style={styles.cameraContainer}
                            contentFit="cover"
                            nativeControls={false}
                        />
                        <View
                            style={{
                                position: "absolute",
                                left: 20,
                                bottom: 15,
                                width: "100%",
                                alignItems: "flex-start",
                                paddingHorizontal: 16,
                            }}
                        >
                            <Animated.View style={animatedDescriptionScale}>
                                <TextInput
                                    style={{
                                        color: "white",
                                        fontSize: 14,
                                        fontWeight: "600",
                                        width: sizes.moment.standart.width * 0.82,
                                    }}
                                    numberOfLines={1}
                                    placeholder={t("Add description") + "..."}
                                    maxLength={100}
                                    value={description!}
                                    textAlignVertical="center"
                                    multiline={false}
                                    returnKeyType="done"
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    textContentType="none"
                                    autoCorrect={false}
                                    autoFocus={false}
                                    selectionColor={ColorTheme().primary}
                                    onChangeText={(value) => setDescription(value)}
                                />
                            </Animated.View>
                        </View>
                    </>
                ) : (
                    <View
                        style={[
                            styles.cameraContainer,
                            {
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#222",
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 16,
                                textAlign: "center",
                                padding: 16,
                            }}
                        >
                            {videoError}
                        </Text>
                    </View>
                )}
            </Animated.View>
            <View style={buttonsContainer}>
                <Text style={styles.labelTitle}>
                    {t("This description helps deliver your Moment to the Feed.")}
                </Text>
                {uploadError && (
                    <Text
                        style={[styles.labelTitle, { color: colors.red.red_05, marginBottom: 10 }]}
                    >
                        {uploadError}
                    </Text>
                )}
                <ButtonStandart
                    testID="handle-submit"
                    margins={false}
                    action={handlePress}
                    backgroundColor={colors.gray.white}
                    height={sizes.buttons.height * 0.6}
                    style={{ paddingHorizontal: 35, marginTop: 20 }}
                >
                    <Text style={button_text} testID="handle-submit-text">
                        {isUploading ? t("Sharing...") : t("Share moment")}
                    </Text>
                </ButtonStandart>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "black",
    },
    previewWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    mediaTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        marginTop: 16,
    },
    labelTitle: {
        marginTop: 10,
        width: sizes.screens.width * 0.8,
        alignSelf: "center",
        color: colors.gray.grey_04,
        fontSize: 10,
        textAlign: "center",
    },
    cameraContainer: {
        width: sizes.moment.full.width * 0.85,
        height: sizes.moment.full.height * 0.85,
        backgroundColor: "black",
        borderRadius: 40,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: SAFE_AREA_PADDING.paddingTop,
        left: SAFE_AREA_PADDING.paddingLeft,
        width: 40,
        height: 40,
    },
    icon: {
        textShadowColor: "black",
        textShadowOffset: {
            height: 0,
            width: 0,
        },
        textShadowRadius: 1,
    },
})

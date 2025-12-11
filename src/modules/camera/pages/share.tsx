import IonIcon from "@expo/vector-icons/Ionicons"
import { useIsFocused } from "@react-navigation/core"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useState, useContext } from "react"
import type { ImageLoadEventData, NativeSyntheticEvent } from "react-native"
import { StyleSheet, View, Text, Keyboard, Animated, Easing } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"
import type { OnLoadData, OnVideoErrorData } from "react-native-video"
import Video from "react-native-video"
import sizes from "@/constants/sizes"
import { StatusBarBlurBackground } from "../components/StatusBarBlurBackground"
import { SAFE_AREA_PADDING } from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import type { Routes } from "../routes"
import { useCameraContext } from "../context"
import CameraVideoSlider from "../components/CameraVideoSlider"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import ButtonStandart from "@/components/buttons/button-standart"
import LanguageContext from "@/contexts/Preferences/language"
import { ViewStyle } from "react-native"
import DescriptionInput from "../components/descriptionInput"
import NewMomentContext from "@/contexts/newMoment"
import { TextInput } from "react-native"

type OnLoadImage = NativeSyntheticEvent<ImageLoadEventData>
const isVideoOnLoadEvent = (event: OnLoadData | OnLoadImage): event is OnLoadData =>
    "duration" in event && "naturalSize" in event

type Props = NativeStackScreenProps<Routes, "MediaPage">
export function MediaPage({ navigation, route }: Props): React.ReactElement {
    const { path, type } = route.params
    const [hasMediaLoaded, setHasMediaLoaded] = useState(false)
    const isForeground = useIsForeground()
    const isScreenFocused = useIsFocused()
    const isVideoPaused = !isForeground || !isScreenFocused
    const [videoDuration, setVideoDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const { t } = React.useContext(LanguageContext)
    const [showDescriptionInput, setShowDescriptionInput] = useState(false)
    const { description, setDescription } = useContext(NewMomentContext)

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
    const focusedScale = 0.67
    const containerHeight = sizes.moment.full.height * 0.95
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
                    outputRange: [baseScale, 1 + focusedScale * 0.3],
                }),
            },
        ],
    }

    const button_text = {
        fontSize: fonts.size.body * 1.3,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.black,
    }

    const description_text = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Semibold"],
        color: colors.gray.grey_04,
    }

    const buttonsContainer: ViewStyle = {
        marginVertical: sizes.margins["1md"] * 0.6,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    }

    const handlePress = () => {}
    const onMediaLoad = useCallback((event: OnLoadData | OnLoadImage) => {
        if (isVideoOnLoadEvent(event)) {
            setVideoDuration(event.duration)
            setCurrentTime(0)
            console.log(
                `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
            )
        } else {
            const source = event.nativeEvent.source
            console.log(`Image loaded. Size: ${source.width}x${source.height}`)
        }
    }, [])
    const onMediaLoadEnd = useCallback(() => {
        console.log("media has loaded.")
        setHasMediaLoaded(true)
    }, [])
    const [videoError, setVideoError] = useState<string | null>(null)

    const onMediaLoadError = useCallback((error: OnVideoErrorData) => {
        console.error("Erro ao exibir vídeo:", error, source)
        setVideoError(
            "Não foi possível reproduzir o vídeo. O formato ou resolução pode ser incompatível.",
        )
    }, [])

    // Usar buffer do contexto se disponível
    const { videoBuffer } = useCameraContext()
    const bufferData = useMemo(() => {
        if (videoBuffer) {
            try {
                return JSON.parse(videoBuffer)
            } catch {
                return null
            }
        }
        return null
    }, [videoBuffer])

    const source = useMemo(() => {
        if (bufferData && bufferData.path) {
            return { uri: `file://${bufferData.path}` }
        }
        return { uri: `file://${path}` }
    }, [bufferData, path])

    const videoStyle = useMemo(
        () => ({
            width: bufferData && bufferData.width ? bufferData.width : sizes.moment.full.width,
            height: bufferData && bufferData.height ? bufferData.height : sizes.moment.full.height,
            borderRadius: 25,
            overflow: "hidden",
        }),
        [bufferData],
    )

    const screenStyle = useMemo(() => ({ opacity: hasMediaLoaded ? 1 : 0 }), [hasMediaLoaded])

    return (
        <View style={[styles.container, screenStyle]}>
            <Animated.View style={[styles.cameraContainer, animatedScaleStyle]}>
                {type === "video" && !videoError && (
                    <>
                        <Video
                            source={source}
                            style={styles.cameraContainer}
                            paused={isVideoPaused}
                            resizeMode="cover"
                            repeat={true}
                            controls={false}
                            playWhenInactive={true}
                            ignoreSilentSwitch="ignore"
                            onReadyForDisplay={onMediaLoadEnd}
                            onLoad={onMediaLoad}
                            onError={onMediaLoadError}
                            onProgress={({ currentTime }) => setCurrentTime(currentTime)}
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
                                    value={description}
                                    textAlignVertical="center"
                                    multiline={false}
                                    returnKeyType="done"
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    textContentType="none"
                                    autoCorrect={false}
                                    onChangeText={(value) => setDescription(value)}
                                />
                            </Animated.View>
                        </View>
                        <CameraVideoSlider
                            maxTime={videoDuration}
                            width={sizes.moment.full.width}
                            currentTime={currentTime}
                        />
                    </>
                )}
                {videoError && (
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
            {showDescriptionInput && <DescriptionInput />}
            <View style={buttonsContainer}>
                <Text style={styles.labelTitle}>
                    {t("This description helps deliver your Moment to the Feed.")}
                </Text>
                <ButtonStandart
                    testID="handle-submit"
                    margins={false}
                    action={handlePress}
                    backgroundColor={colors.gray.white}
                    height={sizes.buttons.height * 0.6}
                    style={{ paddingHorizontal: 35, marginTop: 20 }}
                >
                    <Text style={button_text} testID="handle-submit-text">
                        {t("Share moment")}
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
        color: colors.gray.grey_04,
        fontSize: fonts.size.body * 0.7,
        textAlign: "center",
        marginBottom: sizes.margins["1sm"],
    },
    cameraContainer: {
        width: sizes.moment.full.width * 0.95,
        height: sizes.moment.full.height * 0.95,
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

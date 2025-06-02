import ColorTheme, { colors } from "@/layout/constants/colors"
import NewMomentContext, { Video as VideoType } from "@/contexts/newMoment"
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native"
import React, { useRef, useState } from "react"
import Video, { OnLoadData, OnProgressData } from "react-native-video"
import { useNavigation, useRoute } from "@react-navigation/native"

import MultiSlider from "@ptomasroos/react-native-multi-slider"

export default function VideoTrimmerScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const { setSelectedVideo } = React.useContext(NewMomentContext)
    const { videoUri } = route.params as { videoUri: string }
    const [isProcessing, setIsProcessing] = useState(false)
    const [maxDuration] = useState(30)
    const [sliderValues, setSliderValues] = useState<[number, number]>([0, 30])
    const [duration, setDuration] = useState(0)
    const videoRef = useRef<Video | null>(null)
    const isDarkMode = useColorScheme() === "dark"

    const confirmSelection = () => {
        setIsProcessing(true)
        setTimeout(() => {
            const videoData: VideoType = {
                uri: videoUri,
                duration: Math.min(maxDuration, sliderValues[1] - sliderValues[0]),
                type: "video/mp4",
            }
            setSelectedVideo(videoData)
            setIsProcessing(false)
            navigation.goBack()
        }, 1000)
    }

    const handleLoad = (data: OnLoadData) => {
        setDuration(data.duration)
        setSliderValues([0, Math.min(maxDuration, data.duration)])
    }

    const handleProgress = (data: OnProgressData) => {
        if (data.currentTime > sliderValues[1] || data.currentTime < sliderValues[0]) {
            if (videoRef.current) {
                videoRef.current.seek(sliderValues[0])
            }
        }
    }

    const onSliderChange = (values: number[]) => {
        let [start, end] = values
        if (end - start > maxDuration) {
            end = start + maxDuration
        }
        setSliderValues([start, end])
        if (videoRef.current) {
            videoRef.current.seek(start)
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar
                translucent={false}
                backgroundColor={ColorTheme().background}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.video}
                    resizeMode="contain"
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    repeat={false}
                />
            </View>
            <View style={styles.trimmerContainer}>
                <Text style={styles.instructionText}>
                    Selecione o início e o fim do seu vídeo (máx. 30s)
                </Text>
                <MultiSlider
                    values={sliderValues}
                    min={0}
                    max={duration}
                    step={0.1}
                    allowOverlap={false}
                    snapped
                    onValuesChange={onSliderChange}
                    selectedStyle={{ backgroundColor: colors.blue.blue_05 }}
                    markerStyle={{
                        backgroundColor: colors.blue.blue_05,
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: colors.gray.white,
                    }}
                    containerStyle={{ marginHorizontal: 10 }}
                />
                <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>
                        Início: {sliderValues[0].toFixed(1)}s
                    </Text>
                    <Text style={styles.durationText}>
                        Fim: {sliderValues[1].toFixed(1)}s
                    </Text>
                    <Text style={styles.durationText}>
                        Duração: {(sliderValues[1] - sliderValues[0]).toFixed(1)}s
                    </Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.confirmButton,
                        isProcessing && styles.disabledButton
                    ]}
                    disabled={isProcessing}
                    onPress={confirmSelection}>
                    <Text style={styles.buttonText}>
                        {isProcessing ? "Processando..." : "Confirmar"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 10,
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: Platform.OS === "ios" ? 40 : 20,
        marginHorizontal: 20,
        marginTop: "auto",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: colors.gray.grey_05,
    },
    confirmButton: {
        backgroundColor: colors.blue.blue_05,
    },
    container: {
        backgroundColor: ColorTheme().background,
        flex: 1,
    },
    disabledButton: {
        opacity: 0.6,
    },
    durationInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    durationText: {
        color: ColorTheme().text,
        fontSize: 14,
    },
    instructionText: {
        color: ColorTheme().text,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
    },
    trimmerContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    video: {
        height: "100%",
        width: "100%",
    },
    videoContainer: {
        backgroundColor: "#000",
        borderRadius: 12,
        height: 300,
        marginHorizontal: 20,
        marginTop: 20,
        overflow: "hidden",
    },
}) 
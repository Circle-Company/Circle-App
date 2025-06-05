import NewMomentContext, { Video as VideoType } from "@/contexts/newMoment"
import ColorTheme, { colors } from "@/layout/constants/colors"
import { useNavigation, useRoute } from "@react-navigation/native"
import React, { useRef, useState } from "react"
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native"
import Video, { OnLoadData, OnProgressData } from "react-native-video"

import MultiSlider from "@ptomasroos/react-native-multi-slider"

export default function VideoTrimmerScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const { setSelectedVideo } = React.useContext(NewMomentContext)
    const { videoUri } = route.params as { videoUri: string }
    const [isProcessing, setIsProcessing] = useState(false)
    const [maxDuration] = useState(30)
    const [startTime, setStartTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const videoRef = useRef<Video | null>(null)
    const isDarkMode = useColorScheme() === "dark"

    // Calcula o tempo final com base no tempo inicial e na duração máxima
    const getEndTime = () => {
        return Math.min(startTime + maxDuration, duration)
    }

    const confirmSelection = () => {
        setIsProcessing(true)
        setTimeout(() => {
            const videoData: VideoType = {
                uri: videoUri,
                duration: Math.min(maxDuration, getEndTime() - startTime),
                type: "video/mp4",
            }
            setSelectedVideo(videoData)
            setIsProcessing(false)
            navigation.goBack()
        }, 1000)
    }

    const handleLoad = (data: OnLoadData) => {
        setDuration(data.duration)
        // Se o vídeo for mais curto que a duração máxima, definimos o início como 0
        // Caso contrário, permitimos escolher o início
        if (data.duration <= maxDuration) {
            setStartTime(0)
        }
    }

    const handleProgress = (data: OnProgressData) => {
        const endTime = getEndTime()
        if (data.currentTime > endTime || data.currentTime < startTime) {
            if (videoRef.current) {
                videoRef.current.seek(startTime)
            }
        }
    }

    const onSliderChange = (values: number[]) => {
        const [start] = values
        // Verificamos se temos espaço suficiente para os 30 segundos a partir do início
        const maxPossibleStart = Math.max(0, duration - maxDuration)
        const validStart = Math.min(start, maxPossibleStart)
        
        setStartTime(validStart)
        if (videoRef.current) {
            videoRef.current.seek(validStart)
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
                    Selecione o ponto de início do seu vídeo (duração fixa: {maxDuration}s)
                </Text>
                {duration > 0 && (
                    <>
                        <MultiSlider
                            values={[startTime]}
                            min={0}
                            max={Math.max(0, duration - maxDuration)}
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
                        {duration <= maxDuration && (
                            <Text style={styles.maxDurationText}>
                                O vídeo é menor que {maxDuration} segundos, será usado por completo
                            </Text>
                        )}
                    </>
                )}
                <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>
                        Início: {startTime.toFixed(1)}s
                    </Text>
                    <Text style={styles.durationText}>
                        Fim: {getEndTime().toFixed(1)}s
                    </Text>
                    <Text style={styles.durationText}>
                        Duração: {(getEndTime() - startTime).toFixed(1)}s
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
    maxDurationText: {
        color: "#FF6B00",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
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
import NewMomentContext, { Video as VideoType } from "@/contexts/newMoment"
import ColorTheme, { colors } from "@/layout/constants/colors"
import { useNavigation, useRoute } from "@react-navigation/native"
import React, { useRef, useState } from "react"
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native"
import Video, { OnLoadData } from "react-native-video"

export default function VideoTrimmerScreen() {
    const navigation = useNavigation()
    const { videoUri } = useRoute().params as { videoUri: string }
    const { setSelectedVideo } = React.useContext(NewMomentContext)
    const videoRef = useRef<Video | null>(null)
    const isDarkMode = useColorScheme() === "dark"
    
    const [isProcessing, setIsProcessing] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const maxDuration = 30 // Duração fixa de 30 segundos
    
    const endTime = Math.min(startTime + maxDuration, duration)
    const actualDuration = endTime - startTime
    const maxStartTime = Math.max(0, duration - maxDuration)
    
    const handleLoad = (data: OnLoadData) => {
        setDuration(data.duration)
    }
    
    const handleSliderChange = (values: number[]) => {
        const newStart = Math.min(values[0], maxStartTime)
        setStartTime(newStart)
        videoRef.current?.seek(newStart)
    }
    
    const handleConfirm = () => {
        setIsProcessing(true)
        const videoData: VideoType = {
            uri: videoUri,
            duration: actualDuration,
            type: "video/mp4",
        }
        setSelectedVideo(videoData)
        setTimeout(() => navigation.goBack(), 500)
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
                    onProgress={({currentTime}) => {
                        if (currentTime < startTime || currentTime > endTime) {
                            videoRef.current?.seek(startTime)
                        }
                    }}
                    repeat={false}
                />
            </View>
            
            <View style={styles.trimmerContainer}>
                <Text style={styles.instructionText}>
                    Selecione o início do vídeo (duração: {maxDuration}s)
                </Text>
                
                <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>Início: {startTime.toFixed(1)}s</Text>
                    <Text style={styles.durationText}>Fim: {endTime.toFixed(1)}s</Text>
                    <Text style={styles.durationText}>Duração: {actualDuration.toFixed(1)}s</Text>
                </View>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton, isProcessing && styles.disabledButton]}
                    disabled={isProcessing}
                    onPress={handleConfirm}>
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
    sliderContainer: {
        marginHorizontal: 10,
    },
    sliderMarker: {
        backgroundColor: colors.blue.blue_05,
        borderColor: "white",
        borderRadius: 12,
        borderWidth: 2,
        height: 24,
        width: 24,
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
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native"

import React from "react"
import { launchImageLibrary } from "react-native-image-picker"
import { colors } from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import NewMomentContext from "../../../../contexts/newMoment"

export default function RenderSelectVideoFromGalleryButton() {
    const { setSelectedVideo } = React.useContext(NewMomentContext)

    const buttonStyle: ViewStyle = {
        alignItems: "center",
        backgroundColor: colors.blue.blue_05,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
    }

    const buttonTextStyle: TextStyle = {
        color: colors.gray.white,
        fontSize: 16,
        fontFamily: fonts.family.Bold,
    }

    const selectVideo = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: "video",
                selectionLimit: 1,
                includeBase64: false,
            })

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0]
                if (asset.uri) {
                    const video = {
                        uri: asset.uri,
                        duration: asset.duration || 0,
                        type: asset.type || "video/mp4",
                        fileSize: asset.fileSize || 0,
                    }

                    setSelectedVideo(video)
                }
            }
        } catch (error) {
            console.error("Erro ao selecionar vídeo:", error)
        }
    }

    return (
        <TouchableOpacity style={buttonStyle} onPress={selectVideo}>
            <Text style={buttonTextStyle}>Selecionar Vídeo da Galeria</Text>
        </TouchableOpacity>
    )
}

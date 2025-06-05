import ColorTheme, { colors } from "@/layout/constants/colors"
import { FlexAlignType, StatusBar, StyleSheet, useColorScheme } from "react-native"

import { MidiaRender } from "@/components/midia_render"
import { View } from "@/components/Themed"
import NewMomentContext from "@/contexts/newMoment"
import RenderSelectVideoFromGalleryButton from "@/features/new_moment/render-select-video_button"
import RenderSelectButton from "@/features/new_moment/render-select_button"
import sizes from "@/layout/constants/sizes"
import { useNavigation } from "@react-navigation/native"
import React from "react"

export interface Video {
  uri: string;
  duration?: number;
  fileSize?: number;
  type?: string;
}

export default function NewMomentVideoScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const navigation = useNavigation<any>()
    const { selectedVideo } = React.useContext(NewMomentContext)

    const [video, setVideo] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (selectedVideo) setVideo(selectedVideo.uri)
        
        console.log(selectedVideo)
    }, [selectedVideo])

    const styles = StyleSheet.create({
        container: {
            alignItems: "center" as FlexAlignType,
            flex: 1,
            paddingTop: sizes.paddings["1sm"],
        },
        mediaContainer: {
            marginBottom: sizes.margins["1md"],
            overflow: "hidden" as const,
        },
        selectButtonContainer: {
            alignItems: "center" as FlexAlignType,
            height: "90%",
            justifyContent: "center" as const,
            width: sizes.screens.width,
        },
        videoContainer: {
            borderColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_02,
            borderRadius: sizes.moment.standart.borderRadius * 0.6,
            borderWidth: 1.5,
            height: sizes.screens.width * sizes.moment.aspectRatio * 0.9,
            overflow: "hidden" as const,
            width: sizes.screens.width * 0.9,
        }
    })

    const handleProceedToTrimmer = () => {
        if (video) {
            navigation.navigate("VideoTrimmerScreen", { videoUri: video })
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={styles.mediaContainer}>
                {video && (
                    <View style={styles.videoContainer}>
                        <MidiaRender.Root
                            data={{ fullhd_resolution: video }}
                            content_sizes={{
                                ...sizes.moment.standart,
                                width: sizes.screens.width * 0.9,
                                height: sizes.screens.width * sizes.moment.aspectRatio * 0.9,
                                borderRadius: sizes.moment.standart.borderRadius * 0.6,
                            }}
                        >
                            <MidiaRender.RenderVideo
                                uri={video}
                                width={sizes.screens.width * 0.9}
                                height={sizes.screens.width * sizes.moment.aspectRatio * 0.9}
                            />
                        </MidiaRender.Root>
                    </View>
                )}
            </View>

            {video ? (
                <RenderSelectButton onPress={handleProceedToTrimmer} buttonText="Cortar Vídeo" />
            ) : (
                <View style={styles.selectButtonContainer}>
                    <RenderSelectVideoFromGalleryButton />
                </View>
            )}
        </View>
    )
}

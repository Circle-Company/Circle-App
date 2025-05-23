import React, { useState } from "react"
import { Animated, Image } from "react-native"
import FastImage from "react-native-fast-image"
import ColorTheme from "../../../layout/constants/colors"
import { useMidiaRenderContext } from "../midia_render-context"

type RenderImageProps = {
    blur?: boolean
    blurRadius?: number
    blurColor?: string
    enableBlur?: boolean
    isFeed?: boolean
}

export default function render_image({
    blur = false,
    blurRadius = 35,
    blurColor = String(ColorTheme().background),
    enableBlur = true,
    isFeed = false,
}: RenderImageProps) {
    const { content_sizes, midia } = useMidiaRenderContext()
    const [fadeAnim] = useState(new Animated.Value(enableBlur ? 1 : 0))
    const image: any = {
        ...content_sizes,
    }

    const opacity_view: any = {
        position: "absolute",
        zIndex: 3,
        backgroundColor: blurColor,
    }

    function removeBlur() {
        if (!blur) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600, // Tempo da transição (em milissegundos)
                useNativeDriver: true, // Usa o driver nativo para melhor performance
            }).start()
        } else {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600, // Tempo da transição (em milissegundos)
                useNativeDriver: true, // Usa o driver nativo para melhor performance
            }).start()
        }
    }

    if (isFeed) {
        return (
            <Image
                source={{ uri: midia?.fullhd_resolution?.toString() }}
                style={image}
                resizeMode="cover"
                blurRadius={blur ? blurRadius : 0}
            />
        )
    }

    if (!midia) {
        return null
    }

    return (
        <>
            <Animated.View style={[opacity_view, { opacity: fadeAnim }]}>
                <Image
                    source={{ uri: midia?.nhd_resolution?.toString() }}
                    style={image}
                    resizeMode="cover"
                    blurRadius={blurRadius}
                />
            </Animated.View>
            {!blur && (
                <FastImage
                    source={{
                        uri: String(
                            midia?.fullhd_resolution
                                ? midia?.fullhd_resolution
                                : midia?.nhd_resolution
                        ),
                        priority: FastImage.priority.high,
                    }}
                    style={image}
                    resizeMode="cover"
                    onLoadEnd={() => {
                        removeBlur()
                    }}
                />
            )}
        </>
    )
}

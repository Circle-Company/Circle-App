import { Image } from "expo-image"
import React, { useState } from "react"
import { Animated } from "react-native"
import ColorTheme from "../../../constants/colors"
import { useMidiaRenderContext } from "../midia_render-context"

type RenderImageProps = {
    blur?: boolean
    blurRadius?: number
    blurColor?: string
    enableBlur?: boolean
    isFeed?: boolean
}

export default function RenderImage({
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
                    recyclingKey={`${midia.fullhd_resolution}-`}
                    blurRadius={blurRadius}
                    contentFit="cover"
                />
            </Animated.View>
            {!blur && (
                <Image
                    priority={"high"}
                    source={{
                        uri: String(
                            midia?.fullhd_resolution
                                ? midia?.fullhd_resolution
                                : midia?.nhd_resolution,
                        ),
                    }}
                    style={image}
                    contentFit="cover"
                    cachePolicy={"memory"}
                    onLoadEnd={() => {
                        removeBlur()
                    }}
                />
            )}
        </>
    )
}

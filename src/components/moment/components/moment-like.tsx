import { Animated, Pressable, View, ViewStyle, Platform } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"

import LikeIcon from "@/assets/icons/svgs/heart_2.svg"
import LinearGradient from "react-native-linear-gradient"
import BlurredBackground from "../../general/blurred-background"
import MomentContext from "../context"
import { MomentLikeProps } from "../moment-types"
/* eslint-disable no-var */
import React from "react"
import { Vibrate } from "../../../lib/hooks/useHapticFeedback"
import sizes from "../../../constants/sizes"
import { isIOS } from "@/lib/platform/detection"

export default function Like({
    isLiked,
    backgroundColor = colors.gray.grey_07,
    paddingHorizontal = sizes.paddings["2sm"],
    margin = sizes.margins["1sm"],
}: MomentLikeProps) {
    const { data, actions, options } = React.useContext(MomentContext)
    const [likedPressed, setLikedPressed] = React.useState(isLiked ? isLiked : actions.like)
    var animatedScale = React.useRef(new Animated.Value(1)).current
    var animatedScaleIconPressed = React.useRef(new Animated.Value(1)).current
    var animatedScaleIcon = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()

        animatedScaleIconPressed.setValue(0.4)
        animatedScaleIcon.setValue(0.4)
        Animated.spring(animatedScaleIconPressed, {
            toValue: 1,
            bounciness: 12,
            speed: 8,
            useNativeDriver: true,
        }).start()

        animatedScaleIcon.setValue(1.4)
        Animated.spring(animatedScaleIcon, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }
    React.useEffect(() => {
        if (actions.like) {
            setLikedPressed(true)
            HandleButtonAnimation()
        } else {
            setLikedPressed(false)
            HandleButtonAnimation()
        }
    }, [actions.like])

    // O contador de likes deixou de ser renderizado (os estilos `like_text` e
    // `like_text_pressed` também estavam mortos, o que confirma a remoção do texto do
    // botão). Com ele foi embora a cadeia inteira que o calculava: `totalLikes`,
    // `likeDifference` e `adjustedLikes`.

    const buttonWidth = 65 //adjustedLikes > 0 ? 84 : 76
    const borderWidth = 1
    const borderRadiusValue = Number([sizes.buttons.width / 4]) / 2
    const gradientColors = [
        isIOS ? colors.gray.grey_04 + 50 : colors.gray.grey_06,
        isIOS ? colors.gray.grey_05 + 10 : colors.gray.grey_08,
    ]
    const resolvedBackgroundColor = isIOS ? undefined : backgroundColor

    const container: ViewStyle = {
        flex: 1,
        height: "100%",
        borderRadius: borderRadiusValue - borderWidth,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal,
        backgroundColor: "transparent",
        overflow: "hidden",
    }
    const gradient_border: ViewStyle = {
        flex: 1,
        borderRadius: borderRadiusValue,
        padding: borderWidth,
        overflow: "hidden",
    }
    const blur_container_base: ViewStyle = {
        flex: 1,
        borderRadius: borderRadiusValue - borderWidth,
        overflow: "hidden",
    }
    const blur_container: ViewStyle = {
        ...blur_container_base,
        backgroundColor: ColorTheme().blur_button_color,
    }
    const blur_container_background_color: ViewStyle = {
        ...blur_container_base,
        backgroundColor: resolvedBackgroundColor,
    }
    const pressable_container: ViewStyle = {
        overflow: "hidden",
        borderRadius: borderRadiusValue,
        width: "100%",
        height: "100%",
    }
    const animated_container: ViewStyle = {
        width: buttonWidth,
        height: 46,
        margin,
        transform: [{ scale: animatedScale }],
        backfaceVisibility: "hidden",
    }
    const icon_container: ViewStyle = {
        transform: [{ scale: animatedScaleIcon }],
        paddingRight: 4,
        backfaceVisibility: "hidden",
    }
    const icon_container_pressed: ViewStyle = {
        transform: [{ scale: animatedScaleIconPressed }],
        paddingRight: 4,
    }

    async function onLikeAction() {
        try {
            Vibrate("effectClick")
            HandleButtonAnimation()
            actions.registerInteraction("LIKE", {
                momentId: data.id,
            })
        } catch (error) {
            console.error("Erro ao processar like:", error)
        }
    }
    async function onUnlikeAction() {
        try {
            Vibrate("effectTick")
            HandleButtonAnimation()
            actions.registerInteraction("UNLIKE", {
                momentId: data.id,
            })
        } catch (error) {
            console.error("Erro ao processar unlike:", error)
        }
    }

    const like_fill: string = String(colors.gray.white)

    if (!options.enableLike) return null
    else if (likedPressed) {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={onUnlikeAction} style={pressable_container}>
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: isIOS ? 0.5 : 1 }}
                        style={gradient_border}
                    >
                        <BlurredBackground
                            intensity={30}
                            tint="systemMaterialDark"
                            radius={borderRadiusValue - borderWidth}
                            style={[blur_container, { backgroundColor: "transparent" }]}
                        >
                            <View style={container}>
                                <Animated.View style={icon_container_pressed}>
                                    <LikeIcon fill={like_fill} width={20} height={20} />
                                </Animated.View>
                                {/**
                                    <Text style={likedPressed ? like_text_pressed : like_text}>
                                        {displayLikes}
                                    </Text>
                                    */}
                            </View>
                        </BlurredBackground>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        )
    } else if (resolvedBackgroundColor) {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={onLikeAction} style={pressable_container}>
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={gradient_border}
                    >
                        <View style={blur_container_background_color}>
                            <View style={container}>
                                <Animated.View style={icon_container}>
                                    <LikeIcon fill={like_fill} width={18} height={18} />
                                </Animated.View>
                                {/*
                                    <Animated.View style={icon_container}>
                                        <LikeIcon fill={like_fill} width={18} height={18} />
                                    </Animated.View>
                                */}
                            </View>
                        </View>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        )
    } else {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={() => onLikeAction()} style={pressable_container}>
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: isIOS ? 0.5 : 1 }}
                        style={gradient_border}
                    >
                        {Platform.OS === "ios" ? (
                            <BlurredBackground
                                intensity={30}
                                tint="systemChromeMaterial"
                                radius={borderRadiusValue - borderWidth}
                                style={[
                                    blur_container,
                                    { position: "relative", backgroundColor: "transparent" },
                                ]}
                            >
                                <View style={container}>
                                    <Animated.View style={icon_container}>
                                        <LikeIcon fill={like_fill} width={16} height={16} />
                                    </Animated.View>

                                    {/**
                                    <Text style={likedPressed ? like_text_pressed : like_text}>
                                        {displayLikes}
                                    </Text>
                                    *
                                    *
                                    */}
                                </View>
                            </BlurredBackground>
                        ) : (
                            <View style={blur_container}>
                                <View style={container}>
                                    <Animated.View style={icon_container}>
                                        <LikeIcon fill={like_fill} width={16} height={16} />
                                    </Animated.View>
                                    {/**
                                        <Text style={likedPressed ? like_text_pressed : like_text}>
                                            {displayLikes}
                                        </Text>
                                        */}
                                </View>
                            </View>
                        )}
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        )
    }
}

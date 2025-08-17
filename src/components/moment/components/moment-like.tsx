import { Animated, Pressable, TextStyle, View, ViewStyle } from "react-native"
import ColorTheme, { colors } from "../../../layout/constants/colors"

import LikeIcon from "../../../assets/icons/svgs/heart.svg"
import MomentContext from "../context"
import { MomentLikeProps } from "../moment-types"
import NumberConversor from "../../../helpers/numberConversor"
import PersistedContext from "../../../contexts/Persisted"
/* eslint-disable no-var */
import React from "react"
import { Text } from "../../Themed"
import { Vibrate } from "../../../lib/hooks/useHapticFeedback"
import api from "../../../services/Api"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function Like({
    isLiked,
    backgroundColor = colors.gray.grey_07,
    paddingHorizontal = sizes.paddings["2sm"],
    margin = sizes.margins["1sm"],
}: MomentLikeProps) {
    const { session } = React.useContext(PersistedContext)
    const { momentData, momentUserActions, momentOptions } = React.useContext(MomentContext)
    const [likedPressed, setLikedPressed] = React.useState(
        isLiked ? isLiked : momentUserActions.liked
    )
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
        if (momentUserActions.liked) {
            setLikedPressed(true)
            HandleButtonAnimation()
        } else {
            setLikedPressed(false)
            HandleButtonAnimation()
        }
    }, [momentUserActions.liked])

    const container: ViewStyle = {
        minWidth: sizes.buttons.width / 4,
        height: sizes.buttons.height / 2,
        borderRadius: Number([sizes.buttons.width / 4]) / 2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal,
        backgroundColor: "transparent",
        overflow: "hidden",
    }
    const like_text_pressed: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }
    const like_text: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }
    const blur_container = {
        backgroundColor: ColorTheme().blur_button_color,
    }
    const blur_container_background_color = {
        backgroundColor: backgroundColor,
    }
    const blur_container_likePressed = {
        backgroundColor: ColorTheme().like,
    }
    const pressable_container: ViewStyle = {
        overflow: "hidden",
        borderRadius: Number([sizes.buttons.width / 4]) / 2,
    }
    const animated_container = {
        width: sizes.buttons.width / 4,
        height: sizes.buttons.height / 2,
        margin,
        transform: [{ scale: animatedScale }],
    }
    const icon_container = {
        transform: [{ scale: animatedScaleIcon }],
        paddingRight: 4,
    }
    const icon_container_pressed = {
        transform: [{ scale: animatedScaleIconPressed }],
        paddingRight: 4,
    }

    async function onLikeAction() {
        Vibrate("effectClick")
        HandleButtonAnimation()
        momentUserActions.handleLikeButtonPressed({ likedValue: true })
        await api.post(
            `/moments/${momentData.id}/like`,
            {},
            {
                headers: {
                    Authorization: session.account.jwtToken,
                },
            }
        )
    }
    async function onUnlikeAction() {
        Vibrate("effectTick")
        HandleButtonAnimation()
        momentUserActions.handleLikeButtonPressed({ likedValue: false })
        await api.post(
            `/moments/${momentData.id}/unlike`,
            {},
            {
                headers: {
                    Authorization: session.account.jwtToken,
                },
            }
        )
    }

    // Quantidade total de likes que vem do backend
    const totalLikes = Number(momentData?.statistics?.total_likes_num || 0)

    // Determina se um like foi adicionado ou removido em relação ao estado inicial
    const likeDifference = momentUserActions.liked
        ? momentUserActions.initialLikedState
            ? 0
            : 1 // Se está curtido, não soma se já estava curtido, senão soma 1
        : momentUserActions.initialLikedState
            ? -1
            : 0 // Se não está curtido, subtrai 1 se estava curtido, senão não muda

    // Número de likes que será exibido, considerando a interação do usuário
    const adjustedLikes = totalLikes + likeDifference

    // Converte para formato legível
    const displayLikes = NumberConversor(adjustedLikes)

    const like_fill: string = String(colors.gray.white)

    if (!momentOptions.enableLikeButton) return null
    else if (likedPressed) {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={onUnlikeAction} style={pressable_container}>
                    <View style={blur_container_likePressed}>
                        <View style={container}>
                            <Animated.View style={icon_container_pressed}>
                                <LikeIcon fill={like_fill} width={20} height={20} />
                            </Animated.View>
                            <Text style={likedPressed ? like_text_pressed : like_text}>
                                {displayLikes}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        )
    } else if (backgroundColor) {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={onLikeAction} style={pressable_container}>
                    <View style={blur_container_background_color}>
                        <View style={container}>
                            <Animated.View style={icon_container}>
                                <LikeIcon fill={like_fill} width={14} height={14} />
                            </Animated.View>
                            <Text style={likedPressed ? like_text_pressed : like_text}>
                                {displayLikes}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        )
    } else {
        return (
            <Animated.View style={animated_container}>
                <Pressable onPress={() => onLikeAction()} style={pressable_container}>
                    <View style={blur_container}>
                        <View style={container}>
                            <Animated.View style={icon_container}>
                                <LikeIcon fill={like_fill} width={14} height={14} />
                            </Animated.View>
                            <Text style={likedPressed ? like_text_pressed : like_text}>
                                {displayLikes}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        )
    }
}

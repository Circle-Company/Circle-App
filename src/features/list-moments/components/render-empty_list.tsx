import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import React, { useEffect } from "react"
import {
    Animated,
    Easing,
    Image,
    ImageStyle,
    TextStyle,
    useColorScheme,
    ViewStyle,
} from "react-native"
import SearchIcon from "../../../assets/icons/svgs/bolt.svg"
import { Text, View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import { Loading } from "../../../components/loading"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

type RootStackParamList = {
    MomentNavigator: { screen: string }
}

export function EmptyList() {
    const { t } = React.useContext(LanguageContext)
    const { reloadFeed, loading } = React.useContext(FeedContext)
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const isDarkMode = useColorScheme() === "dark"

    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current
    const moveAnim = React.useRef(new Animated.Value(30)).current
    const spinAnim = React.useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const startSpinAnimation = () => {
        spinAnim.setValue(0)
        Animated.timing(spinAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(() => {
            if (loading) startSpinAnimation()
        })
    }
    useEffect(() => {
        reloadFeed()
    }, [])

    useEffect(() => {
        if (loading) {
            startSpinAnimation()
        }
    }, [loading])

    // Estilos como constantes
    const containerStyle: ViewStyle = {
        top: sizes.margins["1xxl"] * 0.8,
        alignItems: "center",
        justifyContent: "center",
    }

    const cardContainerStyle: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: sizes.borderRadius["1lg"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2md"],
        marginBottom: sizes.margins["1md"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
    }

    const illustrationContainerStyle: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["1lg"],
        position: "relative",
    }

    const illustrationStyle: ImageStyle = {
        width: sizes.screens.width * 0.8,
        height: sizes.screens.width * 0.7,
    }

    const messageTextStyle: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Bold,
        textAlign: "center",
        marginBottom: sizes.margins["1sm"],
        color: ColorTheme().text,
    }

    const subMessageTextStyle: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "center",
        marginBottom: sizes.margins["1md"],
        lineHeight: 16,
    }

    const buttonTextStyle: TextStyle = {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family["Bold-Italic"],
        color: colors.gray.white,
    }

    const reloadTextStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginRight: sizes.margins["2sm"],
    }

    return (
        <View style={containerStyle}>
            <View style={cardContainerStyle}>
                <Animated.View
                    style={[
                        illustrationContainerStyle,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateY: moveAnim }],
                        },
                    ]}
                >
                    <Image
                        source={require("../../../assets/images/illustrations/NewMoment-Illustration.png")}
                        style={illustrationStyle}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: moveAnim }, { scale: scaleAnim }],
                    }}
                >
                    <Text style={messageTextStyle}>{t("Capture Your Day")}</Text>
                    <Text style={subMessageTextStyle}>
                        {t(
                            "No recommendations available right now. Why not share a special moment from your day instead?"
                        )}
                    </Text>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: moveAnim }, { scale: scaleAnim }],
                    }}
                >
                    <ButtonStandart
                        animationScale={0.92}
                        width={sizes.buttons.width * 0.6}
                        height={sizes.buttons.height * 0.6}
                        margins={false}
                        backgroundColor={ColorTheme().primary.toString()}
                        action={() => {
                            navigation.navigate("MomentNavigator", {
                                screen: "NewMomentImageScreen",
                            })
                        }}
                    >
                        <Text style={buttonTextStyle}>{t("Share a Moment")}</Text>
                    </ButtonStandart>
                </Animated.View>
            </View>

            <ButtonStandart
                width={loading ? sizes.screens.width * 0.2 : undefined}
                animationScale={0.92}
                margins={false}
                backgroundColor={isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02}
                action={reloadFeed}
            >
                {loading ? (
                    <Loading.Container width={sizes.screens.width * 0.5} height={40}>
                        <Loading.ActivityIndicator size={20} />
                    </Loading.Container>
                ) : (
                    <>
                        <Text style={reloadTextStyle}>{t("Reload Feed")}</Text>
                        <SearchIcon
                            fill={isDarkMode ? colors.gray.white : colors.gray.black}
                            width={14}
                            height={14}
                        />
                    </>
                )}
            </ButtonStandart>
        </View>
    )
}

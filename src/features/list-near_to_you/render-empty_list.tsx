import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import React, { useEffect } from "react"
import {
    Animated,
    Easing,
    TextStyle,
    useColorScheme,
    ViewStyle,
} from "react-native"
import SearchIcon from "../../assets/icons/svgs/antenna_radiowaves_left_and_right.svg"
import { Text, View } from "../../components/Themed"
import ButtonStandart from "../../components/buttons/button-standart"
import { Loading } from "../../components/loading"
import FeedContext from "../../contexts/Feed"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"

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
        alignItems: "center",
        justifyContent: "center",
    }

    const cardContainerStyle: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: sizes.borderRadius["1lg"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2md"],
        marginTop: sizes.margins["2md"],
        marginBottom: sizes.margins["1md"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
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
        <>
            <View style={cardContainerStyle}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: moveAnim }, { scale: scaleAnim }],
                    }}
                >
                    <Text style={messageTextStyle}>
                        {t("Parece que nao tem ninguem por perto.")}
                    </Text>
                    <Text style={subMessageTextStyle}>
                        {t(
                            "verifique se sua conecção com a internet e localização estão habilitadas."
                        )}
                    </Text>
                </Animated.View>
            </View>

            <ButtonStandart
                width={loading ? sizes.screens.width * 0.2 : undefined}
                animationScale={0.92}
                margins={false}
                backgroundColor={isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02}
                action={reloadFeed}
                style={{ alignSelf: "center", margin: 0 }}
            >
                {loading ? (
                    <Loading.Container width={sizes.screens.width * 0.5} height={40}>
                        <Loading.ActivityIndicator size={20} />
                    </Loading.Container>
                ) : (
                    <>
                        <Text style={reloadTextStyle}>{t("Procurar Usuarios")}</Text>
                        <SearchIcon
                            fill={isDarkMode ? colors.gray.white : colors.gray.black}
                            width={18}
                            height={18}
                            style={{ right: -4 }}
                        />
                    </>
                )}
            </ButtonStandart>
        </>
    )
}

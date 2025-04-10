import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import NextIcon from "../../../assets/icons/svgs/arrow_circle_right.svg"
import { Text, View } from "../../../components/Themed"
import UsernameInput from "../../../components/auth/username_input"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function UsernameScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signInputUsername, setErrorMessage } = React.useContext(AuthContext)
    const navigation: any = useNavigation()

    const container = {
        flex: 1,
        alignItems: "center",
    }

    const input_container = {
        alignItems: "center",
        paddingTop: sizes.paddings["1xxl"] * 0.6,
        paddingBottom: sizes.paddings["1xl"] * 0.8,
    }

    const description = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginBottom: sizes.margins["1md"],
    }

    const button_text = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: signInputUsername
            ? colors.gray.white
            : isDarkMode
              ? colors.gray.grey_04 + "90"
              : colors.gray.grey_04 + "90",
    }

    const icon = {
        marginLeft: sizes.margins["2sm"],
        top: 0.4,
    }

    function handlePress() {
        if (signInputUsername) {
            navigation.navigate("Auth-SignUp-Password")
        }
    }

    React.useEffect(() => {
        setErrorMessage("")
    }, [])

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={input_container}>
                <Text style={description}>You can't change it later.</Text>
                <UsernameInput />
            </View>
            <ButtonStandart
                margins={false}
                width={sizes.buttons.width / 2.8}
                height={40}
                action={handlePress}
                backgroundColor={
                    signInputUsername
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>Next Step</Text>
                <NextIcon
                    style={icon}
                    fill={String(
                        signInputUsername
                            ? colors.gray.white
                            : isDarkMode
                              ? colors.gray.grey_04 + "90"
                              : colors.gray.grey_04 + "90"
                    )}
                    width={17}
                    height={17}
                />
            </ButtonStandart>
        </View>
    )
}

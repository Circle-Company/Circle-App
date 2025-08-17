import { StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import ColorTheme, { colors } from "../../../layout/constants/colors"

import ButtonClose from "@/components/buttons/close"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import NextIcon from "../../../assets/icons/svgs/arrow_circle_right.svg"
import UsernameInput from "../../../components/auth/usernameInput"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function UsernameScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signInputUsername, setErrorMessage, setSignInputPassword, setSignInputUsername } =
        React.useContext(AuthContext)
    const navigation: any = useNavigation()

    const container: any = {
        flex: 1,
        alignItems: "center",
    }
    const headerContainer: any = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: sizes.margins["1xl"] * 0.8,
    }
    const headerTitle: any = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.Bold,
    }

    const input_container: any = {
        alignItems: "center",
        paddingBottom: sizes.paddings["1xl"] * 0.8,
    }

    const description: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginBottom: sizes.margins["1md"],
    }

    const button_text: any = {
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
        setSignInputUsername("")
        setSignInputPassword("")
        setErrorMessage("")
    }, [])

    return (
        <View style={container}>
            <StatusBar backgroundColor={colors.gray.black} barStyle={"light-content"} />
            <View style={headerContainer} testID="header-container">
                <ButtonClose />
                <View style={{ flex: 1, marginLeft: sizes.margins["2sm"] }}>
                    <Text style={headerTitle} testID="header-title">
                        Sign Up
                    </Text>
                </View>
            </View>

            <View style={input_container} testID="input-container">
                <Text style={description}>You can't change it later.</Text>
                <UsernameInput type="signUp" />
            </View>
            <ButtonStandart
                testID="handle-submit"
                margins={false}
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
                            : colors.gray.grey_04 + "90",
                    )}
                    width={17}
                    height={17}
                />
            </ButtonStandart>
        </View>
    )
}

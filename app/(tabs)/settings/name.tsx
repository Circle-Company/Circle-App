import React from "react"
import { ViewStyle, TextStyle } from "react-native"
import { Text, View } from "@/components/Themed"
import { useNavigation } from "@react-navigation/native"
import ButtonStandart from "@/components/buttons/button-standart"
import ColorTheme, { colors } from "@/constants/colors"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/language"
import Input from "@/components/general/input"
import { textLib } from "@/circle.text.library"
import { userRules } from "@/config/userRules"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import api from "@/api"

export default function Name() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    const navigation = useNavigation()
    const maxLength = userRules().name.maxLength
    const [name, setname] = React.useState(session.user.name ? session.user.name : "")
    const nameCanBeEdited = React.useMemo(() => {
        return name !== session.user.name && name.length <= maxLength && name.length > 0
    }, [name, session.user.name])

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    const input_container: ViewStyle = {
        width: sizes.screens.width,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        alignItems: "flex-start",
        alignSelf: "center",
        justifyContent: "flex-start",
    }

    const input_style: TextStyle = {
        top: 2,
        fontFamily: fonts.family.Medium,
        width: sizes.screens.width - sizes.paddings["1md"] * 0.7 * 2,
        borderRadius: sizes.borderRadius["1md"],
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1md"],
        minHeight: sizes.screens.height * 0.1,
        maxHeight: sizes.screens.height * 0.4,
    }
    const bottom_style: ViewStyle = {
        width: sizes.screens.width,
        marginTop: sizes.margins["1sm"],
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
    }

    const counter: TextStyle = {
        fontSize: fonts.size.caption1,
        color: maxLength == name.length ? ColorTheme().error : ColorTheme().textDisabled,
    }

    const legend_style: TextStyle = {
        alignSelf: "center",
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        flex: 1,
    }

    const button_text: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Black-Italic"],
        color: nameCanBeEdited ? colors.gray.black : colors.gray.grey_04 + "90",
    }

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setname(formattedText)
    }

    async function handlePress() {
        if (nameCanBeEdited) {
            try {
                await api
                    .put(
                        "/account/name",
                        {
                            name: textLib.rich.formatToEnriched(name),
                        },
                        { headers: { Authorization: session.account.jwtToken } },
                    )
                    .finally(() => {
                        session.user.set({
                            ...session.user,
                            name,
                        })
                        setname("")
                        navigation.goBack()
                    })
            } catch (err: any) {
                console.log(err.message)
            }
        }
    }

    return (
        <View style={container}>
            <View style={{ paddingBottom: sizes.paddings["2md"] }}>
                <View style={input_container}>
                    <Input
                        value={name}
                        textAlignVertical="top"
                        multiline={true}
                        returnKeyType="done"
                        keyboardType="twitter"
                        onChangeText={handleInputChange}
                        maxLength={300}
                        autoFocus={true}
                        numberOfLines={5}
                        style={input_style}
                        placeholder={t("say something about you") + "..."}
                        placeholderTextColor={String(ColorTheme().textDisabled)}
                    />
                </View>
                <View style={bottom_style}>
                    <Text style={legend_style}>
                        *{t("The name will be visible for all users to see")}
                    </Text>
                    <Text style={counter}>
                        {name.length}/{maxLength}
                    </Text>
                </View>
            </View>

            <ButtonStandart
                margins={false}
                height={40}
                action={handlePress}
                style={{ minWidth: sizes.buttons.width * 0.3 }}
                backgroundColor={
                    nameCanBeEdited ? colors.gray.white : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Update")}</Text>
            </ButtonStandart>
        </View>
    )
}

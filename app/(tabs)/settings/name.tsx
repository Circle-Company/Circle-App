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
import { useUpdateAccNameMutation } from "@/queries"
import { useToast } from "@/contexts/Toast"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { ActivityIndicator } from "react-native"

export default function Name() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { mutateAsync: updateName, isPending } = useUpdateAccNameMutation()

    const toast = useToast()
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
        height: sizes.screens.height * 0.07,
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
        color: name !== session.user.name ? colors.gray.black : colors.gray.grey_04 + "90",
    }

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setname(formattedText)
    }

    async function handlePress({ clean }: { clean: boolean }) {
        if ((!clean && !nameCanBeEdited) || isPending) return
        if (name === session.user.name) return
        await updateName({
            name: clean ? null : textLib.rich.formatToEnriched(name),
        })
            .then(() => {
                toast.success("Name updated successfully")
                Vibrate("notificationSuccess")
            })
            .catch(() => {
                toast.error("Failed to update your name")
                Vibrate("notificationError")
            })
            .finally(() => {
                navigation.goBack()
            })
    }

    return (
        <View style={container}>
            <View style={{ paddingBottom: sizes.paddings["2md"] }}>
                <View style={input_container}>
                    <Input
                        value={name}
                        textAlignVertical="top"
                        multiline={false}
                        returnKeyType="done"
                        keyboardType="default"
                        onChangeText={handleInputChange}
                        maxLength={userRules().name.maxLength}
                        autoFocus={true}
                        style={input_style}
                        placeholder={t("Your name") + "..."}
                        placeholderTextColor={String(ColorTheme().textDisabled)}
                        autoCapitalize="words"
                        textContentType="name"
                        onSubmitEditing={() =>
                            handlePress({ clean: name.length > 0 ? false : true })
                        }
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
                action={() => handlePress({ clean: name.length > 0 ? false : true })}
                style={{ minWidth: sizes.buttons.width * 0.3 }}
                backgroundColor={
                    name !== session.user.name
                        ? colors.gray.white
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Update")}</Text>
                {isPending && (
                    <ActivityIndicator
                        style={{ marginLeft: sizes.margins["1sm"] }}
                        size="small"
                        color={colors.gray.grey_07}
                    />
                )}
            </ButtonStandart>
        </View>
    )
}

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
import { useUpdateAccDescMutation } from "@/queries/account"
import { useToast } from "@/contexts/Toast"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import TrashIcon from "@/assets/icons/svgs/trash.fill.svg"
import { ActivityIndicator } from "react-native"

export default function DescriptionScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { mutateAsync: updateDescription, isPending } = useUpdateAccDescMutation()

    const toast = useToast()
    const navigation = useNavigation()
    const maxLength = userRules().description.maxLength
    const [description, setDescription] = React.useState(
        session.user.description ? session.user.description : "",
    )
    const descriptionCanBeEdited = React.useMemo(() => {
        return (
            description !== session.user.description &&
            description.length <= maxLength &&
            description.length > 0
        )
    }, [description, session.user.description])

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
        color: maxLength == description.length ? ColorTheme().error : ColorTheme().textDisabled,
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
        color:
            description !== session.user.description
                ? colors.gray.black
                : colors.gray.grey_04 + "90",
    }

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setDescription(formattedText)
    }

    async function handlePress({ clean }: { clean: boolean }) {
        if ((!clean && !descriptionCanBeEdited) || isPending) return
        if (description === session.user.description) return
        await updateDescription({
            description: clean ? null : textLib.rich.formatToEnriched(description),
        })
            .then(() => {
                toast.success(t("Description updated successfully"))
                Vibrate("notificationSuccess")
            })
            .catch(() => {
                toast.error(t("Failed to update your description"))
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
                        value={description}
                        textAlignVertical="top"
                        multiline={true}
                        returnKeyType="done"
                        keyboardType="default"
                        onChangeText={handleInputChange}
                        maxLength={userRules().description.maxLength}
                        autoFocus={true}
                        numberOfLines={5}
                        autoCapitalize="sentences"
                        style={input_style}
                        placeholder={t("say something about you") + "..."}
                        placeholderTextColor={String(ColorTheme().textDisabled)}
                        blurOnSubmit={true}
                        onSubmitEditing={() =>
                            handlePress({ clean: description.length > 0 ? false : true })
                        }
                    />
                </View>
                <View style={bottom_style}>
                    <Text style={legend_style}>
                        *{t("The description will be visible for all users to see")}
                    </Text>
                    <Text style={counter}>
                        {description.length}/{maxLength}
                    </Text>
                </View>
            </View>
            <ButtonStandart
                margins={false}
                height={40}
                action={() => handlePress({ clean: description.length > 0 ? false : true })}
                style={{ minWidth: sizes.buttons.width * 0.3 }}
                backgroundColor={
                    description !== session.user.description
                        ? colors.gray.white
                        : colors.gray.grey_07
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

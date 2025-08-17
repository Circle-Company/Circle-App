import { TextStyle, TouchableOpacity, View, ViewStyle, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../../../constants/colors"

import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import React from "react"
import { notify } from "react-native-notificated"
import CancelButton from "../../../../../../components/buttons/cancel"
import { MomentDataProps } from "../../../../../../components/moment/context/types"
import { Text } from "../../../../../../components/Themed"
import fonts from "../../../../../../constants/fonts"
import sizes from "../../../../../../constants/sizes"
import BottomSheetContext from "../../../../../../contexts/bottomSheet"
import PersistedContext from "../../../../../../contexts/Persisted"
import LanguageContext from "../../../../../../contexts/Preferences/language"
import { Vibrate } from "../../../../../../lib/hooks/useHapticFeedback"
import api from "../../../../../../services/Api"

type ReportOption = {
    id: string
    title: string
    description: string
}

const ReportOptions: ReportOption[] = [
    {
        id: "SPAM",
        title: "Spam",
        description: "This moment is spam",
    },
    {
        id: "INAPPROPRIATE",
        title: "Inappropriate",
        description: "This moment is inappropriate",
    },
    {
        id: "VIOLENCE",
        title: "Violence",
        description: "This moment contains violent or explicit content",
    },
    {
        id: "HARASSMENT",
        title: "Harassment",
        description: "This moment contains harassment or bullying",
    },
    {
        id: "MISINFORMATION",
        title: "Misinformation",
        description: "This moment contains false information",
    },
    {
        id: "COPYRIGHT",
        title: "Copyright",
        description: "This moment violates copyright laws",
    },
    {
        id: "HATE_SPEECH",
        title: "Hate Speech",
        description: "This moment contains hate speech",
    },
    {
        id: "ILLEGAL_GOODS",
        title: "Illegal Goods",
        description: "This moment promotes illegal goods or services",
    },
    {
        id: "SEXUAL_CONTENT",
        title: "Sexual Content",
        description: "This moment contains nudity or sexual content",
    },
    {
        id: "OTHER",
        title: "Other",
        description: "This moment violates other platform policies",
    },
]

export function RenderReportModal({ moment }: { moment: MomentDataProps }) {
    const { t } = React.useContext(LanguageContext)
    const { collapse } = React.useContext(BottomSheetContext)
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    const container: ViewStyle = {
        width,
    }

    const TextStyle: TextStyle = {
        marginTop: sizes.margins["1sm"],
        fontSize: fonts.size.caption1 * 1.1,
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().text + "90",
    }

    const headerContainer: ViewStyle = {
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: sizes.paddings["2sm"],
    }

    const centerContainer: ViewStyle = {
        width,
    }

    const bottomContainer: ViewStyle = {
        width,
        alignSelf: "center",
        paddingTop: sizes.paddings["1sm"],
    }

    const optionContainer: ViewStyle = {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["2sm"],
        marginBottom: sizes.margins["1sm"] * 1.5,
        borderRadius: sizes.borderRadius["1sm"],
        backgroundColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }

    const optionTitleStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
    }

    const optionDescriptionStyle: TextStyle = {
        fontSize: fonts.size.caption1 * 1.05,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text + "90",
    }

    async function handleReport(option: ReportOption, momentId: string) {
        console.log(option)

        try {
            await api
                .post(
                    `/moments/${momentId}/report`,
                    {
                        report_type: option.id,
                    },
                    {
                        headers: {
                            Authorization: session.account.jwtToken,
                        },
                    },
                )
                .then(() => {
                    notify("toast", {
                        params: {
                            description: t("Report Has been sended with success"),
                            title: t("Report Sended"),
                            icon: (
                                <CheckIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                })
                .finally(() => {
                    collapse()
                })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <View style={container}>
            <View style={headerContainer}>
                <Text style={TextStyle}>
                    {`${t("Report this")} @${moment.user.username} ${t("moment")}`}.
                </Text>
            </View>
            <View style={centerContainer}>
                {ReportOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={optionContainer}
                        onPress={() => handleReport(option, moment.id)}
                    >
                        <Text style={optionTitleStyle}>{option.title}</Text>
                        <Text style={optionDescriptionStyle}>{option.description}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={bottomContainer}>
                <CancelButton
                    vibrate={() => Vibrate("impactLight")}
                    action={collapse}
                    height={sizes.buttons.height * 0.5}
                    text={t("Close")}
                />
            </View>
        </View>
    )
}

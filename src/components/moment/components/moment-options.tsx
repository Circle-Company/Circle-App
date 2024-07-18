import React from "react"
import { View } from "react-native"
import { useNotifications } from "react-native-notificated"
import CheckIcon from "../../../assets/icons/svgs/check_circle.svg"
import BottomSheetContext from "../../../contexts/bottomSheet"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"
import ButtonStandart from "../../buttons/button-standart"
import { MemoryReciveDataProps } from "../../Memory/Memory-types"
import { Text } from "../../Themed"
import { MomentDataReturnsProps, MomentOptionsProps } from "../context/types"
import { statisticsPreview as StatisticsPreview } from "./moment-statistics-preview"

type OptionsProps = {
    momentData: MomentDataReturnsProps
    momentOptions: MomentOptionsProps
    memory: MemoryReciveDataProps
}

export default function options({ memory, momentData, momentOptions }: OptionsProps) {
    const { collapse } = React.useContext(BottomSheetContext)
    const { t } = React.useContext(LanguageContext)
    const { notify } = useNotifications()
    const { session } = React.useContext(PersistedContext)
    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    async function handleDeleteFromMemoryPress() {
        await api
            .post("/memory/remove-moment", {
                memory_id: memory.id,
                moment_id: momentData.id,
                user_id: session.user.id,
            })
            .then(() => {
                notify("toast", {
                    params: {
                        description: t("Moment has been deleted with success"),
                        title: t("Moment deleted"),
                        icon: (
                            <CheckIcon
                                fill={colors.green.green_05.toString()}
                                width={15}
                                height={15}
                            />
                        ),
                    },
                })
                collapse()
            })
    }

    const textStyle = {
        color: colors.red.red_05,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
    }

    const descriptionStyle = {
        color: ColorTheme().textDisabled,
        fontSize: fonts.size.body * 0.7,
        fontFamily: fonts.family.Medium,
    }

    const textsContainer = {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["1md"],
    }

    const statisticsText = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        marginBottom: sizes.margins["2sm"],
        marginLeft: sizes.margins["2sm"],
    }

    return (
        <View>
            <View
                style={{
                    paddingBottom: sizes.paddings["1md"],
                    marginBottom: sizes.margins["1md"],
                    borderBottomWidth: 1.5,
                    borderColor: ColorTheme().backgroundDisabled + "99",
                }}
            >
                <Text style={statisticsText}>{t("Statistics")}</Text>
                <StatisticsPreview momentData={momentData} momentOptions={momentOptions} />
            </View>

            <View style={textsContainer}>
                <Text style={[descriptionStyle]}>
                    {t("The Moment will only be removed from this memory.")}
                </Text>
                <Text style={[descriptionStyle, { fontSize: fonts.size.body * 0.56 }]}>
                    *
                    {t(
                        "If the memory only has this moment and you remove it, the memory will be deleted."
                    )}
                </Text>
            </View>

            <ButtonStandart
                animationScale={0.9}
                bounciness={5}
                margins={false}
                width={width}
                borderRadius={10}
                height={sizes.buttons.height / 1.5}
                action={handleDeleteFromMemoryPress}
            >
                <Text style={textStyle}>{`${t("Delete Moment from")} "${memory.title}"`}</Text>
            </ButtonStandart>
        </View>
    )
}

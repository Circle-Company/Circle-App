import React from "react"
import { View, Text, useColorScheme } from "react-native"
import { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import SelectMomentsContext from "../../../contexts/selectMoments"
import ButtonStandart from "../../buttons/button-standart"
import AddIcon from "../../../assets/icons/svgs/memory.svg"
import LanguageContext from "../../../contexts/Preferences/language"

export default function MemoryTitleHeaderRight() {
    const { selectedMoments, title, storeMemory, endSession } =
        React.useContext(SelectMomentsContext)
    const { t } = React.useContext(LanguageContext)
    const [active, setActive] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"

    React.useEffect(() => {
        if (title) setActive(true)
        else setActive(false)
    }, [selectedMoments, title])

    const container: any = {
        flexDirection: "row",
        opacity: selectedMoments.length > 0 ? 1 : 0.35,
    }

    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: active ? colors.gray.white : colors.gray.grey_04,
    }
    const textContainer = {
        marginRight: sizes.margins["2sm"],
    }

    async function onPressCreate() {
        if (title && selectedMoments) {
            await storeMemory()
            await endSession()
        }
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={onPressCreate}
                width={sizes.buttons.width * 0.31}
                backgroundColor={String(
                    active
                        ? colors.blue.blue_05
                        : isDarkMode
                          ? colors.gray.grey_07
                          : colors.gray.grey_02
                )}
            >
                <View style={textContainer}>
                    <Text style={text}>{t("Create")}</Text>
                </View>
                <AddIcon
                    fill={String(active ? colors.gray.white : colors.gray.grey_04)}
                    width={14}
                    height={14}
                />
            </ButtonStandart>
        </View>
    )
}

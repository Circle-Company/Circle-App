import React from "react"
import { Text, View } from "../../../components/Themed"
import { useNavigation } from "@react-navigation/native"
import sizes from "../../../layout/constants/sizes"
import AddIcon from "../../../assets/icons/svgs/plus_circle-outline.svg"
import ViewMorebutton from "../../../components/buttons/view_more"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import SelectMomentsContext from "../../../contexts/selectMoments"
import LanguageContext from "../../../contexts/Preferences/language"

export default function HeaderList() {
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation()

    const container: any = {
        top: 4,
        width: sizes.screens.width,
        paddingTop: sizes.paddings["2sm"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: any = {
        flex: 1,
        marginLeft: sizes.margins["2sm"] * 0.8,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body,
    }

    const button_container: any = {
        marginRight: sizes.margins["1md"] * 0.8,
    }

    async function handlePress() {
        setFrom("NEW_MOMENT")
        navigation.navigate("MemoriesNavigator", { screen: "NewMemorySelectMoments" })
    }

    return (
        <View style={container}>
            <Text style={title}>{t("All Memories")}</Text>
            <View style={button_container}>
                <ViewMorebutton
                    action={handlePress}
                    text={t("Create New")}
                    scale={1.2}
                    icon={
                        <AddIcon
                            fill={String(ColorTheme().primary)}
                            width={14}
                            height={14}
                            style={{ top: 1 }}
                        />
                    }
                />
            </View>
        </View>
    )
}

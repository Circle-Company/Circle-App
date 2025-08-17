import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Text, TextStyle, View, ViewStyle } from "@/components/Themed"

import AddIcon from "@/assets/icons/svgs/plus_circle-outline.svg"
import ColorTheme from "@/layout/constants/colors"
import LanguageContext from "@/contexts/Preferences/language"
import React from "react"
import SelectMomentsContext from "@/contexts/selectMoments"
import ViewMorebutton from "@/components/buttons/view_more"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"

export default function HeaderList() {
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation: NavigationProp<any> = useNavigation()

    const container: ViewStyle = {
        top: 4,
        width: sizes.screens.width,
        paddingTop: sizes.paddings["2sm"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        flex: 1,
        marginLeft: sizes.margins["2sm"] * 0.8,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body,
    }

    const button_container: ViewStyle = {
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

import React from "react"
import { FlatList, ScrollView, View, useColorScheme } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { Text } from "../../components/Themed"
import LanguageContext from "../../contexts/Preferences/language"
import SelectMomentsContext from "../../contexts/selectMoments"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import RenderMoment from "./components/render-moments"

export default function ListSelectMoments() {
    const { t } = React.useContext(LanguageContext)
    const { all_moments, get_moments } = React.useContext(SelectMomentsContext)

    const item_container = {
        width: sizes.screens.width,
        paddingHorizontal: 8,
    }

    const header_container: any = {
        paddingHorizontal: sizes.paddings["1md"],
        alignItems: "center",
        justifyContent: "center",
    }

    const header_text: any = {
        fontSize: fonts.size.footnote * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    React.useEffect(() => {
        get_moments()
    }, [])

    const isDarkMode = useColorScheme() === "dark"
    const gradient = isDarkMode
        ? [colors.gray.black + "00", colors.gray.black]
        : [colors.gray.white + "00", colors.gray.white]
    return (
        <>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={header_container}>
                    <Text style={header_text}>{t("Select Moments to put in the Memory")}</Text>
                </View>
                <FlatList
                    numColumns={3}
                    data={all_moments}
                    scrollEnabled={false}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={item_container}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => {
                        return <RenderMoment moment={item} />
                    }}
                    ListFooterComponent={() => {
                        return <View style={{ height: 120 }} />
                    }}
                />
            </ScrollView>
            <LinearGradient
                style={{
                    zIndex: 1,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: sizes.screens.width,
                    height: 200,
                }}
                colors={gradient}
            />
        </>
    )
}

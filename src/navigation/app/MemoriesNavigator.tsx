import ColorTheme, { colors } from "../../layout/constants/colors"

import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useColorScheme } from "react-native"
import MemoriesHeaderLeft from "../../components/headers/memories/#"
import MemoriesListMomentsHeaderLeft from "../../components/headers/memories/memories-list_moments-header_left"
import MemoriesListMomentsHeaderRight from "../../components/headers/memories/memories-list_moments-header_right"
import MemoryHeaderLeft from "../../components/headers/memory/memory-header_left"
import MemoryHeaderRight from "../../components/headers/memory/memory-header_right"
import MemoryTitleHeaderRight from "../../components/headers/memory/memory_title-header_right"
import MemoryContext from "../../contexts/memory"
import LanguageContext from "../../contexts/Preferences/language"
import Sizes from "../../layout/constants/sizes"
import MemoriesScreen from "../../pages/app/Memories"
import EditMemoryScreen from "../../pages/app/Memories/edit_memory"
import MemoriesListMomentsScreen from "../../pages/app/Memories/list_moments"
import NewMemorySelectMomentsScreen from "../../pages/app/Memories/new_memory_select_moments"
import NewMemoryTitleScreen from "../../pages/app/Memories/new_memory_title"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const MemoriesStack = createStackNavigator()

export function MemoriesNavigator() {
    const { t } = React.useContext(LanguageContext)
    const { memory } = React.useContext(MemoryContext)
    const user_id = memory?.user?.id

    const isDarkMode = useColorScheme() === "dark"
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <MemoriesStack.Navigator>
            <MemoriesStack.Screen
                name="Memories"
                component={MemoriesScreen}
                options={{
                    headerTitle: t("Memories"),
                    headerStyle: [
                        HeaderStyle,
                        {
                            borderBottomWidth: 1,
                            borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                        },
                    ],
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    headerTintColor: String(ColorTheme().text),
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoriesHeaderLeft />,
                }}
            />
            <MemoriesStack.Screen
                name="Memory"
                component={MemoriesListMomentsScreen}
                options={{
                    headerTitle: memory ? memory.title : t("Memory"),
                    headerStyle: [HeaderStyle, { backgroundColor: colors.gray.black }],
                    headerTitleStyle: { color: String(colors.gray.white) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoriesListMomentsHeaderLeft />,
                    headerRight: () => <MemoriesListMomentsHeaderRight user_id={Number(user_id)} />,
                }}
            />
            <MemoriesStack.Screen
                name="EditMemory"
                component={EditMemoryScreen}
                options={{
                    headerTitle: memory ? `${t("Edit")} "${memory.title}"` : t("Edit Memory"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoriesHeaderLeft />,
                }}
            />
            <MemoriesStack.Screen
                name="NewMemorySelectMoments"
                component={NewMemorySelectMomentsScreen}
                options={{
                    headerTitle: t("New Memory"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <MemoryHeaderRight />,
                }}
            />
            <MemoriesStack.Screen
                name="NewMemoryTitle"
                component={NewMemoryTitleScreen}
                options={{
                    headerTitle: t("New Memory"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <MemoryTitleHeaderRight />,
                }}
            />
        </MemoriesStack.Navigator>
    )
}

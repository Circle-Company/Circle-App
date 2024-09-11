import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import MemoryHeaderLeft from "../../components/headers/memory/memory-header_left"
import MomentFullHeaderLeft from "../../components/headers/moment/moment_full-header_left"
import NewMomentImageRight from "../../components/headers/moment/new_moment_image-header_right"
import NewMomentInputDescriptionRight from "../../components/headers/moment/new_moment_input_description-header_right"
import NewMomentSelectMemoryRight from "../../components/headers/moment/new_moment_select_memory-header_right"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import Sizes from "../../layout/constants/sizes"
import MomentFullScreen from "../../pages/app/Moment/moment-full"
import NewMomentDescription from "../../pages/app/Moment/new_moment-description"
import NewMomentGalleryScreen from "../../pages/app/Moment/new_moment-gallery"
import NewMomentImageScreen from "../../pages/app/Moment/new_moment-image"
import NewMomentSelectMemory from "../../pages/app/Moment/new_moment-select_memory"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const MomentStack = createStackNavigator()

export function MomentNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <MomentStack.Navigator>
            <MomentStack.Screen
                name="MomentFullScreen"
                component={MomentFullScreen}
                options={{
                    cardShadowEnabled: true,
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { display: "none" },
                    headerTransparent: true,
                    headerLeft: () => <MomentFullHeaderLeft />,
                    cardStyle: {
                        backgroundColor: colors.gray.black.toString(),
                        overflow: "hidden",
                    },
                }}
            />
            <MomentStack.Screen
                name="NewMomentGalleryScreen"
                component={NewMomentGalleryScreen}
                options={{
                    headerTitle: t("New Moment"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentImageRight />,
                }}
            />

            <MomentStack.Screen
                name="NewMomentImageScreen"
                component={NewMomentImageScreen}
                options={{
                    headerTitle: t("New Moment"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentImageRight />,
                }}
            />
            <MomentStack.Screen
                name="NewMomentDescription"
                component={NewMomentDescription}
                options={{
                    headerTitle: t("New Moment"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentInputDescriptionRight />,
                }}
            />
            <MomentStack.Screen
                name="NewMomentSelectMemory"
                component={NewMomentSelectMemory}
                options={{
                    headerTitle: t("Add to Memory"),
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: Horizontal,
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentSelectMemoryRight />,
                }}
            />
        </MomentStack.Navigator>
    )
}

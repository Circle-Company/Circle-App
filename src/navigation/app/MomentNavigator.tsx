import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import React from 'react'
import ColorTheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import { useColorScheme } from 'react-native'
import NewMomentDescription from '../../pages/app/Moment/new_moment-description'
import NewMomentGalleryScreen from '../../pages/app/Moment/new_moment-gallery'
import NewMomentSelectMemory from '../../pages/app/Moment/new_moment-select_memory'
import NewMemoryTitleScreen from '../../pages/app/Memories/new_memory_title'
import MemoryHeaderLeft from '../../components/headers/memory/memory-header_left'
import MemoryTitleHeaderRight from '../../components/headers/memory/memory_title-header_right'
import NewMomentImageScreen from '../../pages/app/Moment/new_moment-image'
import NewMomentImageRight from '../../components/headers/moment/new_moment_image-header_right'
import NewMomentInputDescriptionRight from '../../components/headers/moment/new_moment_input_description-header_right'
import NewMomentSelectMemoryRight from '../../components/headers/moment/new_moment_select_memory-header_right'
import MomentFullScreen from '../../pages/app/Moment/moment-full'
import MomentFullHeaderLeft from '../../components/headers/moment/moment_full-header_left'
import MomentFullHeaderRight from '../../components/headers/moment/moment_full-header_right'
import LanguageContext from '../../contexts/Preferences/language'
const MomentStack = createStackNavigator()

export function MomentNavigator() {
    const isDarkMode = useColorScheme() === 'dark'
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }

    return (
    <MomentStack.Navigator>
        <MomentStack.Screen
            name="MomentFullScreen"
            component={MomentFullScreen}
            options={{
                cardShadowEnabled: true,
                headerStyle: [HeaderStyle],
                headerTitleStyle: {display: 'none'},
                headerTransparent: true,
                headerLeft: () => <MomentFullHeaderLeft/>,
                cardStyle: {backgroundColor: colors.gray.black.toString(), overflow: 'hidden'}
            }}
        />
        <MomentStack.Screen
            name="NewMomentGalleryScreen"
            component={NewMomentGalleryScreen}
            options={{
                headerTitle:t('New Moment'),
                headerStyle: [HeaderStyle],
                headerTitleStyle: {color: String(ColorTheme().text)},
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerLeft: () => <MemoryHeaderLeft/>,
                headerRight: () => <NewMomentImageRight/>
            }}
        />

        <MomentStack.Screen
            name="NewMomentImageScreen"
            component={NewMomentImageScreen}
            options={{
                headerTitle: t('Select Image'),
                headerStyle: [HeaderStyle],
                headerTitleStyle: {color: String(ColorTheme().text)},
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerLeft: () => <MemoryHeaderLeft/>,
                headerRight: () => <NewMomentImageRight/>
            }}
        />
        <MomentStack.Screen
            name="NewMomentDescription"
            component={NewMomentDescription}
            options={{
                headerTitle:t('New Moment'),
                headerStyle: [HeaderStyle],
                headerTitleStyle: {color: String(ColorTheme().text)},
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerLeft: () => <MemoryHeaderLeft/>,
                headerRight: () => <NewMomentInputDescriptionRight/>
            }}
        />
        <MomentStack.Screen
            name="NewMomentSelectMemory"
            component={NewMomentSelectMemory}
            options={{
                headerTitle:t('Add to Memory'),
                headerStyle: [HeaderStyle],
                headerTitleStyle: {color: String(ColorTheme().text)},
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerLeft: () => <MemoryHeaderLeft/>,
                headerRight: () => <NewMomentSelectMemoryRight/>
            }}
        />
        </MomentStack.Navigator>
    );
}
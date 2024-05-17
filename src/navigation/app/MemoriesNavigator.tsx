import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import React from 'react'
import ColorTheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import { useColorScheme } from 'react-native'
import MemoriesHeaderLeft from '../../components/headers/memories/#'
import MemoriesListMomentsHeaderLeft from '../../components/headers/memories/memories-list_moments-header_left'
import MemoriesScreen from '../../pages/app/Memories'
import MemoriesListMomentsScreen from '../../pages/app/Memories/list_moments'
import NewMemorySelectMomentsScreen from '../../pages/app/Memories/new_memory_select_moments'
import NewMemoryTitleScreen from '../../pages/app/Memories/new_memory_title'
import { HeaderBack } from '../../components/headers'
import MemoryHeaderLeft from '../../components/headers/memory/memory-header_left'
import MemoryHeaderRight from '../../components/headers/memory/memory-header_right'
import MemoryTitleHeaderRight from '../../components/headers/memory/memory_title-header_right'
import MemoryContext from '../../contexts/memory'
const MemoriesStack = createStackNavigator()
 
export function MemoriesNavigator() {

    const {memory} = React.useContext(MemoryContext)

    const isDarkMode = useColorScheme() === 'dark'
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
    return (
        <MemoriesStack.Navigator >
            <MemoriesStack.Screen
                name="Memories"
                component={MemoriesScreen}
                options={{
                    headerStyle: [HeaderStyle, {borderBottomWidth: 1, borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02}],
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    headerTintColor: String(ColorTheme().text),
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
                    headerLeft: () => <MemoriesHeaderLeft/>
                }}
            />
            <MemoriesStack.Screen
                name="Memory"
                component={MemoriesListMomentsScreen}
                options={{
                    headerTitle:memory? memory.title : 'Memory',
                    headerStyle: [HeaderStyle, {backgroundColor: colors.gray.black}],
                    headerTitleStyle: {color: String(colors.gray.white)},
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    headerLeft: () => <MemoriesListMomentsHeaderLeft/>
                }}
            />
            <MemoriesStack.Screen
                name="NewMemorySelectMoments"
                component={NewMemorySelectMomentsScreen}
                options={{
                    headerTitle:'New Memory',
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: {color: String(ColorTheme().text)},
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    headerLeft: () => <MemoryHeaderLeft/>,
                    headerRight: () => <MemoryHeaderRight/>
                }}
            />
            <MemoriesStack.Screen
                name="NewMemoryTitle"
                component={NewMemoryTitleScreen}
                options={{
                    headerTitle:'New Memory',
                    headerStyle: [HeaderStyle],
                    headerTitleStyle: {color: String(ColorTheme().text)},
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    headerLeft: () => <MemoryHeaderLeft/>,
                    headerRight: () => <MemoryTitleHeaderRight/>
                }}
            />
        </MemoriesStack.Navigator>
    )
 }
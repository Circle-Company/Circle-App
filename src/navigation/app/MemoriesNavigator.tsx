
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import React from 'react'
import ColorTheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import { useColorScheme } from 'react-native'
import MemoriesHeaderLeft from '../../components/headers/memories/memories-header_left'
import MemoriesListMomentsHeaderLeft from '../../components/headers/memories/memories-list_moments-header_left'
import MemoriesScreen from '../../pages/app/Memories'
import MemoriesListMomentsScreen from '../../pages/app/Memories/list_moments'
  
const MemoriesStack = createStackNavigator()
 
export function MemoriesNavigator() {

    const isDarkMode = useColorScheme() === 'dark'
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
    return (
        <MemoriesStack.Navigator 
            screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
        >
            <MemoriesStack.Screen
                name="Memories"
                component={MemoriesScreen}
                options={{
                    headerStyle: [HeaderStyle, {borderBottomWidth: 1, borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02}],
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    headerTintColor: String(ColorTheme().text),
                    cardOverlayEnabled: true,
                    headerLeft: () => <MemoriesHeaderLeft/>
                }}
            />
            <MemoriesStack.Screen
                name="Memories-List_Moments"
                component={MemoriesListMomentsScreen}
                options={{
                    headerStyle: [HeaderStyle, {backgroundColor: colors.gray.black}],
                    headerTitleStyle: {color: String(colors.gray.white)},
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    headerLeft: () => <MemoriesListMomentsHeaderLeft/>
                }}
            />
        </MemoriesStack.Navigator>
    )
 }
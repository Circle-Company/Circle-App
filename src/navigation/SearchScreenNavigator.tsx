
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import React from 'react'
import ColorTheme from '../layout/constants/colors'
import Sizes from '../layout/constants/sizes'

import HeaderRigthHome from '../components/headers/home/Right'

import SearchScreen from '../pages/app/Search'
  
const SearchStack = createStackNavigator()
 
export function SearchScreenNavigator() {
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
    return (
        <SearchStack.Navigator 
            screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
        >
            <SearchStack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{
                    headerStyle: HeaderStyle,
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                    header: () => (<></>),
                }}
            />
        </SearchStack.Navigator>
    )
 }
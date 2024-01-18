import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import ProfileScreen from '../../pages/app/Profile'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../contexts/auth'

const ProfileStack = createStackNavigator()
 
export function ProfileNavigator() {
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
  return (
    <ProfileStack.Navigator 
        screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS}}
    >
        <ProfileStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                headerShown: false,
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,

            }}
        />
    </ProfileStack.Navigator>
  )
}
import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import InboxScreen from '../../pages/app/Inbox'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../contexts/auth'

const InboxStack = createStackNavigator()
 
export function InboxNavigator() {
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
  return (
    <InboxStack.Navigator 
        screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS}}
    >
        <InboxStack.Screen
            name="Inbox"
            component={InboxScreen}
            options={{
                headerTitle: 'Inbox',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,

            }}
        />
    </InboxStack.Navigator>
  )
}
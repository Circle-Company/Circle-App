
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import ExploreScreen from '../../pages/app/Explore'
import LanguageContext from '../../contexts/Preferences/language'
import React from 'react'
  
const ExploreStack = createStackNavigator()
 
export function ExploreScreenNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
    return (
        <ExploreStack.Navigator 
            screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
        >
            <ExploreStack.Screen
                name="ExploreScreen"
                component={ExploreScreen}
                options={{
                    headerTitle: t('Explore'),
                    headerStyle: HeaderStyle,
                    headerShown: false,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true
                }}
            />
        </ExploreStack.Navigator>
    )
 }
import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'
import HeaderRigthHome from '../../components/headers/home/Right'
import HomeScreen from '../../pages/app/Home'
import MomentFullScreen from '../../pages/app/Moment/moment-full'
  
const HomeScreenStack = createStackNavigator()
 
export function HomeScreenNavigator() {
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
  return (
    <HomeScreenStack.Navigator 
        screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
    >
    <HomeScreenStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
            headerTitle: 'Circle',
            headerTitleAlign: 'left',
            headerTransparent: false,
            headerTitleStyle: {fontFamily: Fonts.family['Black-Italic'], fontSize: Fonts.size.title2},
            headerTintColor: String(ColorTheme().text),
            headerStyle: HeaderStyle,
            cardStyle: {backgroundColor: String(ColorTheme().background)},
            headerRight: () => (<HeaderRigthHome/>),
        }}
    />
    </HomeScreenStack.Navigator>
  )
}
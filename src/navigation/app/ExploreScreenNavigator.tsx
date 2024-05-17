
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import ExploreScreen from '../../pages/app/Explore'
  
const ExploreStack = createStackNavigator()
 
export function ExploreScreenNavigator() {
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
                    headerTitle: 'Explore',
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
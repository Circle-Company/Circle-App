import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from '../Screens/ViewProfile/ProfileScreen'
import MomentScreen from '../Screens/Moment'
import {HeaderPhoto, HeaderMoments, HeaderBack} from '../components/Headers/index' 
import ColorTheme from '../layout/constants/colors'

const MomentStack = createStackNavigator();

export function MomentScreenNavigator() {
  return (
    <MomentStack.Navigator>
      <MomentStack.Screen
        name="MomentScreen"
        component={MomentScreen}
        options={{
          headerTitle: 'Moments (Beta)',
          headerTitleAlign: 'left',
          headerTransparent: true,
          headerTintColor: ColorTheme().background,
          headerTitleStyle: {fontFamily: 'RedHatDisplay-Bold', fontSize: 23},
          
          headerStyle: {backgroundColor: ColorTheme().background, elevation: 0},
          headerRight: () => (
            <HeaderMoments/>
          )
        }}
      />
    </MomentStack.Navigator>
  );
}
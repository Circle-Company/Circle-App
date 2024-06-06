
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import sizes from '../../layout/constants/sizes'
import ColorTheme from '../../layout/constants/colors'
import LanguageContext from '../../contexts/Preferences/language'

import { HomeScreenNavigator } from './HomeScreenNavigator'
import { ExploreScreenNavigator } from './ExploreScreenNavigator'
import { AccountScreenNavigator } from './AccountNavigator'

import Moment from '../../assets/icons/svgs/moments.svg'
import MomentOutline from '../../assets/icons/svgs/moments-outline.svg'
import Explore from '../../assets/icons/svgs/compass.svg'
import ExploreOutline from '../../assets/icons/svgs/compass-outline.svg'
import User from '../../assets/icons/svgs/user_circle.svg'
import UserOutline from '../../assets/icons/svgs/user_circle-outline.svg'

const BottomTab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const {t} = React.useContext(LanguageContext)
  const iconWidth = 21
  const iconHeight = 21
  const tabBarStyle: any = {
    ...sizes.bottomTab, backgroundColor: ColorTheme().background
  }
  return (
    <BottomTab.Navigator
      initialRouteName="Moments"
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: tabBarStyle,
      }}
    >
      <BottomTab.Screen
        name="Moments"
        component={HomeScreenNavigator}
        options={{
          title: t('Moments'),
          tabBarIcon: ({focused}: any) => 
          focused?
            <Moment fill={String(ColorTheme().iconFocused)} width={iconWidth} height={iconHeight}/>
            :
            <MomentOutline fill={String(ColorTheme().icon)} width={iconWidth} height={iconHeight}/>
        }}
      />  
        <BottomTab.Screen
          name="You"
          component={AccountScreenNavigator}
          options={{
            title: t('You'),
            tabBarIcon: ({focused}: any) =>
              focused?
              <User fill={String(ColorTheme().iconFocused)} width={iconWidth} height={iconHeight}/>
              :
              <UserOutline fill={String(ColorTheme().icon)} width={iconWidth} height={iconHeight}/>
          }}
        />          
    </BottomTab.Navigator>
  );
}
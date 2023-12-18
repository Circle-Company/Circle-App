
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import sizes from '../layout/constants/sizes'
import ColorTheme from '../layout/constants/colors'

import AccountScreen from '../pages/app/Account'
import { HomeScreenNavigator } from './HomeScreenNavigator'
import { SearchScreenNavigator } from './SearchScreenNavigator'

import Moment from '../assets/icons/svgs/moment.svg'
import Search from '../assets/icons/svgs/search.svg'
import User from '../assets/icons/svgs/user.svg'

const BottomTab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const iconWidth = 20
  const iconHeight = 20

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: {...sizes.bottomTab, backgroundColor: ColorTheme().background},
      }}
    >
      <BottomTab.Screen
        name="Moments"
        component={HomeScreenNavigator}
        options={{
          tabBarIcon: ({focused}: any) => 
          focused?
            <Moment fill={String(ColorTheme().iconFocused)} width={iconWidth} height={iconHeight}/>
            :
            <Moment fill={String(ColorTheme().icon)} width={iconWidth} height={iconHeight}/>
        }}
      />
        <BottomTab.Screen
          name="Search"
          component={SearchScreenNavigator}
          options={{
            tabBarIcon: ({focused}: any) =>
              focused?
              <Search fill={String(ColorTheme().iconFocused)} width={iconWidth} height={iconHeight}/>
              :
              <Search fill={String(ColorTheme().icon)} width={iconWidth} height={iconHeight}/>
          }}
        />    
        <BottomTab.Screen
          name="You"
          component={AccountScreen}
          options={{
            tabBarIcon: ({focused}: any) =>
              focused?
              <User fill={String(ColorTheme().iconFocused)} width={iconWidth} height={iconHeight}/>
              :
              <User fill={String(ColorTheme().icon)} width={iconWidth} height={iconHeight}/>
          }}
        />          
    </BottomTab.Navigator>
  );
}
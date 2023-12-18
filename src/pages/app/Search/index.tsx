import React from 'react';
import { StatusBar, useColorScheme } from 'react-native'
import { View, Text} from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'

export default function SearchScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1
  }
  return (
    <View style={container}>
      <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <Text>Search Screen</Text>
    </View>
  )
}
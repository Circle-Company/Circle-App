import React, {useRef} from 'react';
import { StatusBar,  useColorScheme } from 'react-native'
import { View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import ListSettings from '../../../features/list-settings';

export default function SettingsScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1
  }
  return (
    <View style={container}>
      <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <ListSettings/>
    </View>
  )
}
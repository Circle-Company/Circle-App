import React from 'react';
import {StatusBar, Dimensions, useColorScheme } from 'react-native';
import { View } from '../../../components/Themed';
import ColorTheme, {colors} from '../../../layout/constants/colors'
import { WebView } from 'react-native-webview'
const WindowWidth = Dimensions.get('window').width

export default function SettingsCommunityGuidelines() {

  const isDarkMode = useColorScheme() === 'dark'
  const container = {
    flex: 1,
    width: WindowWidth,
  }

  return (
    <View style={container}>
      <StatusBar barStyle={isDarkMode? 'light-content' : 'dark-content'} backgroundColor={isDarkMode? colors.gray.black.toString(): colors.gray.white.toString()}/>
      <WebView source={{ uri: 'https://circle-company.github.io/Circle-Website/community-guidelines' }} style={{ flex: 1 }} />
    </View>
  )
}
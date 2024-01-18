import React, {useRef} from 'react';
import { StatusBar,  useColorScheme } from 'react-native'
import { View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import ListMoments from '../../../features/list-moments'
import ToastNotification from '../../../components/toast_notification';
import { UserShow } from '../../../components/user_show';

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1
  }
  return (
    <View style={container}>
      <StatusBar translucent={false} backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <ListMoments/>
    </View>
  )
}
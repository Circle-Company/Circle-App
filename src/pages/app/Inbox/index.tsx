import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import ListMoments from '../../../features/list-moments'
import { onDisplayNotification } from '../../../services/Notification';
import ListNotifcations from '../../../features/list-notifications';

export default function InboxScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1
  }
  return (
    <View style={container}>
      <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <ListNotifcations/>
    </View>
  )
}
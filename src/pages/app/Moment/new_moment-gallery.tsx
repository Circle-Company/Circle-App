import React from 'react';
import { StatusBar,  useColorScheme, Button, Platform, PermissionsAndroid} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import RenderCameraRoll from '../../../features/new_moment/render-camera_roll';
import ImagePicker, {launchCamera, launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker'

export default function NewMomentGalleryScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1,
  }

  return (
    <View>
      <StatusBar translucent={false} backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <Text> new_moment_gallery_screen</Text>
    </View>
  )

}
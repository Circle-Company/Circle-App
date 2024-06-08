import React, { useEffect, useRef } from 'react'
import { StatusBar, useColorScheme, Keyboard, Animated} from 'react-native'
import { View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import ListMoments from '../../../features/list-moments'
import FeedContext from '../../../contexts/Feed'
import { Comments } from '../../../components/comment'
import sizes from '../../../layout/constants/sizes'
import { useKeyboardAnimation } from 'react-native-keyboard-controller'
import api from '../../../services/api'
import PersistedContext from '../../../contexts/Persisted'
import BottomTabsContext from '../../../contexts/bottomTabs'
import { useIsFocused} from '@react-navigation/native'
import LanguageContext from '../../../contexts/Preferences/language'

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const { t } = React.useContext(LanguageContext)
  const { setCurrentTab } = React.useContext(BottomTabsContext)
  const { commentEnabled, setCommentEnabled, showKeyboard, focusedItemId} = React.useContext(FeedContext);
  const { height } = useKeyboardAnimation()
  const isFocused = useIsFocused()

  const bottomContainerRef = useRef(null);
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setCommentEnabled(false) })
    return () => { keyboardDidHideListener.remove() }      
  }, [])

  React.useEffect(() => {
    setCurrentTab('Home')
  }, [isFocused])

  const container = {
    alignItems: 'center',
    flex: 1,
  };

  const bottomContainer = {
    bottom: 0,
    paddingVertical: sizes.paddings['1sm'] * 0.4,
    paddingHorizontal: sizes.paddings['2sm'] * 0.8,
    width: sizes.screens.width,
    borderTopWidth: sizes.borders['1md'] * 0.7,
    borderColor: isDarkMode ? colors.transparent.white_10 : colors.transparent.black_10,
    backgroundColor: ColorTheme().background,
    transform: [{ translateY: height }],
  }

  return (
    <View style={container}>
        <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ListMoments />
        {commentEnabled && (
            <Animated.View ref={bottomContainerRef} style={bottomContainer}>
                <Comments.Input
                    preview={false}
                    placeholder={t('Send Comment')}
                    color={isDarkMode ? colors.gray.white.toString() : colors.gray.black.toString()}
                    backgroundColor={String(isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01)}
                    autoFocus={showKeyboard? true: false}
                />
            </Animated.View>
        )}
    </View>
  );
}

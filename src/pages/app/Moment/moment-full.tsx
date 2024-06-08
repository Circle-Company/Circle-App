import React from 'react'
import { StatusBar,  useColorScheme, Keyboard, Animated } from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import RenderMomentFull from '../../../features/list-moments/components/render-moment-full'
import { Comments } from '../../../components/comment'
import FeedContext from '../../../contexts/Feed'
import { useKeyboardAnimation } from 'react-native-keyboard-controller'
import LanguageContext from '../../../contexts/Preferences/language'

export default function MomentFullScreen() {
    const { t } = React.useContext(LanguageContext)
  const isDarkMode = useColorScheme() === 'dark'
  const { focusedMoment } = React.useContext(FeedContext)
  const { height } = useKeyboardAnimation()
  const bottomContainerRef = React.useRef(null);

    const container  = {
        alignItems:'center',
        overflow: 'hidden',
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    }
    const bottomContainer = {
        bottom: 0,
        paddingVertical: sizes.paddings['1sm'] * 0.4,
        paddingHorizontal: sizes.paddings['2sm'] * 0.8,
        width: sizes.screens.width,
        borderTopWidth: sizes.borders['1md'] * 0.7,
        borderColor: isDarkMode ? colors.transparent.white_10 : colors.transparent.black_10,
        backgroundColor: ColorTheme().background,
        transform: [{ translateY: height }],
      };

    return (
        <View style={container}>
            <StatusBar translucent={false} backgroundColor={String(colors.gray.black)} barStyle={'light-content'}/>
            <RenderMomentFull momentData={focusedMoment} isFocused={true} fromFeed={true} fromAccount={false}/>
            <Animated.View ref={bottomContainerRef} style={bottomContainer}>
                <Comments.Input
                preview={false}
                placeholder={t('Send Comment')}
                color={isDarkMode ? colors.gray.white.toString() : colors.gray.black.toString()}
                backgroundColor={String(isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01)}
                autoFocus={false}
                />
            </Animated.View>                      
        </View>
    )
}
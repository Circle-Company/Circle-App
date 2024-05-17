import React from 'react'
import { StatusBar,  useColorScheme} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import MomentContext from '../../../components/moment/context'
import RenderMomentFull from '../../../features/list-moments/components/render-moment-full'
import { Comments } from '../../../components/comment'
import { Moment } from '../../../components/moment'

export default function MomentFullScreen() {
  const isDarkMode = useColorScheme() === 'dark'
  const { momentData } = React.useContext(MomentContext)

    const container  = {
        alignItems:'center',
        overflow: 'hidden',
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    }

    const bottom_container = {
        paddingVertical: sizes.paddings['1sm'] *0.4,
        paddingHorizontal: sizes.paddings['2sm'] * 0.8,
        width: sizes.screens.width,
        borderTopWidth: sizes.borders['1md'] * 0.7,
        borderColor: isDarkMode? colors.transparent.white_10 : colors.transparent.black_10,
    }

    return (
        <View style={container}>
            <StatusBar translucent={false} backgroundColor={String(colors.gray.black)} barStyle={'light-content'}/>
            <RenderMomentFull moment={momentData} focused={true} viewed={true}/>
            <View style={bottom_container}>
                <Moment.Root.Main data={momentData} sizes={sizes.moment.standart}>
                    <Comments.Input
                    preview={false}
                    color={ColorTheme().text.toString()}
                    backgroundColor={String( isDarkMode? colors.gray.grey_09 : colors.gray.grey_01)}
                    />             
                </Moment.Root.Main>                
            </View>
        </View>
    )
}
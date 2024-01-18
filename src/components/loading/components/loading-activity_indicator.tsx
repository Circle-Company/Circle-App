import React from 'react'
import { ActivityIndicator, View} from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import { LoadingProps } from '../loading-types'
import { MotiView } from '@motify/components'
import { useColorScheme } from 'react-native'

import Loading from '../../../assets/icons/svgs/loading.svg'

export default function activity_indicator({
    size = 30,
    interval = 20,
    from_color = String(ColorTheme().backgroundDisabled),
    to_color = String(ColorTheme().placeholder)
}: LoadingProps) {

    const isDarkMode = useColorScheme() === 'dark'

    return(
        <MotiView
        from={{
            width: size,
            height: size,
            borderRadius: size/2,
            borderWidth: size/17,
            borderColor: from_color
        }}
        animate={{
            width: size + interval,
            height: size + interval,
            borderRadius: (size + interval)/2,
            borderWidth: size/15,
            borderColor: to_color
        }}
        transition={{
            type: 'timing',
            duration: 2000,
            loop: true
        }}
            style={{
                width: size,
                height: size,
                borderRadius: size/2,
                borderWidth: size/10,
            }}
        />
        
    )        

}
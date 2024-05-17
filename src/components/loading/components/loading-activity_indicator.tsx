import React from 'react'
import ColorTheme from '../../../layout/constants/colors'
import { LoadingProps } from '../loading-types'
import { MotiView } from '@motify/components'
import Loading from '../../../assets/icons/svgs/loading.svg'

export default function activity_indicator({
    size = 30,
    color = ColorTheme().textDisabled.toString() + '50'
}: LoadingProps) {

    return (
        <MotiView
            from={{
                rotate: '0deg',
            }}
            animate={{
                rotate: '360deg', // Rotação completa em 360 graus
            }}
            transition={{
                type: 'timing',
                duration: 1000,
                repeatReverse: false,
                loop: true,
            }}
            style={{
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Loading width={size} height={size} fill={color}/>
        </MotiView>
    )
}

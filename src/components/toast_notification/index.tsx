import React from "react"
import { View, Text } from "react-native"
import sizes from "../../layout/constants/sizes"

import Check from '../../assets/icons/svgs/check.svg'
import Info from '../../assets/icons/svgs/info.svg'
import Warn from '../../assets/icons/svgs/warn.svg'
import Close from '../../assets/icons/svgs/close.svg'
import ColorTheme from "../../layout/constants/colors"

type ToastNotificationProps = {
    type: "success" | "info" | "warn" | "error",
    title: string,
    message: string
    children?: React.ReactNode
}

export default function ToastNotification ({
    type, 
    title,
    message,
    children
}: ToastNotificationProps) {

    const container:any = {
        position: 'absolute',
        top: 0,
        zIndex: 1,
        width: sizes.screens.width - (sizes.margins["3sm"]*2),
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["2md"],
        borderRadius: 17,
        backgroundColor: "#0E1917",
        flexDirection: "row"
    }
    const leftContainer:any = {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: sizes.paddings["1md"]
    }
    const rightContainer:any = {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center'
    }

    function Icon ()  {
        if(type == 'error') return <Close fill={String(ColorTheme().error)} width={20} height={20}/>
        if(type == 'success') return <Check fill={String(ColorTheme().success)} width={20} height={20}/>
        if(type == 'warn') return <Warn fill={String(ColorTheme().warning)} width={20} height={20}/>
        if(type == 'info') return <Info fill={String(ColorTheme().primary)} width={20} height={20}/>
    }
    return (
        <View style={container}>
            <View style={leftContainer}>
                <Icon/>
            </View>
            <View style={rightContainer}>
                <Text>{title}</Text>
                {children?
                    children
                    :
                    <Text>{message}</Text>
                }                
            </View>

            
        </View>
    )

}
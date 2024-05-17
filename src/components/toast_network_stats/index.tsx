import React from "react"
import sizes from "../../layout/constants/sizes"
import { View, Text } from "../Themed"
import Wifi from '../../assets/icons/svgs/wifi.svg'
import WifiOff from '../../assets/icons/svgs/wifi_slash.svg'
import ColorTheme, { colors } from "../../layout/constants/colors"
import { Loading } from "../loading"
import { useColorScheme, Animated} from "react-native"
import fonts from "../../layout/constants/fonts"
type ToastNotificationProps = {
    type: "ONLINE" | "OFFLINE" | "RECONNECTING",
    showStats: boolean
}

export default function ToastNetworkStats ({ type, showStats}: ToastNotificationProps) {

    const isDarkMode = useColorScheme() === 'dark'
    const position = React.useRef(new Animated.Value(-100)).current;


    function Color() {
        return (
            type == 'OFFLINE' && colors.red.red_05
            || type == 'ONLINE' && colors.green.green_05
            || type == 'RECONNECTING' && isDarkMode? colors.gray.grey_04 : colors.gray.grey_07            
        )
    }

    React.useEffect(() => {
        // Animação para mover a notificação para a posição 0
        Animated.timing(position, {
          toValue: 0,
          duration: 500, // Duração da animação em milissegundos
          useNativeDriver: false, // Precisa ser false para animações de layout
        }).start();
        
        setTimeout(() => {
            Animated.timing(position, {
              toValue: -100, // Recolhe de volta para a posição inicial acima da tela
              duration: 500,
              useNativeDriver: false,
            }).start(() => {
              // Limpar notificação após a animação de recolhimento
            });
          }, 4000);
      
      }, [showStats])
    
      if(showStats == false) return null

    const container:any = {
        ...sizes.toasts.small,
        position: 'absolute',
        top: 0,
        zIndex: 100,
        elevation: 1,
        paddingTop: sizes.paddings["1sm"] * 0.5,
        paddingHorizontal: sizes.paddings["1xl"],
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        shadowOpacity: 0,
        shadowColor: 'rgba(0, 0, 0, 0)',
        borderColor: isDarkMode? colors.gray.grey_07: colors.gray.grey_03,
        backgroundColor:isDarkMode? colors.gray.black : colors.gray.white,
    }

    const title: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: type == 'OFFLINE' && colors.red.red_05
        || type == 'ONLINE' && colors.green.green_05
        || type == 'RECONNECTING' && isDarkMode? colors.gray.grey_04 : colors.gray.grey_07
    }
    const leftContainer:any = {
        top: type == 'OFFLINE' ? -1 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: sizes.paddings["1md"]
    }
    const rightContainer:any = {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center'
    }

    const iconSize = 17

    function Icon ()  {
        if(type == 'OFFLINE') return <WifiOff fill={Color().toString()} width={iconSize} height={iconSize}/>
        if(type == 'ONLINE') return <Wifi fill={Color().toString()} width={iconSize} height={iconSize}/>
        if(type == 'RECONNECTING') return <Loading.ActivityIndicator color={Color().toString()} size={iconSize - 2}/>
    }

    function Title() {
        if(type == 'OFFLINE') return 'You are offline'
        if(type == 'ONLINE') return 'You are connected'
        if(type == 'RECONNECTING') return 'Restoring connection...'
    }
    return (
        <Animated.View style={[container, { top: position }]}>
            <View style={leftContainer}>
                <Icon/>
            </View>
            <View style={rightContainer}>
                <Text style={title}>{Title()}</Text>             
            </View>
        </Animated.View>
    )
}
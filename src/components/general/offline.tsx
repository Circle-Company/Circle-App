import React from "react"
import sizes from "../../layout/constants/sizes"
import ColorTheme from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import WifiIcon from '../../assets/icons/svgs/wifi_slash.svg'
import { Text, View} from "../Themed"
import LanguageContext from "../../contexts/Preferences/language"

type OfflineCardProps = {
    width?: number
    height?: number
}
export default function offlineCard({
    width = sizes.screens.width,
    height = sizes.screens.height - sizes.bottomTab.height
}: OfflineCardProps) {
    const {t} = React.useContext(LanguageContext)

    const container: any = {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
    }
    const text_style: any = {
        fontSize: fonts.size.headline,
        fontFamily: fonts.family.Semibold,
        color : ColorTheme().error
    }
    return (
        <View style={container}>
            <WifiIcon
                fill={String(ColorTheme().error)}
                width={60}
                height={60}
            />         
            <Text style={text_style}>{t('You are offline')}</Text>     
        </View>
    )
}
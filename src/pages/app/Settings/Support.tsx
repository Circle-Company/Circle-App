import React, {useRef} from 'react'
import { StatusBar,  useColorScheme, Linking, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import LanguageContext from '../../../contexts/Preferences/language'
import config from '../../../config'

export default function SupportScreen() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    const description_container: any = {
        paddingHorizontal: sizes.paddings['1md'],
        paddingVertical: sizes.paddings['2sm'],
    }

    const description_style: any = {
        lineHeight: 12,
        marginBottom: sizes.margins['2sm'],
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: 'justify'
    }

    const link_style: any = {
        textDecorationLine: 'underline',
        fontFamily: fonts.family['Semibold-Italic'],
        color: ColorTheme().primary
    }

    const textData = [
        t("When contributing to an open source project, it is essential to understand the project's license and adopt its code standards."),
        t('Testing and documentation are crucial to ensuring code stability and understandability.'),
        t('Be open to community feedback and break your contributions into manageable chunks.'),
        t('Respect existing code and closely monitor revisions.'),
        t('Above all, maintain ethical and collaborative conduct to promote a healthy environment in the open source community.'),
    ]

    const handlePress = () => { Linking.openURL(config.SUPPORT_URL) }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={description_container}>
                {textData.map((text, index) => {
                    return (
                        <Text key={index} style={description_style}>* {text}</Text>
                    )
                })}
            </View>
            <Pressable onPress={handlePress}>
                <Text style={link_style}>suporte@circlecompany.com.br</Text>
            </Pressable>
        </View>
    )
}
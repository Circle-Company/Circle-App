import React from 'react'
import { useColorScheme, Keyboard, TextInput, Animated, Easing } from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import Icon from '../../../assets/icons/svgs/check_circle.svg'
import ButtonStandart from '../../../components/buttons/button-standart'
import LanguageContext from '../../../contexts/Preferences/language'
import EditMemoryContext from '../edit_memory_context'
import MemoryContext from '../../../contexts/memory'

export default function titleMemory() {
    const { t } = React.useContext(LanguageContext)
    const {editTitle, setTitle, title} = React.useContext(EditMemoryContext)
    const isDarkMode = useColorScheme() === 'dark'
    const maxLength = 30

    const { memory } = React.useContext(MemoryContext)
    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false)
    const input_width = sizes.screens.width
    const animation = React.useRef(new Animated.Value(-sizes.headers.height * 0.8)).current // Initial value for animation

    const input_container = {
        zIndex: 2,
        width: input_width,
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
        backgroundColor: isDarkMode? colors.gray.grey_09 : colors.gray.grey_01,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"]* 0.7,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start'
    }

    const input_style : any = {
        top: 2,
        alignSelf: 'flex-start',
        fontFamily: fonts.family.Semibold,
        flex: 1,
        marginRight: sizes.margins['2sm'],
        color: ColorTheme().text
    }
    const bottom_style: any = {
        zIndex: 1,
        width: sizes.screens.width,
        height: sizes.headers.height * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
        paddingHorizontal: sizes.paddings["1md"]* 0.7,
        transform: [{ translateY: animation }]
    }

    const counter: any = {
        fontSize: fonts.size.caption1,
        color: maxLength == title.length? ColorTheme().error : ColorTheme().textDisabled,
    }

    const legend_style: any = {
        alignSelf: 'center',
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        flex: 1,
    }
    
    const button_text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: String(title !== memory.title && title ? colors.gray.white: isDarkMode? colors.gray.grey_06 : colors.gray.grey_04 + '80'),
    }

    const title_style: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled + '90',
        marginRight: sizes.margins['2sm']
    }

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardIsVisible(true)
            Animated.timing(animation, {
                toValue: 0, // Move it above the input
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardIsVisible(false)
            Animated.timing(animation, {
                toValue: -sizes.headers.height * 0.8, // Move it back to the bottom
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })
        return () => { keyboardDidShowListener.remove(); keyboardDidHideListener.remove() }
    }, [])

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setTitle(formattedText)
    }

    async function handlePress() {
        if(title !== memory.title && title) await editTitle()
    }

    return (
        <>
                <View style = {input_container}>
                    <Text style={title_style}>{t('Title')}:</Text>
                    <TextInput
                    value={title.toString()}
                    textAlignVertical="top"
                    multiline={false}
                    returnKeyType='done'
                    keyboardType='twitter'
                    onChangeText={handleInputChange}
                    maxLength={30}
                    style={input_style}
                    placeholder={t("memory title") + "..."}
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                    />
                    {keyboardIsVisible &&
                        <ButtonStandart
                        margins={false}
                        borderRadius={sizes.buttons.width/8}
                        width={sizes.buttons.width/4}
                        action={handlePress}
                        backgroundColor={String(title !== memory.title && title? colors.blue.blue_05: isDarkMode? colors.gray.grey_08 : colors.gray.grey_02)}
                        >
                        
                        <Text style={button_text}>{t('Confirm')}</Text>
                        </ButtonStandart>  
                    }     
                </View>


                <Animated.View style={bottom_style}>
                    <Text style={legend_style}>*{t('Memory title will be visible for all users to see')}</Text>
                    <Text style={counter}>{title.length}/{maxLength}</Text>
                </Animated.View> 
        </>
    )
}